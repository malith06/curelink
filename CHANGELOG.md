# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Day 2 Authentication & Authorization (JWT based)
- User Schema mapping Customer and Pharmacy roles
- Zod validation for schemas and global validation middleware
- Full authentication API suite (`/register/customer`, `/register/pharmacy`, `/login`, `/me`, `/logout`)
- Postman API Documentation (`CureLink.postman_collection.json`)
- Secure password hashing hook (`bcrypt`)
- Day 1 Foundation Setup (Complete MERN monorepo initialization)
- React Vite Client with standard React Router public pages (Home, About, Login, 404)
- Express Server configured with core middleware (Helmet, CORS), API Error Handler, and MongoDB connection
- Health check endpoints and integration tests
- Root monorepo orchestration scripts (`concurrently`)
- Basic GitHub and Agent rules
- Project README, context, task tracking, and changelog

### Changed
- Shifted away from separate Patient and Pharmacy models to unified `User` model with `role`
- Refined `.gitignore` to match project standards

### Fixed
- Fixed bug in global error handler to safely intercept Zod validation errors (400 vs 500)
- Fixed duplicate query and unnecessary validation execution in `/me` and `/login` routes
