import dotenv from 'dotenv';
import {
    Client,
    GatewayIntentBits,
    TextChannel, ThreadChannel, User,
} from 'discord.js';
import {
    initializeOpenAI,
    generatePeepoResponse,
    generatePeepoResponseWithContext,
    generatePeepoResponseInThread,
    generatePeepoGifResponse,
} from './peepoService.js';
import { ChatCompletionRequestMessage } from 'openai';
import axios from 'axios';

dotenv.config();

const openAIInstance = initializeOpenAI();

const TEXT_CHANNEL_ID = process.env.TEXT_CHANNEL_ID;
const GIF_CHANNEL_ID = process.env.GIF_CHANNEL_ID;


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.MessageContent,
    ],
});

client.login(process.env.DISCORD_TOKEN);
console.log('Discord bot initialized');

await startPeepoGifGenerator();

client.on("messageCreate", async (message) => {
    const channelId = message.channelId;
    const messageChannel = client.channels.cache.get(channelId);
    const mainChannel = client.channels.cache.get(TEXT_CHANNEL_ID);

    const isMessageChannelAThread = messageChannel.isThread();

    if (isMessageChannelAThread
        && messageChannel.parentId !== TEXT_CHANNEL_ID) {
        return;
    } else if (!isMessageChannelAThread
        && channelId !== TEXT_CHANNEL_ID) {
        return;
    }

    console.log('Received message');
    const dumbEmoji = message.guild.emojis.cache.get('1014860400564650044');
    const author = message.author;
    const messageContent = message.content;
    const messageReference = message.reference;

    if (messageReference) {
        await sendPeepoReferenceMessage(author, messageContent, mainChannel, dumbEmoji, messageReference);
        return;
    }

    if (isMessageChannelAThread) {
        const threadMessages = await getThreadMessages(messageChannel);
        await sendPeepoThreadMessage(threadMessages, author, messageContent, messageChannel, dumbEmoji);
        return;
    }

    await sendPeepoNormalMessage(author, messageContent, mainChannel, dumbEmoji);
});

async function sendPeepoNormalMessage(author: User, messageContent, channel, dumbEmoji,) {
    const canSendMessage = !author.bot
        && messageContent;
    if (canSendMessage) {
        const peepoResponse = await generatePeepoResponse(
            openAIInstance,
            {
                messageContent,
                username: author.username
            }
        );
        console.log('Generated peepo response');
        await (channel as TextChannel).send(`${peepoResponse} ${dumbEmoji}`);
        console.log('Peepo message sent');
    }
}

async function  sendPeepoReferenceMessage(author: User, messageContent, channel, dumbEmoji, messageReference) {
    const referenceMessageContent = (await channel.messages.fetch(messageReference.messageId)).content;
    const canSendMessage = !author.bot
        && messageContent
        && referenceMessageContent;
    if (canSendMessage) {
        const peepoResponse = await generatePeepoResponseWithContext(
            openAIInstance,
            {
                messageContent,
                referenceMessageContent,
                username: author.username,
            }
        );
        console.log('Generated peepo context response');
        await (channel as TextChannel).send(`${peepoResponse} ${dumbEmoji}`);
        console.log('Peepo context message sent');
    }
}

async function sendPeepoThreadMessage(threadMessages, author, messageContent, channel, dumbEmoji) {
    const canSendMessage = !author.bot
        && messageContent
        && threadMessages;
    if (canSendMessage) {
        const peepoResponse = await generatePeepoResponseInThread(
            openAIInstance,
            threadMessages,
        );
        console.log('Generated peepo thread response');
        await (channel as ThreadChannel).send(`${peepoResponse} ${dumbEmoji}`);
        console.log('Peepo thread message sent');
    }
}

async function sendPeepoGifMessage() {
    const peepoResponse = await generatePeepoGifResponse(openAIInstance);
    const gifRegex = /"([^"]+)"/;
    const gifKeyword = peepoResponse.match(gifRegex);
    let tenorQuery;
    if (gifKeyword) {
        tenorQuery = gifKeyword[1];
    } else {
        tenorQuery = peepoResponse;
    }
    try {
        const gifChannel = client.channels.cache.get(GIF_CHANNEL_ID);
        const tenorApiKey = process.env.TENOR_API_KEY;
        const tenorLimit = 1;
        const tenorMediaFilter = 'gif';
        const tenorUrl = `https://tenor.googleapis.com/v2/search?q=${tenorQuery}&key=${tenorApiKey}&limit=${tenorLimit}&media_filter=${tenorMediaFilter}`;
        const gifResponse: any = await axios.get(tenorUrl);
        const gif = gifResponse.data?.results?.[0].url;
        await (gifChannel as TextChannel).send(`${gif}`);
    } catch(error) {
        console.log('Error while fetching gif', error);
    }
}

async function getThreadMessages(threadChannel: ThreadChannel) {
    const messageCollection = await threadChannel.messages.fetch();
    const threadMessages = [];

    for (const collectionMessage of messageCollection) {
        const message = collectionMessage[1];
        if (message.reference && message.reference.channelId !== threadChannel.id) {
            const referenceMessageChannel = client.channels.cache.get(message.reference.channelId ) as TextChannel;
            message.content = (await referenceMessageChannel.messages.fetch(message.reference.messageId)).content;
        }
        threadMessages.push({
            role: message.author.bot ? 'assistant' : 'user',
            content: `${message.content}`,
        } as ChatCompletionRequestMessage);
    }

    return threadMessages.length < 5 ? threadMessages.reverse() : threadMessages.reverse().slice(-7);
}

async function startPeepoGifGenerator() {
    await sendPeepoGifMessage();
    setInterval(async () => {
        await sendPeepoGifMessage();
    }, 1000 * 3600);
}
