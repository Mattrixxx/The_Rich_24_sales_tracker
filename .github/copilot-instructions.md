# The Rich24 Sales Tracker

## Project Overview
A sales tracking application for The Rich24 company built with:
- **Framework**: Next.js 14 with TypeScript
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **UI**: Shadcn/UI with Tailwind CSS

## Features
- Product management with cost tracking
- Sales order management with employee info
- Platform tracking (where sales came from)
- Commission calculation for employees
- Expense tracking

## Development Guidelines
- Use TypeScript for all files
- Follow Next.js App Router conventions
- Use Prisma for all database operations
- Use Shadcn/UI components for consistent UI

## Database Schema
- **Product**: id, name, cost, price, createdAt, updatedAt
- **Employee**: id, name, commissionRate, createdAt, updatedAt
- **Platform**: id, name, createdAt, updatedAt
- **Order**: id, productId, employeeId, platformId, quantity, unitPrice, totalPrice, commission, createdAt
- **Expense**: id, description, amount, category, date, createdAt

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `docker-compose up -d` - Start PostgreSQL database
- `npx prisma migrate dev` - Run database migrations
- `npx prisma studio` - Open Prisma Studio
