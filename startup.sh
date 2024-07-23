#!/usr/bin/env bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
sudo apt-get install git
git clone https://github.com/piotr-tomczyk/peepo
cd peepo
git checkout peepo-terraforming
pnpm i pm2@latest -g
pnpm i
pnpm start
