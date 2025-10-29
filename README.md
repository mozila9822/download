# VoyageHub — MySQL/Prisma Backend

This project has been refactored to use MySQL via Prisma (replacing Firestore). The UI and pages remain the same, now backed by server API routes.

## Setup

- Ensure you have a MySQL database (local or cloud like PlanetScale/Railway).
- Set `DATABASE_URL` in `.env` using the format: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`.
- Install deps (already done): `prisma`, `@prisma/client`, `mysql2`.
- Generate client: `npx prisma generate`.
- Create tables: `npx prisma migrate dev --name init`.

## Models

- `User` (id, email, name, role)
- `Service` (title, category, description, price, offerPrice, location, imageUrl)
- `Booking` (userId, serviceId, dates, travelers, totalPrice, status, paymentStatus)

## API

- `GET /api/services` → list all services
- `GET /api/services?category=City%20Break` → filter by category
- `GET /api/bookings` → list bookings (includes user/service info)

## Notes

- Authentication currently uses existing client logic; data access now uses Prisma via API routes.
- Seed data is not included; add services/users/bookings through your DB or create a seeding script.
