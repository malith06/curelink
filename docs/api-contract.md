# API Contract

Base URL: `/api/v1`

## Authentication
- `POST /auth/register/customer`
- `POST /auth/register/pharmacy`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

## Medicines
- `GET /medicines/search?q=`
- `GET /medicines/:id`
- `POST /admin/medicines`

## Pharmacies
- `GET /pharmacies/nearby?lat=&lng=&radius=`
- `GET /pharmacies/:id`
- `PATCH /pharmacies/me`

## Availability
- `GET /availability/search?medicineId=&lat=&lng=`
- `PUT /pharmacies/me/availability/:medicineId`

## Prescriptions
- `POST /prescriptions`
- `POST /prescriptions/:id/process-ocr`
- `PATCH /prescriptions/:id/confirm-extraction`

## Requests
- `POST /requests`
- `GET /requests/my`
- `GET /pharmacy/requests`

## Quotations
- `POST /requests/:id/quotations`
- `POST /quotations/:id/accept`

## Orders
- `POST /orders/from-quotation/:quotationId`
- `GET /orders/my`
- `PATCH /orders/:id/status`

## Payments
- `POST /payments/card/create-session`
- `POST /payments/webhook`
- `POST /payments/cod`
