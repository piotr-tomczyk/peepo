import dotenv from 'dotenv';
import {
    Client,
    GatewayIntentBits,
    TextChannel,
    ThreadChannel, User
} from 'discord.js';
import {
    generatePeepoGifResponse,
    generatePeepoResponse,
    generatePeepoResponseInThread,
    generatePeepoResponseWithContext
} from './peepoService.js';
import axios from 'axios';
import { ChatCompletionRequestMessage } from 'openai';

let discordClient;
const TEXT_CHANNEL_ID = process.env.TEXT_CHANNEL_ID;
const GIF_CHANNEL_ID = process.env.GIF_CHANNEL_ID;
const SPANISH_CHANNEL_ID = process.env.SPANISH_CHANNEL_ID;
const TWO_HOURS = 1000 * 3600 * 2;

const usedGifKeywords = [];

export async function initializeDiscordClient() {
    dotenv.config();
    discordClient = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildEmojisAndStickers,
            GatewayIntentBits.MessageContent,
        ],
    });

    discordClient.login(process.env.DISCORD_TOKEN);
    console.log('Discord client initialized');

    discordClient.on('messageCreate', handleDiscordMessageEvent);
}


async function handleDiscordMessageEvent(discordMessage) {
    const messageChannelId = discordMessage.channelId;
    const messageChannel = await getDiscordChannelFromId(messageChannelId);
    const isMainChannel = messageChannelId === TEXT_CHANNEL_ID;
    const isSpanishChannel = messageChannelId === SPANISH_CHANNEL_ID;

    const isMessageChannelAThread = messageChannel.isThread();

    if (isMessageChannelAThread
        && messageChannel.parentId !== TEXT_CHANNEL_ID
        && messageChannel.parentId !== SPANISH_CHANNEL_ID) {
        return;
    } else if (!isMessageChannelAThread
        && messageChannelId !== TEXT_CHANNEL_ID
        && messageChannelId !== SPANISH_CHANNEL_ID) {
        return;
    } else if (!discordMessage.author) {
        return;
    }

    console.log('Received message');
    const author = discordMessage.author;
    const messageContent = discordMessage.content;
    const messageReference = discordMessage.reference;

    if (isMessageChannelAThread) {
        const threadMessages = await getThreadMessages(messageChannel);
        await sendPeepoThreadMessage(threadMessages, author, messageContent, messageChannel, isSpanishChannel);
        return;
    }

    if (messageReference) {
        await sendPeepoReferenceMessage(
            author,
            messageContent,
            messageChannel,
            messageReference,
            isSpanishChannel,
        );
        return;
    }

    if (isMainChannel) {
        await sendPeepoNormalMessage(author, messageContent, messageChannel);
    }

    if (isSpanishChannel) {
        await sendPeepoNormalMessage(author, messageContent, messageChannel, true);
    }
}

async function sendPeepoNormalMessage(author: User, messageContent, channel, isSpanishMessage = false) {
    const canSendDiscordMessage = !author.bot
        && messageContent;
    if (canSendDiscordMessage) {
        const peepoResponse = await generatePeepoResponse(
            {
                messageContent,
                username: author.username
            },
            isSpanishMessage
        );
        console.log('Generated peepo response');
        await sendDiscordMessage(channel, peepoResponse);
        console.log('Peepo message sent');
    }
}

async function sendPeepoReferenceMessage(author: User, messageContent, channel, messageReference, isSpanishMessage = false) {
    const referenceMessageContent = (await channel.messages.fetch(messageReference.messageId)).content;
    const canSendDiscordMessage = !author.bot
        && messageContent
        && referenceMessageContent;
    if (canSendDiscordMessage) {
        const peepoResponse = await generatePeepoResponseWithContext(
            {
                messageContent,
                referenceMessageContent,
                username: author.username,
            },
            isSpanishMessage,
        );
        console.log('Generated peepo context response');
        await sendDiscordMessage(channel, peepoResponse);
        console.log('Peepo context message sent');
    }
}

