NODEJS := node
TSC := node_modules/typescript/bin/tsc
TS_FLAGS := --alwaysStrict --moduleResolution node --strictNullChecks --declaration  --pretty --target ES2017

all: build

test: build
	node test/iid.test.js

clean:
	rm -rf dist*

build: node_modules build-files

build-files: \
	dist/index.js

dist/index.js: src/index.ts
	$(TSC) $(TS_FLAGS) src/index.ts --module commonjs --outDir dist

# dist-esmod/index.js: src/index.ts
# 	$(TSC) $(TS_FLAGS) src/index.ts --module ESNext --outDir dist-esmod

node_modules:
	npm install

.PHONY: all build clean test
