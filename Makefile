.PHONY: build-RuntimeDependenciesLayer build-lambda-common
.PHONY: build-MsUserAPIFunction
.PHONY: build-MsUserInitFunction

build-MsUserInitFunction:
	$(MAKE) HANDLER=src/handlers/init.ts build-lambda-common

build-MsUserAPIFunction:
	$(MAKE) HANDLER=src/handlers/user-api.ts build-lambda-common

build-lambda-common:
	npm install
	rm -rf dist
	echo "{\"extends\": \"./tsconfig.json\", \"include\": [\"${HANDLER}\"] }" > tsconfig-only-handler.json
	npm run build -- --build tsconfig-only-handler.json
	cp -r dist "$(ARTIFACTS_DIR)/"

build-RuntimeDependenciesLayer:
	mkdir -p "$(ARTIFACTS_DIR)/nodejs"
	cp package.json package-lock.json "$(ARTIFACTS_DIR)/nodejs/"
	npm install --production --prefix "$(ARTIFACTS_DIR)/nodejs/"
	rm "$(ARTIFACTS_DIR)/nodejs/package.json" # to avoid rebuilding when changes aren't related to dependencies
