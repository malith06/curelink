# CureLink Project Context

## Project Title

Smart Medicine Availability and OCR-Based Pharmacy Coordination System

## Project Purpose

CureLink is a healthcare coordination platform that connects customers, pharmacies, and administrators.

The system helps customers search for medicines, identify nearby pharmacies, upload prescriptions, receive private quotations, place orders, and make payments.

## Main Actors

### Customer

The customer can:

- Register and log in
- Search medicines
- Find nearby pharmacies
- Add multiple medicines to a request
- Upload a prescription
- Review OCR-extracted medicine details
- Send requests to pharmacies
- Receive private quotations
- Select a pharmacy
- Place an order
- Pay by card or cash on delivery
- Track the order
- Receive notifications

### Pharmacy

The pharmacy can:

- Register and log in
- Manage pharmacy profile
- Update medicine availability
- Receive customer requests
- View prescriptions
- Verify prescription details
- Send private quotations
- Accept or reject orders
- Update order status
- View payments
- Receive notifications

### Administrator

The administrator can:

- Manage users
- Verify pharmacy accounts
- Manage medicine records
- Monitor orders
- Monitor payments
- View reports
- Manage system activities

## Main Business Rules

1. Exact medicine prices must not be shown publicly.
2. Pharmacies provide prices through private quotations.
3. A medicine request can contain multiple medicines.
4. Prescription OCR results must be reviewed by the customer.
5. A pharmacist must verify prescription-required medicines.
6. OCR only extracts text and does not medically approve prescriptions.
7. The system must not provide medical diagnosis.
8. Card details must never be stored in the database.
9. Payment confirmation must be verified by the backend.
10. Customers can choose card payment or cash on delivery.
11. Only authorized users can access prescriptions and orders.
12. Customer and pharmacy details must be saved with each order.

## Technology Stack

- React.js
- Vite
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Socket.io
- OCR service
- Google Maps
- Cloudinary
- Payment gateway

## Development Architecture

The system will use a modular monolith architecture.

Main modules:

- Authentication
- Users
- Pharmacies
- Medicines
- Availability
- Prescriptions
- OCR
- Medicine Requests
- Quotations
- Orders
- Payments
- Notifications
- Reviews
- Administration

## Development Rule

Before implementing any feature:

1. Inspect the existing project.
2. Prepare an implementation plan.
3. Identify affected files.
4. Define APIs and database changes.
5. Implement only one feature at a time.
6. Test the feature.
7. Review code changes.
8. Commit using a clear commit message.