# Bitespeed Identity Reconciliation Task

This is the backend service designed to keep track of a customer's identity across multiple purchases by linking different orders made with different contact information (Email and Phone Number) to the same person.

## Technology Stack

- **Node.js**: JavaScript Runtime
- **Express**: Web Web Framework for Node
- **TypeScript**: Static typing for JavaScript
- **PostgreSQL**: Relational Database
- **Prisma**: Next generation Node.js and TypeScript ORM

## Prerequisites

- Node.js installed
- A running instance of PostgreSQL (Docker Compose file is included)

## Database Setup

*This project expects a Postgres database.*
1. Create a `.env` file in the `backend` directory (a `.env.example` will be provided).
2. Configure your `DATABASE_URL` with your postgres connection string.

If you have Docker available, you can spin up the required PostgreSQL database using the included `docker-compose.yml`:
```bash
docker-compose up -d
```

Navigate to the `backend` folder to push the Prisma schema and create the tables:
```bash
cd backend
npx prisma db push
```

## Running the Application

In the `backend` directory:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server (uses `ts-node-dev` for hot-reloading):
   ```bash
   npm run dev
   ```

The server should now be running on `http://localhost:3000`.

## Endpoints

### `GET /ping`
Check if the server is healthy.

### `POST /identify`
... to be implemented in Phase 2

## Phase Strategy

This project is being completed in a 5 Phase approach. Currently, **Phase 1 (Project Initialization & Database Setup)** is complete.
