# System Architecture

CureLink is built as a **Modular Monolith** using the MERN stack. 

## Frontend (Client)
- **Framework**: React with Vite
- **Routing**: React Router
- **State Management**: Redux Toolkit / Context API
- **Styling**: Tailwind CSS
- **API Communication**: Axios

## Backend (Server)
- **Framework**: Node.js & Express.js
- **Database**: MongoDB Atlas via Mongoose
- **API Structure**: 
  - Controllers: Handle HTTP request/response.
  - Services: Contain all business logic.
  - Models: Define MongoDB schemas.
  - Routes: Map HTTP verbs to Controllers.

## External Integrations
- **Maps API**: Google Maps (Geospatial queries for pharmacies).
- **OCR Service**: Tesseract (Text extraction from prescriptions).
- **Cloud Storage**: Cloudinary (Secure prescription image storage).
- **Payment Gateway**: Stripe / PayHere Sandbox (Card processing).
- **Real-Time**: Socket.io (Order status notifications).
