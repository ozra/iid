NODEJS := node
TSC := node_modules/typescript/bin/tsc
TS_FLAGS := --alwaysStrict --moduleResolution node --strictNullChecks --declaration --inlineSourceMap --pretty --target ES2017

all: build

test:
	node test/iid.test.js

clean:
	rm -rf dist-cjs dist-esmod dist-browser

build: node_modules
	mkdir -p dist-cjs
	$(TSC) $(TS_FLAGS) src/index.ts --module commonjs --outDir dist-cjs

	mkdir -p dist-esmod
	$(TSC) $(TS_FLAGS) src/index.ts --module ESNext --outDir dist-esmod

	mkdir -p dist-browser
	$(TSC) $(TS_FLAGS) src/index.ts --module ESNext --outDir dist-browser

node_modules:
	npm install

.PHONY: all build clean test

