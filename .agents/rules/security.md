# Security Rules

- **No public prices**: Exact medicine prices must NEVER be displayed publicly. Use `AVAILABLE`, `LIMITED`, `UNAVAILABLE`, or `CONFIRMATION_REQUIRED`.
- **Private Quotation Authorization**: A pharmacy must never see another pharmacy's quotation. Prices are shared strictly via private quotations.
- **OCR Human Review**: OCR extracts text ONLY. It does not medically verify. Customers must review, and Pharmacists must manually verify.
- **No Stored Card Data**: Card details must NEVER be stored in MongoDB.
- **Role & Ownership Checks**: Protected APIs must strictly validate role (Customer, Pharmacy, Admin) and record ownership.
