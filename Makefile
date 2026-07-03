# ==============================================================
# Jiayi Tools Website — Makefile
# Common Docker Compose lifecycle targets.
#
# Prerequisites:
#   - Docker Engine 24+ and Docker Compose v2 (docker compose)
#   - A .env file at the repo root (copy from .env.example)
# ==============================================================

COMPOSE := docker compose

.PHONY: up down logs build restart ps shell-next shell-strapi

## up: Start all services in detached mode
up:
	$(COMPOSE) up -d

## down: Stop and remove containers (volumes are preserved)
down:
	$(COMPOSE) down

## logs: Tail logs for all services (Ctrl-C to stop)
logs:
	$(COMPOSE) logs -f

## build: Build (or rebuild) all custom service images
build:
	$(COMPOSE) build

## restart: Restart all services without removing containers
restart:
	$(COMPOSE) restart

## ps: Show status of all containers
ps:
	$(COMPOSE) ps

## shell-next: Open a shell inside the running next container
shell-next:
	$(COMPOSE) exec next sh

## shell-strapi: Open a shell inside the running strapi container
shell-strapi:
	$(COMPOSE) exec strapi sh
