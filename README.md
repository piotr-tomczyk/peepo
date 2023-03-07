# Chat GPT 3.5 Peepo discord bot 
## Prerequisites
Discord Application and bot created on https://discord.com/developers/docs/intro. Good guide -> https://www.youtube.com/watch?v=Oy5HGvrxM4o
OpenAI API key. https://platform.openai.com/overview
PNPM installed on your system
Node version 18+
## How to set it up?
Run ```pnpm i``` to install the dependencies.
Assign correct values to variables in ```.env.example``` and rename the file to ```.env```.
```DISCORD_TOKEN``` is the token generated in Discord application
```OPENAI_API_KEY``` is the API key to OpenAI
```CHANNEL_ID``` is the ID of the channel you want your bot to be on
Run ```pnpm dev``` command to start the application on your computer.
If you deploy this program to the linux server, after installing the pm2
you can run ```pnpm start``` to run your bot 24/7 in the background
Run ```pnpm stop``` to stop pm2 process.
