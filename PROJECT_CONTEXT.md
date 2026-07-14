# CureLink Project Context

## Project
Smart Medicine Availability and OCR-Based Pharmacy Coordination System.

## Stack
- React
- Node.js
- Express
- MongoDB
- Socket.io
- OCR processing
- Cloud image storage
- Maps integration
- Card payment gateway and Cash on Delivery

## Roles
- Customer
- Pharmacy
- Admin

## Core Rules
1. Prices must not be displayed publicly.
2. Pharmacies send prices privately through quotations.
3. OCR results require human verification.
4. One medicine request may contain multiple medicines.
5. Prescription images are private.
6. Never store card details.
7. Controllers must remain thin.
8. Business logic belongs in services.
9. Validate every API request.
10. Add tests for important business rules.