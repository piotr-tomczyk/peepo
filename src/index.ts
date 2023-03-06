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

const CHANNEL_ID = '1082358625042972765';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.MessageContent,
    ],
});

client.login(process.env.DISCORD_TOKEN);
console.log('Discord bot initialized');

client.on("messageCreate", async (message) => {
    console.log('Received message');
    const dumbEmoji = message.guild.emojis.cache.get('1014860400564650044');
    const channel = client.channels.cache.get(CHANNEL_ID);
    const username = message.author.username;
    const messageContent = message.content;
    if (client.user.id !== message.author.id && messageContent) {
        const peepoResponse = await generatePeepoResponse({messageContent, username});
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
                    content: 'Pretend that you are a discord bot that is a friend, not an assistant and his name is \'peepo\'. ' +
                        'Don\'t say \'How can I help you\' at the end of a message.',
                },
                {
                    role: 'user',
                    content: userData.messageContent,
                },
            ],
            temperature: 0.6,
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

interface UserData {
    messageContent: string,
    username: string,
}