async function sendPeepoThreadMessage(threadMessages, author, messageContent, channel, isSpanishChannel = false) {
    const canSendDiscordMessage = !author.bot
        && messageContent
        && threadMessages;
    if (canSendDiscordMessage) {
        const userData = {
            username: author.username,
        };
        const peepoResponse = await generatePeepoResponseInThread(userData, threadMessages, isSpanishChannel);
        console.log('Generated peepo thread response');
        await sendDiscordMessage(channel, peepoResponse);
        console.log('Peepo thread message sent');
    }
}

export async function sendPeepoGifMessage() {
    const peepoResponse = await generatePeepoGifResponse(usedGifKeywords);
    const gifChannel = await getDiscordChannelFromId(GIF_CHANNEL_ID);

    if (!peepoResponse) {
        const dedgeEmote = getDiscordEmote('Dedge');
        await sendDiscordMessage(gifChannel, `I failed the gif ${dedgeEmote || ':Dedge:'}`);
        return;
    }

    const gifRegex = /"([^"]+)"/;
    const gifKeyword = peepoResponse.match(gifRegex);
    let tenorQuery;

    if (gifKeyword) {
        tenorQuery = gifKeyword[1];
    } else {
        tenorQuery = peepoResponse;
    }

    pushKeywordToUsedKeywords(tenorQuery);

    try {
        const tenorApiKey = process.env.TENOR_API_KEY;
        const tenorLimit = 3;
        const tenorMediaFilter = 'gif';
        const tenorUrl = `https://tenor.googleapis.com/v2/search?q=${tenorQuery}&key=${tenorApiKey}&limit=${tenorLimit}&media_filter=${tenorMediaFilter}`;
        const gifResponse: any = await axios.get(tenorUrl);
        const gif = gifResponse.data?.results?.[Math.floor(Math.random() * (tenorLimit - 1))].url;
        await sendDiscordMessage(gifChannel, gif);

    } catch(error) {
        const dedgeEmote = getDiscordEmote('Dedge');
        await sendDiscordMessage(gifChannel, `I failed the gif ${dedgeEmote || ':Dedge:'}`);
        console.log('Error while fetching gif', error);
    }
}

async function getThreadMessages(threadChannel: ThreadChannel) {
    const messageCollection = await threadChannel.messages.fetch();
    const threadMessages = [];

    for (const collectionMessage of messageCollection) {
        const message = collectionMessage[1];
        if (message.reference && message.reference.channelId !== threadChannel.id) {
            const referenceMessageChannel = await getDiscordChannelFromId(message.reference.channelId ) as TextChannel;

            message.content = (await referenceMessageChannel.messages.fetch(message.reference.messageId)).content;
        }
        threadMessages.push({
            role: message.author.bot ? 'assistant' : 'user',
            content: `${message.content}`,
        } as ChatCompletionRequestMessage);
    }

    return threadMessages.length < 7 ? threadMessages.reverse() : threadMessages.splice(0, 7);
}

function pushKeywordToUsedKeywords(keyword) {
    if (usedGifKeywords.length > 5) {
        usedGifKeywords.shift();
    }
    usedGifKeywords.push(keyword);
}

export async function startPeepoGifGenerator() {
    if (discordClient) {
        await sendPeepoGifMessage();
    }

    setInterval(async () => {
        if (discordClient) {
            await sendPeepoGifMessage();
        }
    }, TWO_HOURS);
}

export async function sendDiscordMessage(channel, message: String) {
    try {
        await channel.send(`${message}`);
    } catch (error) {
        console.log(`Peepo failed to send a message: ${message}.`, error);
    }
}

export async function getDiscordChannelFromId(channelId: string) {
    return discordClient.channels.cache.get(channelId);
}

export async function getTextChannel() {
    return discordClient.channels.cache.get(TEXT_CHANNEL_ID);
}

export function getDiscordEmote(emoteName) {
    return discordClient.emojis.cache.find(emoji => emoji.name === emoteName);
}
