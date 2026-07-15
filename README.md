# CureLink

**Smart Medicine Availability and OCR-Based Pharmacy Coordination System**

## Project Description
CureLink is a specialized platform designed to connect customers with pharmacies, enabling smart medicine searches and providing a private, secure environment for pharmacy coordination. The system focuses on strict data privacy, ensuring that quotations and sensitive information remain confidential.

## Main Planned Features
- Medicine Search & Availability Tracking
- OCR-Based Prescription Processing (with Human Verification)
- Private Pharmacy Quotations
- Secure Order Management & Payments
- Real-Time Notifications & Coordination

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Architecture**: Modular Monolith

## Current Development Status
**Day 1 Foundation**: Basic MERN monorepo structure, environment configuration, routing, and centralized error handling setup. No business logic implemented yet.

## Repository Structure
```text
CureLink/
├── client/          # Vite React Frontend
├── server/          # Express Backend
├── docs/            # Architecture & Design Documentation
├── .agents/         # AI Assistance Rules & Guidelines
└── .github/         # GitHub Issue & PR Templates
```

## Prerequisites
- Node.js (v18+ recommended)
- Git
- MongoDB Atlas cluster (for backend database)

## Local Installation
```bash
git clone https://github.com/malith06/curelink.git
cd CureLink
npm run install:all
```

## Environment Setup
You must configure the environment variables for both the client and server before starting the application:
1. Create frontend config: `cp client/.env.example client/.env`
2. Create backend config: `cp server/.env.example server/.env`

> **Security Warning:** Never commit your `.env` files. They contain sensitive credentials.

## Running Frontend and Backend
To start both the React frontend and Express backend concurrently:
```bash
npm run dev
```

## Running Tests
Run tests for both the client and server:
```bash
npm run test
```

## Branch Strategy
- `main`: Stable production releases.
- `develop`: Integration branch for new features.
- `feature/*`: Active development branches for new work.

## Commit Message Format
We follow Conventional Commits format (`type(scope): message`):
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `chore`: Maintenance tasks (e.g., dependencies)
- `test`: Adding missing tests or correcting existing tests

## Future Modules
- Authentication (JWT)
- OCR Integration
- Payment Gateway Integration
- Real-Time Maps API
- Pharmacy Dashboard Analytics
