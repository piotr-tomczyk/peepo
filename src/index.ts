import { initializeDiscordClient } from './discordService.js';
import { initializeOpenAI } from './peepoService.js';
import { startPeepoGifGenerator } from './utils.js';

initializeOpenAI();

initializeDiscordClient();

await startPeepoGifGenerator();


