# Technical Task API

This project is a NestJS + PostgreSQL service using [MikroORM](https://mikro-orm.io/). It is containerized with Docker and uses Docker Compose for local development.

---

## Features

- **NestJS** framework with GraphQL (Apollo Federation ready)
- **MikroORM** for PostgreSQL with migrations
- **Docker** and **Docker Compose** for easy local setup

---

## Requirements

- Node.js v20+
- Docker & Docker Compose
- PostgreSQL client (optional, for manual DB inspection)

---

## Getting Started

### 1. Clone and install dependencies
```bash
git clone <repo-url>
cd technical-task
npm ci
```

### 2. Start with Docker Compose
```bash
docker compose up --build
```

This will start:
- Postgres database on port 5432
- API service on port 4000
- Healthcheck ensures API starts only after the database is ready.

---

## Database & Migrations

Migrations are managed with MikroORM.

> Important: Migrations are not executed automatically on container startup. This is intentional for safety in production. You must run them manually once you build the image.

### Run migrations locally
```bash
# Run pending migrations
npm run migration:up

# Roll back last migration
npm run migration:down

# Create new migration based on entity changes
npm run migration:create
```

Migrations are generated in `src/infrastructure/persistence/migrations`.

At runtime, MikroORM uses the compiled config from `dist/infrastructure/persistence/orm-config.js`.

---

## Environment Variables

Environment variables are loaded from `.env` 
Check `.env.sample` for a list of available variables.

---

## Development Workflow

- Make changes to entities under `src/infrastructure/persistence/entities/`.
- Generate a new migration:
```bash
npm run migration:create
```
- Run migrations locally or inside the container:
```bash
npm run migration:up
```
- Commit both the entity changes and the generated migration.

---

## Docker Details

### Build-only stage
- Installs dev dependencies
- Builds TypeScript → JavaScript
- Runs `npm prune --omit=dev`

### Runtime stage
- Copies `dist/` build output
- Copies `node_modules` (production only)
- Starts API with:
```bash
node dist/main.js
```

---

## Useful Commands
```bash
# Run API locally (watch mode)
npm run start

# Run tests
npm run test
npm run test:unit
npm run test:e2e

# Run linter
npm run lint
npm run lint:fix

# Clean build
npm run build
```

---

## Notes
- Migrations must be applied manually – the app will not auto-migrate at startup.
- Use `docker compose exec api sh` to get into the container if you need to run commands inside.

For production, build images with:
```bash
docker build -t technical-task-api .
```