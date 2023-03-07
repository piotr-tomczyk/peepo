import dotenv from 'dotenv';
import {
    Client,
    GatewayIntentBits,
    TextChannel,
} from 'discord.js';
import {
    initializeOpenAI,
    generatePeepoResponse,
    generatePeepoResponsewWithContext,
} from './peepoService.js';

dotenv.config();

const openAIInstance = initializeOpenAI();

const CHANNEL_ID = process.env.CHANNEL_ID;

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

client.on("messageCreate", async (message) => {
    const channelId = message.channelId;
    if (channelId !== CHANNEL_ID) {
        return;
    }
    console.log('Received message');
    const dumbEmoji = message.guild.emojis.cache.get('1014860400564650044');
    const channel = client.channels.cache.get(CHANNEL_ID);
    const username = message.author.username;
    const messageContent = message.content;
    const messageReference = message.reference;

    if (messageReference) {
        await sendPeepoReferenceMessage(username, messageContent, channel, dumbEmoji, messageReference);
        return;
    }

    await sendPeepoNormalMessage(username, messageContent, channel, dumbEmoji);
});

async function sendPeepoNormalMessage(username, messageContent, channel, dumbEmoji,) {
    const canSendMessage = (username === 'Hej' || username === 'Peyvir')
        && messageContent;
    if (canSendMessage) {
        const peepoResponse = await generatePeepoResponse(openAIInstance, { messageContent, username });
        console.log('Generated peepo response');
        await (channel as TextChannel).send(`${peepoResponse} ${dumbEmoji}`);
        console.log('Peepo message sent');
    }
}

async function  sendPeepoReferenceMessage(username, messageContent, channel, dumbEmoji, messageReference) {
    const referenceMessageContent = (await channel.messages.fetch(messageReference.messageId)).content;
    const canSendMessage = (username === 'Hej' || username === 'Peyvir')
        && messageContent
        && referenceMessageContent;
    if (canSendMessage) {
        const peepoResponse = await generatePeepoResponsewWithContext(
            openAIInstance,
            {
                messageContent,
                referenceMessageContent,
                username
            }
        );
        console.log('Generated peepo context response');
        await (channel as TextChannel).send(`${peepoResponse} ${dumbEmoji}`);
        console.log('Peepo context message sent');
    }
}
