import { initializeDiscordClient, startPeepoGifGenerator} from './discordService.js';
import { initializeOpenAI } from './peepoService.js';

await initializeDiscordClient();

initializeOpenAI();
setTimeout(async () => {
    await startPeepoGifGenerator();
}, 5000);

