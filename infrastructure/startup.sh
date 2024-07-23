#!/usr/bin/env bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
sudo apt-get -y install git
git clone https://github.com/piotr-tomczyk/peepo.git
cd peepo
git checkout peepo-terraforming
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20.15.1
nvm install node
pnpm i pm2@latest -g
pnpm i
export DISCORD_TOKEN="$(gcloud secrets versions access latest --secret="discord-token")"
export OPENAI_API_KEY="$(gcloud secrets versions access latest --secret="openapi-token")"
export TENOR_API_KEY="$(gcloud secrets versions access latest --secret="tenorapi-token")"
export TEXT_CHANNEL_ID="$(gcloud secrets versions access latest --secret="textchannel-id")"
export GIF_CHANNEL_ID="$(gcloud secrets versions access latest --secret="gifchannel-id")"
export GIF_CHANNEL_ID="$(gcloud secrets versions access latest --secret="gifchannel-id")"
export GUILD_ID="$(gcloud secrets versions access latest --secret="guild-id")"
pnpm start
