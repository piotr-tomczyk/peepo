import { initializeDiscordClient } from './discordService.js';
import { initializeOpenAI } from './peepoService.js';

initializeOpenAI();

await initializeDiscordClient();

