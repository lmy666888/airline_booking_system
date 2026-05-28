
# Dairy Flat Airways — Online Booking System

Assignment 2 for 159.352 Advanced Web Development submitted by MingyiLi.

This project is a fictional airline booking system built with Next.js, MongoDB Atlas, and deployed on Vercel.

## Features

- Search flights by airport and date range
- Create and cancel bookings
- Generate booking references
- Passenger booking lookup
- Invoice / e-ticket page
- Prevent overbooking
- Timezone support for NZ, Sydney, and Chatham Islands

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- MongoDB Atlas + Mongoose
- Zod
- Luxon

## Local Setup

```bash
npm install
cp .env.example .env.local
````

Add your MongoDB connection string to `.env.local`:

```text
MONGODB_URI=yor_connection_string
```

Seed the database:

```bash
npm run seed
```

Start the development server:

```bash
npm run dev
```

## Deployment

The project is deployed using Vercel with MongoDB Atlas.

## API Routes

| Method | Route                        | Purpose          |
| ------ | ---------------------------- | ---------------- |
| GET    | `/api/schedules`             | Search flights   |
| POST   | `/api/bookings`              | Create booking   |
| DELETE | `/api/bookings/[reference]`  | Cancel booking   |
| GET    | `/api/bookings/by-passenger` | Passenger lookup |

```
```
