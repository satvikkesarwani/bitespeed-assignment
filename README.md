# Bitespeed Identity Reconciliation Task

A complete full-stack web service and UI designed to keep track of a customer's identity across multiple purchases by linking different orders made with different contact information (Email and Phone Number) to the same person.

![Frontend Preview](https://via.placeholder.com/800x400.png?text=FluxKart+Identity+Reconciliation+UI)

## Technology Stack

### Backend
- **Node.js**: JavaScript Runtime
- **Express**: Web Framework for Node
- **TypeScript**: Static typing for JavaScript
- **SQLite**: Relational Database for Zero-Dependency Local Testing
- **Prisma**: Next generation Node.js and TypeScript ORM

### Frontend
- **React**: Modern View Library
- **Vite**: Ultra-fast build tool
- **Lucide-React**: Beautiful SVG icons
- **CSS**: Pure Vanilla CSS featuring glassmorphism and modern UI aesthetics

## Project Structure
```
bitespeed-assignment/
├── backend/               # Express + Prisma API
│   ├── src/index.ts       # Core /identify logic for Phase 2 & 3
│   ├── prisma/            # SQLite database and schema
│   └── package.json
└── frontend/              # Vite + React Interface
    ├── src/App.tsx        # UI & API Integration
    ├── src/index.css      # Custom UI Styling
    └── package.json
```

## Running the Application Locally (Zero Dependencies!)

We mapped the local environment to use **SQLite** so that you can run and test the database logic without needing Docker or a live PostgreSQL URL.

### 1. Start the Backend API

Open a terminal window and navigate to the backend folder:
```bash
cd backend

# Install all backend dependencies
npm install

# Push the schema to the local SQLite database
npx prisma db push

# Generate the Prisma client
npx prisma generate

# Start the dev server (runs on port 3000)
npm run dev
```

### 2. Start the Frontend UI

Open a *second* terminal window and navigate to the frontend folder:
```bash
cd frontend

# Install all frontend dependencies
npm install

# Start the React Vite app (usually runs on port 5173)
npm run dev
```

Navigate to the `localhost` URL provided by Vite in your browser to interact with the beautifully designed Identity Reconciliation tester!

## Features

- **Phase 1**: Full project intialization, Prisma modeling, and health endpoints.
- **Phase 2 Implementation**: Correctly identifies entirely new customers and creates primary contacts. Returns unified matches when exact existing keys are passed.
- **Phase 3 Implementation**: Handles complex consolidation. If a new phone number pairs with an existing email, it seamlessly generates a `secondary` contact linked to the `primary`. Can absorb newer overlapping primaries into older primaries.
- **Phase 4 Implementation**: A modern, sleek glassmorphic frontend utilizing React to display arrays of Linked Emails, Linked Phones, and Secondary IDs dynamically.

## Developer

Developed with extreme love and precision for the Bitespeed software engineering challenge.
