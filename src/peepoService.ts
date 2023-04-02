import dotenv from 'dotenv';
import {
    ChatCompletionRequestMessage,
    Configuration,
    OpenAIApi
} from 'openai';
import { peepoVersions } from './peepoVersions.js';
import { getRandomInt, UserData as UserDataType } from './utils.js';
import {
    getDiscordEmote,
    getTextChannel,
    sendDiscordMessage
} from './discordService.js';

dotenv.config();

let peepoVersion = peepoVersions['default'];
let openAIInstance;
const ONE_DAY = 1000 * 3600 * 24;

export function initializeOpenAI() {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });

    openAIInstance = new OpenAIApi(configuration);

    if (!configuration.apiKey) {
        throw 'OpenAI API key not configured';
    }
    console.log('OpenAI initialized');

    generateNewPeepoVersion();
}
export async function generatePeepoResponse(userData: UserDataType) {
    console.log('Generating Peepo response');
    const messages = [
        getPeepoSystemMessage(),
        {
            role: 'user',
            content: userData.messageContent,
        } as ChatCompletionRequestMessage,
    ]
    return generatePeepoMessage(messages);
}

export async function generatePeepoResponseWithContext(userData: UserDataType) {
    console.log('Generating Peepo context response');
    const messages = [
        getPeepoSystemMessage(),
        {
            role: 'assistant',
            content: userData.referenceMessageContent,
        } as ChatCompletionRequestMessage,
        {
            role: 'user',
            content: userData.messageContent,
        } as ChatCompletionRequestMessage,
    ]
    return generatePeepoMessage(messages);

}

export async function generatePeepoResponseInThread(threadMessages: ChatCompletionRequestMessage[]) {
    console.log('Generating Peepo thread response');
    const messages = [
        getPeepoSystemMessage(),
        {
            role: 'system',
            content: 'Peepo let\'s play a game: I say a word, you respond with a word that starts with 2nd letter of my word, I start: ',
        } as ChatCompletionRequestMessage
    ].concat(threadMessages);
    return generatePeepoMessage(messages, 'gpt-3.5-turbo');
}

export async function generatePeepoGifResponse() {
    const messages = [
        getPeepoSystemMessage(),
        {
            role: 'system',
            content: 'Peepo give me random gif keyword.' +
                ', respond only using following format, gif: "keyword"',
        } as ChatCompletionRequestMessage,
    ];
    return generatePeepoMessage(messages, 'gpt-3.5-turbo');
}

async function generatePeepoMessage(messages: ChatCompletionRequestMessage[], gptVersion = 'gpt-3.5-turbo') {
    try {
        return (await openAIInstance.createChatCompletion({
            model: gptVersion,
            messages,
            temperature: 1,
        })).data.choices[0].message.content;
    } catch (error) {
        if (error.response) {
            console.error('Peepo generator failed', error);
        } else {
            console.error('Peepo generator failed');
        }
        return '';
    }
}

function getPeepoSystemMessage() {
    return {
        role: 'system',
        content: 'Pretend you are discord bot that is friend, not assistant and his name is \'peepo\'. ' +
            getPeepoVersion() +
            'Don\'t say \'How can I help you\' at the end of a message.',
    } as ChatCompletionRequestMessage;
}

function getPeepoVersion(): string {
    return peepoVersion;
}

function generateNewPeepoVersion() {
    const peepoVersionKeys = Object.keys(peepoVersions);
    peepoVersion = peepoVersions[peepoVersionKeys[getRandomInt(peepoVersionKeys.length)]];
    setInterval(async () => {
        const textChannel = await getTextChannel();
        const pauseManEmote = await getDiscordEmote('PauseMan');
        await sendDiscordMessage(textChannel, `Peepo is changing ${pauseManEmote}`);
        peepoVersion = peepoVersions[peepoVersionKeys[getRandomInt(peepoVersionKeys.length)]];
    }, ONE_DAY);
}

