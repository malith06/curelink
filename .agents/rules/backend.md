---
trigger: manual
---

# Backend Architecture Rules

- Use a Modular Monolith structure. Keep controllers thin; place all business logic in services.
- All requests must be validated. Use centralized error handling.
- Base API path is `/api/v1`.
