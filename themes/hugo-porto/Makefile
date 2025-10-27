.DEFAULT_GOAL: build
.SILENT:

lint:
	npx markdownlint '**/*.md' --ignore node_modules
	npx stylelint '**/*.css'
@PHONY: lint

dev-tailwind:
	npx postcss assets/css/tailwind.css -o static/css/tailwind.css --watch
@PHONY: tailwind

dev-hugo:
	hugo server --buildDrafts
@PHONY: dev-hugo

dev:
	make -j 2 dev-tailwind dev-hugo 
@PHONY: dev

build: lint
	rm -rf ./public
	npx postcss assets/css/tailwind.css -o static/css/tailwind.css --minify
	hugo --minify
@PHONY: build

update:
	npx npm-check-updates -u
	npm install --no-fund --no-audit
@PHONY: update

# Test semantic-release locally (dry-run)
release-dry:
	npx semantic-release --dry-run
@PHONY: release-dry

# Install dependencies
install:
	npm install --no-fund --no-audit
@PHONY: install