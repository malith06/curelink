# Test Plan

## Testing Strategy
CureLink will employ a multi-layered testing strategy to ensure the reliability and security of the platform.

### 1. Unit Tests
- **Target**: Individual services, utility functions, and validation schemas.
- **Tools**: Jest
- **Focus**: Data validation, password hashing, JWT signing/verifying, price calculations.

### 2. Integration Tests
- **Target**: API Endpoints (Controllers + Services + DB).
- **Tools**: Supertest, Jest, MongoDB Memory Server.
- **Focus**:
  - Authentication flows.
  - Role-Based Access Control (RBAC) rejection of unauthorized roles.
  - CRUD operations on core models.
  - Geospatial queries for nearby pharmacies.

### 3. End-to-End (E2E) Tests
- **Target**: Complete user journeys.
- **Focus**:
  - Full Customer Workflow (Register -> Search -> Request -> Upload Rx -> Accept Quotation -> Order).
  - Full Pharmacy Workflow (Register -> Verification -> Receive Request -> Send Quotation -> Prepare Order).

### 4. Security & Edge Case Tests
- **Payment Webhooks**: Mock gateway events to ensure duplicate webhooks are ignored and valid webhooks update order status.
- **File Uploads**: Validate rejection of invalid MIME types (e.g. non-image/pdf files) and oversized files.
- **Privacy Enforcement**: Ensure a pharmacy receives a 403 Forbidden if attempting to read another pharmacy's quotation.
