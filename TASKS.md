# CureLink Tasks

## Day 1 Tasks (Foundation)
| Status | Task | Description |
| :---: | :--- | :--- |
| ✅ | 1. Initialize repository files | GitHub templates, agent rules |
| ✅ | 2. Add Git ignore rules | Standard `.gitignore` |
| ✅ | 3. Add initial README | Project README |
| ✅ | 4. Add project context | Define business rules and context |
| ✅ | 5. Add task and changelog files | Document tracker and changelog |
| ✅ | 6. Scaffold Vite React client | React foundation setup |
| ✅ | 7. Add React Router dependency | Frontend routing logic |
| ✅ | 8. Add public layout | Base UI layout |
| ✅ | 9. Add Home page | UI placeholder |
| ✅ | 10. Add About page | UI placeholder |
| ✅ | 11. Add login placeholder | UI placeholder |
| ✅ | 12. Add not-found page | UI placeholder |
| ✅ | 13. Configure application routes | React router wiring |
| ✅ | 14. Add client environment template | Client config env file |
| ✅ | 15. Add Axios client | Centralized API client |
| ✅ | 16. Initialize Express server | Node.js backend structure |
| ✅ | 17. Add server dependencies | Express, Mongoose, etc. |
| ✅ | 18. Configure server scripts | Nodemon, Jest configs |
| ✅ | 19. Add server environment template | Backend config env file |
| ✅ | 20. Add environment validation | Env runtime validation (zod) |
| ✅ | 21. Add MongoDB connection | Database connection logic |
| ✅ | 22. Configure Express middleware | Helmet, cors, express.json |
| ✅ | 23. Add API error utility | Reusable error wrapper |
| ✅ | 24. Add async-handler utility | Async catch block wrapper |
| ✅ | 25. Add not-found middleware | 404 endpoint catch-all |
| ✅ | 26. Add error middleware | Global error handler |
| ✅ | 27. Add health controller | System status logic |
| ✅ | 28. Add health route | Status endpoint |
| ✅ | 29. Add health integration test | Supertest validation |
| ✅ | 30. Add root monorepo scripts | Run both client and server |

## Day 2 Tasks (Authentication)
| Status | Task | Description |
| :---: | :--- | :--- |
| ✅ | 1. Add authentication role constants | RBAC configuration |
| ✅ | 2. Create user schema | Centralize users for customers and pharmacies |
| ✅ | 3. Enforce unique normalized email | Prevent dupes, use lowercase |
| ✅ | 4. Exclude password hash from responses | Security via `toJSON` transform |
| ✅ | 5. Add backend validation middleware | Global Zod validation interceptor |
| ✅ | 6. Add registration validation schemas | Zod rules for customer/pharmacy |
| ✅ | 7. Add login validation schemas | Zod rules for login payloads |
| ✅ | 8. Add central jwt utility | Token generation and verification |
| ✅ | 9. Implement customer registration | `POST /register/customer` |
| ✅ | 10. Implement pharmacy registration | `POST /register/pharmacy` |
| ✅ | 11. Implement login endpoint | `POST /login` |
| ✅ | 12. Implement get me endpoint | `GET /me` |
| ✅ | 13. Implement logout endpoint | `POST /logout` |
| ✅ | 14. Add auth integration tests | Jest coverage for auth |
| ✅ | 15. Update api documentation | Postman collection |

## Next-Day Items
- Implement medicine catalogue frontend.
- Implement customer prescription uploads and quote requests.
- Implement nearby pharmacy search (Geospatial).

## Day 3 Tasks (Pharmacy Profiles & Medicine Catalogue)
| Status | Task | Description |
| :---: | :--- | :--- |
| ✅ | 1. Add Pharmacy role check middleware | Ensure users have PHARMACY role |
| ✅ | 2. Add Pharmacy verification state enums | Status: DRAFT, PENDING, APPROVED, etc. |
| ✅ | 3. Create Pharmacy model | Schema for pharmacy profiles |
| ✅ | 4. Validate Pharmacy Profile schema | Zod validation rules |
| ✅ | 5. Implement create Pharmacy Profile | `POST /pharmacies/me/profile` |
| ✅ | 6. Implement get my Pharmacy Profile | `GET /pharmacies/me/profile` |
| ✅ | 7. Implement update Pharmacy Profile | `PATCH /pharmacies/me/profile` |
| ✅ | 8. Implement submit Pharmacy verification | `POST /pharmacies/me/submit-verification` |
| ✅ | 9. Add Pharmacy routes to app | Wire pharmacy endpoints |
| ✅ | 10. Add Admin list Pharmacies | `GET /admin/pharmacies` |
| ✅ | 11. Add Admin get Pharmacy | `GET /admin/pharmacies/:id` |
| ✅ | 12. Add Admin approve Pharmacy | `PATCH /admin/pharmacies/:id/approve` |
| ✅ | 13. Add Admin reject Pharmacy | `PATCH /admin/pharmacies/:id/reject` |
| ✅ | 14. Add Admin suspend/reactivate Pharmacy | Admin moderation routes |
| ✅ | 15. Create Pharmacy frontend form | React component for profile management |
| ✅ | 16. Create Medicine model | Schema for medicine catalogue |
| ✅ | 17. Implement Admin Medicine CRUD | Routes for medicine catalogue |
| ✅ | 18. Add Medicine Seeder script | Pre-fill 10-15 sample medicines |
| ✅ | 19. End-of-day testing & cleanup | Verification of features and tests |
