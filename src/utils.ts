import { sendPeepoGifMessage } from './discordService.js';

const TWO_HOURS = 1000 * 3600 * 2
export async function startPeepoGifGenerator() {
    await sendPeepoGifMessage();
    setInterval(async () => {
        await sendPeepoGifMessage();
    }, TWO_HOURS);
}

export function getRandomInt(maxRange: number): number {
    return Math.floor(Math.random() * maxRange);
}

export interface UserData {
    messageContent: string,
    referenceMessageContent?: string,
    username: string,
}
