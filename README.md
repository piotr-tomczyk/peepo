# Chat GPT 3.5 Peepo discord bot 
## Prerequisites
Discord Application and bot created on https://discord.com/developers/docs/intro. Good guide -> https://www.youtube.com/watch?v=Oy5HGvrxM4o <br/>
OpenAI API key. https://platform.openai.com/overview <br/>
PNPM installed on your system <br/>
Node version 18+ <br/>
## How to set it up?
Run ```pnpm i``` to install the dependencies. <br/>
Assign correct values to variables in ```.env.example``` and rename the file to ```.env```. <br/>
```DISCORD_TOKEN``` is the token generated in Discord application <br/>
```OPENAI_API_KEY``` is the API key to OpenAI <br/>
```CHANNEL_ID``` is the ID of the channel you want your bot to be on <br/>
Run ```pnpm dev``` command to start the application on your computer. <br/>
If you deploy this program to the linux server, after installing the pm2
you can run ```pnpm start``` to run your bot 24/7 in the background <br/>
Run ```pnpm stop``` to stop pm2 process. <br/>
