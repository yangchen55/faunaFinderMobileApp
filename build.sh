#!/bin/bash

# Exit in case of error
set -e

# Check if an argument is provided
if [ -z "$1" ]; then
  echo "Please provide an argument: dev or prod"
  exit 1
fi

# Set the Docker Compose file based on the argument
if [ "$1" = "dev" ]; then
  COMPOSE_FILE="docker-compose.dev.yml"
elif [ "$1" = "prod" ]; then
  COMPOSE_FILE="docker-compose.prod.yml"
else
  echo "Invalid argument. Please use 'dev' or 'prod'."
  exit 1
fi

# Build and run containers
docker compose -f $COMPOSE_FILE build
docker compose -f $COMPOSE_FILE up -d

# Hack to wait for postgres container to be up before running alembic migrations
sleep 5;

# Run migrations
docker exec ff-backend alembic upgrade head

# Create initial data
docker exec ff-backend python3 app/seed.py