.PHONY: help install init up down dev migration migrate-up migrate-down test lint clean

DB_URL=postgres://admin:password@localhost:5432/task_manager

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Run npm install
	npm install

init: ## Initialize Colima for Docker
	colima start --cpu 4 --memory 8

up: ## Start Docker containers
	docker-compose up -d

down: ## Stop Docker containers
	docker-compose down

dev: ## Start Next.js development server
	npm run dev

test: ## Run tests
	npm run test

test-coverage: ## Run tests with coverage
	npm run test:coverage

build: ## Build the application
	npm run build

lint: ## Run linting
	npm run lint

swagger: ## Run Swagger UI to view OpenAPI documentation
	docker run --rm -p 8080:8080 -e SWAGGER_JSON=/openapi.yaml -v $(shell pwd)/openapi.yaml:/openapi.yaml swaggerapi/swagger-ui

migration: ## Create a new migration (Usage: make migration NAME=my_migration)
	@if [ -z "$(NAME)" ]; then echo "Usage: make migration NAME=migration_name"; exit 1; fi
	@npx ts-node scripts/migrate.ts create $(NAME)

migrate-up: ## Apply pending migrations
	@npx ts-node scripts/migrate.ts up

migrate-down: ## Rollback the last migration
	@npx ts-node scripts/migrate.ts down

clean: ## Clean up generated files
	rm -rf .next node_modules coverage