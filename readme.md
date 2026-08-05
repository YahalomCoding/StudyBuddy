# StudyBuddy Local Development

## Prerequisites

- Node.js 18+
- npm
- Docker Desktop (running)

## Environment Files

The repo now includes local `.env` files:

- `apps/api/.env`
- `apps/client/.env`

Update placeholder values before using OAuth or AI features:

- `OPENROUTER_API_KEY`
- `GOOGLE_CLIENT_ID`
- `LANGFUSE_PUBLIC_KEY`
- `LANGFUSE_SECRET_KEY`

## Local Database Setup

Run:

```bash
npm run db:setup
```

This command:

- Starts (or reuses) a Postgres Docker container named `studybuddy-postgres`
- Waits for Postgres readiness
- Creates or updates DB user `studybuddy`
- Creates DB `studybuddy` if missing

Default connection used by the API `.env`:

- Host: `localhost`
- Port: `5432`
- Username: `studybuddy`
- Password: `studybuddy`
- Database: `studybuddy`

Optional overrides for the setup script:

- `STUDYBUDDY_DB_CONTAINER`
- `STUDYBUDDY_DB_PORT`
- `STUDYBUDDY_POSTGRES_USER`
- `STUDYBUDDY_POSTGRES_PASSWORD`
- `STUDYBUDDY_POSTGRES_DB`

## Run The App

```bash
npm run dev:local
```

Or run separately:

```bash
npm run db:setup
npm run dev
```