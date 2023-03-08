import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from "openai";

dotenv.config();
export function initializeOpenAI() {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const openAIInstance = new OpenAIApi(configuration);

    if (!configuration.apiKey) {
        throw 'OpenAI API key not configured';
    }
    console.log('OpenAI initialized');

    return openAIInstance;
}
export async function generatePeepoResponse(openAIInstance: OpenAIApi, userData: UserData) {
    console.log('Generating Peepo response');
    try {
        return  (await openAIInstance.createChatCompletion({
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

export async function generatePeepoResponsewWithContext(openAIInstance: OpenAIApi, userData: UserData) {
    console.log('Generating Peepo context response');
    try {
        return  (await openAIInstance.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Pretend you are discord bot that is friend, not assistant and his name is \'peepo\'. ' +
                        pickPeepoVersion() +
                        'Don\'t say \'How can I help you\' at the end of a message.',
                },
                {
                    role: 'assistant',
                    content: userData.referenceMessageContent,
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
    const peepoVersion = getRandomInt(47);
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
        case 18:
            actPrompt = 'Act like a pirate';
            break;
        case 19:
            actPrompt = 'Act like an American';
            break;
        case 20:
            actPrompt = 'Act like a Fish'
            break;
        case 21:
            actPrompt = 'Act like a nerd'
            break;
        case 22:
            actPrompt = 'Act like a Micky Mouse'
            break;
        case 23:
            actPrompt = 'Act like an Roman King';
            break;
        case 24:
            actPrompt = 'Act like a Tree';
            break;
        case 25:
            actPrompt = 'Act like Shrek';
            break;
        case 26:
            actPrompt = 'Act like ATC KJFK Tower';
            break;
        case 27:
            actPrompt = 'Act like Piotr from Poland';
            break;
        case 28:
            actPrompt = 'Act like Lion king';
            break;
        case 29:
            actPrompt = 'Act like Lauren from NZ';
            break;
        case 30:
            actPrompt = 'Act like McD cashier';
            break;
        case 31:
            actPrompt = 'Act like Elon Musk';
            break;
        case 32:
            actPrompt = 'Act like u belong to TWICE';
            break;
        case 33:
            actPrompt = 'Act like you are drunk';
            break;
        case 34:
            actPrompt = 'Act like ATC EDDF Ground';
            break;
        case 35:
            actPrompt = 'Act like ATC LPPT Approach';
            break;
        case 36:
            actPrompt = 'Act like ATC EPGD Delivery';
            break;
        case 37:
            actPrompt = '';
            break;
        case 38:
            actPrompt = '';
            break;
        case 39:
            actPrompt = '';
            break;
        case 40:
            actPrompt = '';
            break;
        case 41:
            actPrompt = '';
            break;
        case 42:
            actPrompt = '';
            break;
        case 43:
            actPrompt = '';
            break;
        case 44:
            actPrompt = 'Act like Obama';
            break;
        case 45:
            actPrompt = 'Act like Obama';
            break;
        case 46:
            actPrompt = 'Act like Obama';
            break;
    }
    return actPrompt;
}

export interface UserData {
    messageContent: string,
    referenceMessageContent?: string,
    username: string,
}
