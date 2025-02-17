#!make

GULP=node --max-old-space-size=1024 ./node_modules/.bin/gulp
SHOPIFY=node ./node_modules/.bin/shopify

init:
	npm install

build:
	$(GULP) build

watch:
	$(GULP)

theme-pull:
	$(SHOPIFY) theme pull --store=cookie-diet-au

theme-dev:
	$(SHOPIFY) theme dev --store=cookie-diet-au