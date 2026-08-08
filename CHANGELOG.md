# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Feature (Day 10): Full-Stack Real-Time Notification system infrastructure.
- Feature (Day 10): Notification Mongoose model with idempotency checks to prevent duplicates.
- Feature (Day 10): Socket.IO server securely integrated with JWT authentication and individual user rooms.
- Feature (Day 10): Real-Time frontend `NotificationContext` to sync notification counts instantly.
- Feature (Day 10): Interactive `NotificationBell` with dropdown previews across all user layouts.
- Feature (Day 10): Dedicated Inbox `/notifications` for history viewing.
- Feature (Day 10): Centralized `NotificationFactory` to standardise payloads for requests, quotes, orders, and payments.
- Feature (Day 9): Full-Stack Payment Integration supporting Stripe Sandbox for card payments and Cash on Delivery.
- Feature (Day 9): Webhook signature verification and deduplication using MongoDB compound index on PaymentEvent to prevent duplicate processing.
- Feature (Day 9): Card Checkout Sessions with seamless redirects to Stripe Hosted Checkout and server-side validation.
- Feature (Day 9): Cash on Delivery Collection Workflow for pharmacists to securely mark orders as "Collected".
- Feature (Day 9): Admin Payment Monitoring Dashboard to view all global transactions by method and status.
- Feature (Day 9): Customer payment selection, success, and cancel frontend views integrated with checkout service.
- Feature (Day 8): Order Management Workflow providing end-to-end status progression (Pending, Accepted, Preparing, Ready, Delivered).
- Feature (Day 8): Snapshot functionality capturing customer and pharmacy details immutably at checkout time.
- Feature (Day 8): Order State Machine transition validation preventing illegal fulfillment flow jumps.
- Feature (Day 8): Customer Orders Dashboard UI and Create Order Flow (Pickup vs Delivery).
- Feature (Day 8): Pharmacy Orders Dashboard UI for triage and bulk-filtering incoming orders.
- Feature (Day 7): Private Quotation Workflow, allowing pharmacies to offer dynamic pricing based on customer requests.
- Feature (Day 7): Quotation calculator for accurate currency conversions and availability score determination.
- Feature (Day 7): Pharmacy Quotation Builder UI to draft, calculate totals, and submit pricing options.
- Feature (Day 7): Customer Inbox UI and Quotation Comparison views (table format) to evaluate offers from different pharmacies side-by-side.
- Feature (Day 7): Secure atomic acceptance logic using MongoDB transactions to accept one quotation and auto-decline competing quotes.
- Feature (Day 6): Prescription OCR processing integration to automatically extract text using Tesseract.
- Feature (Day 6): Pharmacist manual verification loop to ensure safety over extracted OCR text and customer entry.
- Feature (Day 6): Cloudinary integration for secure prescription PDF and image storage.
- Feature (Day 6): Fuzzy matching for OCR extracted medicine names to link against existing catalogue items.
- Feature (Day 4): Pharmacy profile location fields with 2dsphere geospatial index.
- Feature (Day 4): Medicine Availability schema with strict unique compound index.
- Feature (Day 4): Backend services, controllers, and routes to update and query Medicine Availability.
- Feature (Day 4): Backend service, controller, and route (`/api/v1/pharmacies/nearby`) to find pharmacies by location and medicine availability.
- Feature (Day 5): Medicine Request lifecycle management (Draft, Submitted, Quoted, Accepted, Dispatched, etc.)
- Feature (Day 5): Quotation engine for pharmacies to offer prices for customer requests.
- Feature (Day 5): Embedded timelines and history tracking via pre-save hooks on Medicine Request.
- Feature (Day 5): Backend APIs for Customers to create requests, manage items, and submit for quotations.
- Feature (Day 5): Security rules implemented to strictly isolate pharmacy quotes from competitor view.
- Feature (Day 5): Payment mocking APIs for request conversion to orders.
- Feature (Day 5): Expiry cron job logic built-in to cancel old unanswered requests.

## [0.3.0] - 2026-07-22 Day 3 Pharmacy Profiles & Medicine Catalogue
- Pharmacy verification workflow (Draft, Pending, Approved, Rejected, Suspended)
- Full Admin moderation API for Pharmacies
- Frontend Pharmacy Profile management API service and React Form
- Medicine model and Admin-only CRUD operations for the catalogue
- Pharmacy and Medicine validation schemas (Zod)
- MongoDB compound text index for Medicine search
- Database seeder script for Medicines (`npm run seed:medicines`)
- Day 2 Authentication & Authorization (JWT based)
- User Schema mapping Customer and Pharmacy roles
- Zod validation for schemas and global validation middleware
- Full authentication API suite (`/register/customer`, `/register/pharmacy`, `/login`, `/me`, `/logout`)
- Postman API Documentation (`CureLink.postman_collection.json`)
- Secure password hashing hook (`bcrypt`)
- Day 1 Foundation Setup (Complete MERN monorepo initialization)
- React Vite Client with standard React Router public pages (Home, About, Login, 404)
- Express Server configured with core middleware (Helmet, CORS), API Error Handler, and MongoDB connection
- Health check endpoints and integration tests
- Root monorepo orchestration scripts (`concurrently`)
- Basic GitHub and Agent rules
- Project README, context, task tracking, and changelog

### Changed
- Shifted away from separate Patient and Pharmacy models to unified `User` model with `role`
- Refined `.gitignore` to match project standards

### Fixed
- Fixed bug in global error handler to safely intercept Zod validation errors (400 vs 500)
- Fixed duplicate query and unnecessary validation execution in `/me` and `/login` routes
