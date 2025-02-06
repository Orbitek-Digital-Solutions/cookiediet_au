#!make

GULP=node --max-old-space-size=1024 ./node_modules/.bin/gulp

init:
	npm install

build:
	$(GULP) build

watch:
	$(GULP)

theme-pull:
	shopify theme pull --store=cookie-diet-au.myshopify.com