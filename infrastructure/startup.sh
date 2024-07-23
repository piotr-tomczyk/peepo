#!/usr/bin/env bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
sudo apt-get install git
git clone https://github.com/piotr-tomczyk/peepo
cd peepo
git checkout peepo-terraforming
pnpm i pm2@latest -g
pnpm i
touch .env
cat > .env <<EOF
DISCORD_TOKEN="gcloud compute secrets access latest --secret discord-token"
OPENAI_API_KEY="gcloud compute secrets access latest --secret openapi-token"
TENOR_API_KEY="gcloud compute secrets access latest --secret tenorapi-token"
TEXT_CHANNEL_ID="gcloud compute secrets access latest --secret textchannel-id"
GIF_CHANNEL_ID="gcloud compute secrets access latest --secret gifchannel-id"
GUILD_ID="gcloud compute secrets access latest --secret guild-id"
EOF
pnpm start
