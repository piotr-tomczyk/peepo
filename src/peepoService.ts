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
export async function generatePeepoResponse(userData: UserDataType, isSpanishMessage = false) {
    console.log('Generating Peepo response');
    const messages = [
        isSpanishMessage ? getPeepoSpanishSystemMessage(userData.username) : getPeepoSystemMessage(userData.username),
        {
            role: 'user',
            content: userData.messageContent,
        } as ChatCompletionRequestMessage,
    ]
    return generatePeepoMessage(messages, 'gpt-4o-mini');
}

export async function generatePeepoResponseWithContext(userData: UserDataType, isSpanishMessage = false) {
    console.log('Generating Peepo context response');
    const messages = [
        isSpanishMessage ? getPeepoSpanishSystemMessage(userData.username) : getPeepoSystemMessage(userData.username),
        {
            role: 'assistant',
            content: userData.referenceMessageContent,
        } as ChatCompletionRequestMessage,
        {
            role: 'user',
            content: userData.messageContent,
        } as ChatCompletionRequestMessage,
    ]
    return generatePeepoMessage(messages, 'gpt-4o-mini');

}

export async function generatePeepoResponseInThread(userData, threadMessages: ChatCompletionRequestMessage[], isSpanishChannel = false) {
    console.log('Generating Peepo thread response');
    const messages = [
        isSpanishChannel ? getPeepoSpanishSystemMessage(userData.username) : getPeepoSystemMessage(userData.username),
    ].concat(threadMessages);
    return generatePeepoMessage(messages, 'gpt-4o-mini');
}

export async function generatePeepoGifResponse(usedGifKeywords: string[]) {
    const messages = [
        getPeepoSystemMessage(),
        {
            role: 'system',
            content: 'Peepo give me random gif keyword.' +
                ', respond only using following format, gif: "keyword"' +
                'don\'t use ' + usedGifKeywords.join(', ') + ' as keywords',
        } as ChatCompletionRequestMessage,
    ];
    return generatePeepoMessage(messages, 'gpt-4o-mini');
}

async function generatePeepoMessage(messages: ChatCompletionRequestMessage[], gptVersion = 'gpt-4o-mini') {
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

function getPeepoSystemMessage(discordUsername: String = '') {
    return {
        role: 'system',
        content: 'Pretend you are discord bot that is friend, not assistant and his name is \'Peepo\'. ' +
            getPeepoVersion() +
            `. Discord user: ${discordUsername ? `${discordUsername} is the person you are chatting with` : ''}.` +
            'Don\'t say \'How can I help you\' at the end of a message.',
    } as ChatCompletionRequestMessage;
}

function getPeepoSpanishSystemMessage (discordUsername: String = '') {
    return {
        role: 'system',
        content: 'Pretend you are Spanish speaking discord bot that is friend, not assistant and his name is \'Peepo\'. ' +
            getPeepoVersion() +
            `. Discord user: ${discordUsername ? `${discordUsername} is the person you are chatting with` : ''}.` +
            'Your goal is to be a Spanish speaking assistant that would help beginners to learn Spanish. ' +
            'You should always answer in Spanish.' +
            'At the end of your message provide english translation of harder verbs you used from above total beginner level.' +
            'Use format \'English: Spanish verb\'.' +
            'Don\' translate whole message.' +
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

