import dotenv from 'dotenv';
import {
    ChatCompletionRequestMessage,
    Configuration,
    OpenAIApi
} from 'openai';
import { peepoVersions } from './peepoVersions.js';

dotenv.config();

let currentDay = Date.now();
let peepoVersion = peepoVersions['default'];
export function initializeOpenAI() {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const openAIInstance = new OpenAIApi(configuration);

    if (!configuration.apiKey) {
        throw 'OpenAI API key not configured';
    }
    console.log('OpenAI initialized');

    generateNewPeepoVersion();

    return openAIInstance;
}
export async function generatePeepoResponse(openAIInstance: OpenAIApi, userData: UserData) {
    console.log('Generating Peepo response');
    const messages = [
        getPeepoSystemMessage(),
        {
            role: 'user',
            content: userData.messageContent,
        } as ChatCompletionRequestMessage,
    ]
    return generatePeepoMessage(openAIInstance, messages);
}

export async function generatePeepoResponseWithContext(openAIInstance: OpenAIApi, userData: UserData) {
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
    return generatePeepoMessage(openAIInstance, messages);

}

export async function generatePeepoResponseInThread(openAIInstance: OpenAIApi, threadMessages: ChatCompletionRequestMessage[]) {
    console.log('Generating Peepo thread response');
    const messages = [getPeepoSystemMessage()].concat(threadMessages);
    return generatePeepoMessage(openAIInstance, messages);
}

async function generatePeepoMessage(openAIInstance: OpenAIApi, messages: ChatCompletionRequestMessage[]) {
    try {
        return (await openAIInstance.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages,
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

function getPeepoSystemMessage() {
    return {
        role: 'system',
        content: 'Pretend you are discord bot that is friend, not assistant and his name is \'peepo\'. ' +
            pickPeepoVersion() +
            'Don\'t say \'How can I help you\' at the end of a message.',
    } as ChatCompletionRequestMessage;
}

function getRandomInt(maxRange: number): number {
    return Math.floor(Math.random() * maxRange);
}

function pickPeepoVersion(): string {
    if (Date.now() - currentDay < 1000 * 3600 * 24) {
        return peepoVersion;
    }
    generateNewPeepoVersion();
    currentDay = Date.now();
    return peepoVersion;
}

function generateNewPeepoVersion() {
    const peepoVersionKeys = Object.keys(peepoVersions);
    peepoVersion = peepoVersions[peepoVersionKeys[getRandomInt(peepoVersionKeys.length)]];
}

export interface UserData {
    messageContent: string,
    referenceMessageContent?: string,
    username: string,
}
