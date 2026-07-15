# CureLink Project Context

## Project Purpose
CureLink is a platform designed to bridge the gap between customers needing medicines and pharmacies having them in stock. It acts as a smart medicine availability and coordination system that strictly protects business privacy. 

## Main Actors
1. **Customer**: Searches for medicines, uploads prescriptions (OCR processed), requests quotations, and places orders.
2. **Pharmacy**: Receives quotation requests, provides private pricing, manages orders, and receives payments.
3. **Admin**: Manages platform operations, oversees user activities, and resolves disputes.

## Main Workflow
1. Customer searches for a medicine or uploads a prescription.
2. OCR extracts text from the prescription (requires human review).
3. The request is sent to nearby/selected pharmacies.
4. Pharmacies respond with private quotations.
5. Customer selects a quotation, places an order, and pays.
6. The system notifies all parties at each step.

## Business Rules
- **No public prices**: Exact medicine prices must NEVER be displayed publicly. Use `AVAILABLE`, `LIMITED`, `UNAVAILABLE`, or `CONFIRMATION_REQUIRED`.
- **Private Quotation Authorization**: A pharmacy must never see another pharmacy's quotation. Prices are shared strictly via private quotations.
- **OCR Human Review**: OCR extracts text ONLY. It does not medically verify. Customers must review, and Pharmacists must manually verify.
- **No Stored Card Data**: Card details must NEVER be stored in MongoDB.
- **Role & Ownership Checks**: Protected APIs must strictly validate role (Customer, Pharmacy, Admin) and record ownership.

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB Atlas (Mongoose)

## Scope Restrictions (Day 1)
For the current phase (Day 1), **NO** business modules (authentication, pharmacies, medicines, OCR, maps, quotations, orders, or payments) are implemented. The focus is strictly on foundational setup, routing, configuration, and structural best practices.

## Current Development Phase
Day 1 - MERN Monorepo Foundation and Structural Setup.