# CureLink

Smart Medicine Availability and OCR-Based Pharmacy Coordination System.

## Main Features

- Customer, pharmacy and admin authentication
- Medicine availability search
- Nearby pharmacy discovery
- Multi-medicine request cart
- OCR prescription extraction
- Private pharmacy quotations
- Order management
- Card payment and cash on delivery
- Real-time notifications
- Admin analytics dashboard

## Technology Stack

- React.js
- Node.js
- Express.js
- MongoDB
- Socket.io

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/malith06/curelink.git
   cd curelink
   ```

2. **Install all dependencies**
   We use a convenient root script to install dependencies for both the client and server simultaneously.
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**
   - In `server/.env`, set up your `MONGODB_URI` and `JWT_SECRET`.
   - In `client/.env` (if applicable), configure your `VITE_API_URL`.

4. **Start the Development Servers**
   This command uses `concurrently` to run both the Vite frontend and the Express backend.
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm test
   ```
