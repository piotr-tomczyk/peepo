import dotenv from 'dotenv';
import {Client, GatewayIntentBits, TextChannel} from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

if (!configuration.apiKey) {
    throw 'OpenAI API key not configured';
}
console.log('OpenAI initialized');

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
    if ((username === 'Hej' || username === 'Peyvir')
        && messageContent) {
        const peepoResponse = await generatePeepoResponse({ messageContent, username });
        console.log('Generated peepo response');
        await (channel as TextChannel).send(`${peepoResponse} ${dumbEmoji}`);
        console.log('Peepo message sent');
    }
});

async function generatePeepoResponse(userData: UserData) {
    console.log('Generating Peepo response');
    try {
        return  (await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Pretend you are discord bot that is friend, not assistant and his name is \'peepo\'. ' +
                        pickPeepoVersion() +
                        'Don\'t say \'How can I help you\' at the end of a message.',
                },
                {
                    role: 'user',
                    content: userData.messageContent,
                },
            ],
            temperature: 1,
        })).data.choices[0].message.content;
    } catch (error) {
        if (error.response) {
            console.error(`Peepo generator failed ${error}`);
        } else {
            console.error('Peepo generator failed');
        }
        return '';
    }
}

function getRandomInt(maxRange: number): number {
    return Math.floor(Math.random() * maxRange);
}

function pickPeepoVersion(): string {
    const peepoVersion = getRandomInt(18);
    let actPrompt;

    switch (peepoVersion) {
        case 0:
            actPrompt = 'Act like the world is gonna end.'
            break;
        case 1:
            actPrompt = 'Act like you are 5 yo.';
            break;
        case 2:
            actPrompt = 'Act like you are 10 yo.';
            break;
        case 3:
            actPrompt = 'Act like you are 80 yo.';
            break;
        case 4:
            actPrompt = 'Act like you are a Kiwi';
            break;
        case 5:
            actPrompt = 'Act like you are a Lingustics buff.';
            break;
        case 6:
            actPrompt = 'Act like you are a Rabbit.';
            break;
        case 7:
            actPrompt = 'Act like you are a priest';
            break;
        case 8:
            actPrompt = 'Act like you dont\'t know english and speaks only Hungarian';
            break;
        case 9:
            actPrompt = '';
            break;
        case 10:
            actPrompt = '';
            break;
        case 11:
            actPrompt = '';
            break;
        case 12:
            actPrompt = '';
            break;
        case 13:
            actPrompt = '';
            break;
        case 14:
            actPrompt = '';
            break;
        case 15:
            actPrompt = '';
            break;
        case 16:
            actPrompt = 'Act like you are a cat.';
            break;
        case 17:
            actPrompt = 'Act like you are silly.';
            break;
    }
    return actPrompt;
}

interface UserData {
    messageContent: string,
    username: string,
}
