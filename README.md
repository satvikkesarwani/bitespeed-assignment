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

## API Specification

The core logic is exposed through a single POST endpoint for identity reconciliation.

### Endpoint: `POST /identify`

**Hosted URL**: `[Insert your Render/Deployment URL here]/identify`  
**Local URL**: `http://localhost:3000/identify`

#### Request Body (JSON)
| Field | Type | Description |
| :--- | :--- | :--- |
| `email` | `string?` | Optional (Mandatory if `phoneNumber` is null). Must be `@gmail.com`. |
| `phoneNumber` | `string\|number?` | Optional (Mandatory if `email` is null). Will be normalized to 10 digits. |

```json
{
  "email": "mabe@gmail.com",
  "phoneNumber": "9005629577"
}
```

#### Response Body (JSON)
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["mabe@gmail.com", "mabe2@gmail.com"],
    "phoneNumbers": ["9005629577", "9794182032"],
    "secondaryContactIds": [2, 3]
  }
}
```

---

## Features

- **Phase 1-3 Core Engine**: Robust Identity Reconciliation logic that handles creation, linking, and complex primary-demotion/secondary-relinking cases. 100% compliant with the Bitespeed technical spec.
- **Spec-Perfect Responses**: JSON responses strictly follow the `primaryContactId` naming and ensure the primary identifier is always the first element in the email and phone arrays.
- **Strict Validation (Phase 8)**: Both frontend and backend enforce a **10-digit numeric** constraint for phone numbers and an **@gmail.com** constraint for emails.
- **Enabled/Disabled Logic**: The "Identify Contact" UI button is intelligently enabled only when both fields are correctly populated.
- **Normalization (Phase 7)**: Backend logic automatically strips non-numeric characters from phone numbers for consistent cluster matching.
- **Professional UI**: A centered, modern white theme with a searchable, high-contrast world-country selector (50+ countries).
- **Maintenance Tools**: Includes `reset_db.ts` to clear all records and `normalize_existing_data.ts` for sanitizing legacy records.

## Developer

Developed with precision and care for the Bitespeed Backend Challenge.
