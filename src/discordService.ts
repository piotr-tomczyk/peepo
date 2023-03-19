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
const TWO_HOURS = 1000 * 3600 * 2
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
    await startPeepoGifGenerator();
}


async function handleDiscordMessageEvent(discordMessage) {
    const messageChannelId = discordMessage.channelId;
    const messageChannel = await getDiscordChannelFromId(messageChannelId);
    const mainChannel = await getDiscordChannelFromId(TEXT_CHANNEL_ID);

    const isMessageChannelAThread = messageChannel.isThread();

    if (isMessageChannelAThread
        && messageChannel.parentId !== TEXT_CHANNEL_ID) {
        return;
    } else if (!isMessageChannelAThread
        && messageChannelId !== TEXT_CHANNEL_ID) {
        return;
    }

    console.log('Received message');
    const author = discordMessage.author;
    const messageContent = discordMessage.content;
    const messageReference = discordMessage.reference;

    if (messageReference) {
        await sendPeepoReferenceMessage(author, messageContent, mainChannel, messageReference);
        return;
    }

    if (isMessageChannelAThread) {
        const threadMessages = await getThreadMessages(messageChannel);
        await sendPeepoThreadMessage(threadMessages, author, messageContent, messageChannel);
        return;
    }

    await sendPeepoNormalMessage(author, messageContent, mainChannel);
}

async function sendPeepoNormalMessage(author: User, messageContent, channel) {
    const canSendDiscordMessage = !author.bot
        && messageContent;
    if (canSendDiscordMessage) {
        const peepoResponse = await generatePeepoResponse(
            {
                messageContent,
                username: author.username
            }
        );
        console.log('Generated peepo response');
        await sendDiscordMessage(channel, peepoResponse);
        console.log('Peepo message sent');
    }
}

async function  sendPeepoReferenceMessage(author: User, messageContent, channel, messageReference) {
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
            }
        );
        console.log('Generated peepo context response');
        await sendDiscordMessage(channel, peepoResponse);
        console.log('Peepo context message sent');
    }
}

async function sendPeepoThreadMessage(threadMessages, author, messageContent, channel) {
    const canSendDiscordMessage = !author.bot
        && messageContent
        && threadMessages;
    if (canSendDiscordMessage) {
        const peepoResponse = await generatePeepoResponseInThread(threadMessages);
        console.log('Generated peepo thread response');
        await sendDiscordMessage(channel, peepoResponse);
        console.log('Peepo thread message sent');
    }
}

export async function sendPeepoGifMessage() {
    const peepoResponse = await generatePeepoGifResponse();
    const gifRegex = /"([^"]+)"/;
    const gifKeyword = peepoResponse.match(gifRegex);
    const gifChannel = discordClient.channels.cache.get(GIF_CHANNEL_ID);
    let tenorQuery;

    if (gifKeyword) {
        tenorQuery = gifKeyword[1];
    } else {
        tenorQuery = peepoResponse;
    }

    try {
        const tenorApiKey = process.env.TENOR_API_KEY;
        const tenorLimit = 1;
        const tenorMediaFilter = 'gif';
        const tenorUrl = `https://tenor.googleapis.com/v2/search?q=${tenorQuery}&key=${tenorApiKey}&limit=${tenorLimit}&media_filter=${tenorMediaFilter}`;
        const gifResponse: any = await axios.get(tenorUrl);
        const gif = gifResponse.data?.results?.[0].url;
        await sendDiscordMessage(gifChannel, gif);

    } catch(error) {
        await sendDiscordMessage(gifChannel, 'I failed the gif :Dedge:');
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

async function startPeepoGifGenerator() {
    await sendPeepoGifMessage();
    setInterval(async () => {
        await sendPeepoGifMessage();
    }, TWO_HOURS);
}

export async function sendDiscordMessage(channel: TextChannel | ThreadChannel, message: String) {
    try {
        await (channel as TextChannel | ThreadChannel).send(`${message}`);
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
