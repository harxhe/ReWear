# ReWear

ReWear is a PERN monorepo for the EcoThread Marketplace course project.

## Workspace

- `client/` - React + Vite frontend
- `server/` - Express API
- root - shared scripts and workspace tooling

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and update the PostgreSQL connection string.
3. Create the schema with `npm run db:setup --workspace server`.
4. Seed the material registry with `npm run db:seed --workspace server`.
5. Start both apps with `npm run dev`.
6. The API health check is available at `http://localhost:4000/api/health`.

## Database scripts

- `npm run db:setup --workspace server` - creates all marketplace tables
- `npm run db:seed --workspace server` - seeds materials and badge definitions
- `npm run db:reset --workspace server` - drops the ReWear tables

## pgAdmin

Use the same credentials from `.env` when registering a PostgreSQL server in pgAdmin. Once connected, you can create a `rewear` database in pgAdmin and run the setup and seed scripts from this repo against that database.

## Design references

The original static mockups remain in the repository root as design references while the production app is built in the monorepo.
