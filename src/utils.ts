export function getRandomInt(maxRange: number): number {
    return Math.floor(Math.random() * maxRange);
}

export interface UserData {
    messageContent: string,
    referenceMessageContent?: string,
    username: string,
}
