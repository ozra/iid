NODEJS := node
TSC := node_modules/typescript/bin/tsc
TS_FLAGS := --alwaysStrict --moduleResolution node --strictNullChecks --declaration --inlineSourceMap --pretty --target ES2017

all: build

test:
	node test/iid.test.js

clean:
	rm -rf dist-cjs dist-esmod

build: node_modules build-files

build-files: \
	dist-cjs/index.js \
	dist-esmod/index.js \

dist-cjs/index.js: src/index.ts
	$(TSC) $(TS_FLAGS) src/index.ts --module commonjs --outDir dist-cjs

dist-esmod/index.js: src/index.ts
	$(TSC) $(TS_FLAGS) src/index.ts --module ESNext --outDir dist-esmod

node_modules:
	npm install

.PHONY: all build clean test
