#!make

GULP=node --max-old-space-size=1024 ./node_modules/.bin/gulp

init:
	yarn install --non-interactive --no-progress --network-timeout 100000

build:
	$(GULP) build

theme-pull:
	shopify theme pull --store=cookie-diet-au.myshopify.com