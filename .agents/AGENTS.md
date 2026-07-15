# CureLink Engineering Rules

## General Project Conventions
- Complete only one small feature per implementation batch.
- Stop and wait for the "CONTINUE" command after each commit unit.
- Use Conventional Commits (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`).

## Backend Architecture
- Use a Modular Monolith structure. Keep controllers thin; place all business logic in services.
- All requests must be validated. Use centralized error handling.
- Base API path is `/api/v1`.

## Frontend Architecture
- React + Vite + Tailwind CSS.
- Handle state via Redux Toolkit or Context API.

## Security Rules (CRITICAL)
- **No public prices**: Exact medicine prices must NEVER be displayed publicly. Use `AVAILABLE`, `LIMITED`, `UNAVAILABLE`, or `CONFIRMATION_REQUIRED`.
- **Private Quotation Authorization**: A pharmacy must never see another pharmacy's quotation. Prices are shared strictly via private quotations.
- **OCR Human Review**: OCR extracts text ONLY. It does not medically verify. Customers must review, and Pharmacists must manually verify.
- **No Stored Card Data**: Card details must NEVER be stored in MongoDB.
- **Role & Ownership Checks**: Protected APIs must strictly validate role (Customer, Pharmacy, Admin) and record ownership.

## Testing
- Add tests for important business rules after each batch. Do not merge without passing tests.
