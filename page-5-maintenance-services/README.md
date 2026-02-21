# FleetFlow - Modular Fleet & Logistics Management System

<div align="center">
  <h3>🚛 Smart Fleet Management for Modern Logistics</h3>
  <p>A comprehensive solution for vehicle tracking, trip dispatch, maintenance logging, driver compliance, and financial analytics.</p>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Screenshots](#screenshots)

---

## Overview

FleetFlow is a full-stack fleet management application designed to streamline logistics operations. It provides real-time monitoring, intelligent dispatching, and comprehensive analytics to help fleet managers make data-driven decisions.

### Key Capabilities

- **Vehicle Registry**: Track all vehicles with status, type, capacity, and maintenance history
- **Trip Dispatcher**: Create, schedule, and manage trips with cargo validation
- **Maintenance Logging**: Schedule preventive and reactive maintenance with cost tracking
- **Driver Management**: Monitor compliance, license expiry, and safety scores
- **Financial Analytics**: Track fuel consumption, operational costs, and revenue
- **Real-time Updates**: WebSocket-powered live fleet status updates
- **Role-Based Access**: Different permissions for managers, dispatchers, safety officers, and analysts

---

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Secure password hashing with bcrypt

### 🚗 Vehicle Management
- Full CRUD operations for vehicles
- Status tracking (Available, On Trip, In Shop, Retired)
- Vehicle type categorization (Truck, Van, Sedan, SUV)
- Capacity and mileage tracking

### 👤 Driver Profiles
- Driver registration and management
- License category and expiry tracking
- Safety score monitoring
- Status management (Available, On Trip, On Leave, Inactive)

### 📍 Trip Dispatch
- Intelligent trip creation with validation
- Cargo weight vs vehicle capacity checks
- Driver license expiry validation
- Trip lifecycle management (Plan → Dispatch → Complete/Cancel)
- Revenue and distance tracking

### 🔧 Maintenance & Service
- Preventive, reactive, and scheduled maintenance
- Automatic vehicle status updates
- Cost breakdown (labor, parts, total)
- Service provider tracking

### ⛽ Expenses & Fuel
- Fuel log entries with odometer tracking
- Multiple fuel types (Diesel, Petrol, CNG, Electric)
- Cost per liter calculations
- Vehicle operational cost analysis

### 📊 Analytics & Reports
- Real-time KPI dashboard
- Fleet utilization metrics
- Driver performance charts
- Financial summaries
- CSV and PDF export functionality

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | High-performance Python web framework |
| SQLAlchemy | ORM for database operations |
| Alembic | Database migrations |
| PostgreSQL | Primary database |
| Redis | Caching and session storage |
| PyJWT | JWT authentication |
| Pydantic | Data validation |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite | Build tool and dev server |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Component library |
| Zustand | State management |
| Recharts | Data visualization |
| React Router | Client-side routing |

### DevOps
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy (production) |

---

## Project Structure

```
fleetflow-hemant/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py          # Authentication endpoints
│   │   │   │   ├── vehicles.py      # Vehicle CRUD
│   │   │   │   ├── drivers.py       # Driver management
│   │   │   │   ├── trips.py         # Trip dispatch
│   │   │   │   ├── maintenance.py   # Maintenance logging
│   │   │   │   ├── expenses.py      # Fuel & expenses
│   │   │   │   ├── dashboard.py     # Analytics & KPIs
│   │   │   │   └── websocket.py     # Real-time updates
│   │   │   └── deps.py              # Dependencies & auth
│   │   ├── core/
│   │   │   ├── config.py            # App configuration
│   │   │   └── security.py          # JWT & password utils
│   │   ├── db/
│   │   │   └── database.py          # Database connection
│   │   ├── models/
│   │   │   └── models.py            # SQLAlchemy models
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic schemas
│   │   └── main.py                  # FastAPI application
│   ├── alembic/                     # Database migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   └── layout/              # Layout components
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── VehiclesPage.tsx
│   │   │   ├── DriversPage.tsx
│   │   │   ├── TripsPage.tsx
│   │   │   ├── MaintenancePage.tsx
│   │   │   ├── ExpensesPage.tsx
│   │   │   └── AnalyticsPage.tsx
│   │   ├── services/
│   │   │   └── api.ts               # API client
│   │   ├── store/
│   │   │   ├── authStore.ts         # Auth state
│   │   │   └── fleetStore.ts        # Fleet data state
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── lib/
│   │   │   └── utils.ts             # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf                   # Reverse proxy config
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- PostgreSQL 15+ (or use Docker)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/fleetflow-hemant.git
cd fleetflow-hemant

# Start all services
docker-compose up -d

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

### Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://user:password@localhost:5432/fleetflow
export REDIS_URL=redis://localhost:6379/0
export SECRET_KEY=your-secret-key

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

#### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://fleetflow:fleetflow@localhost:5432/fleetflow` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `SECRET_KEY` | JWT signing key | Required |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

---

## API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User authentication |
| `POST` | `/api/auth/register` | User registration |
| `GET` | `/api/vehicles` | List all vehicles |
| `POST` | `/api/trips` | Create a new trip |
| `POST` | `/api/trips/{id}/dispatch` | Dispatch a trip |
| `GET` | `/api/dashboard/kpis` | Get KPI metrics |
| `GET` | `/api/dashboard/export` | Export analytics data |
| `WS` | `/ws/{channel}` | Real-time updates |

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   React     │  │  Zustand    │  │   React Router      │  │
│  │   Components│  │  Store      │  │   (Client Routing)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/WebSocket
┌────────────────────────────┴────────────────────────────────┐
│                        API Layer                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                     FastAPI                              ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    ││
│  │  │  Auth    │ │ Vehicles │ │  Trips   │ │ Analytics│    ││
│  │  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │    ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    ││
│  └─────────────────────────────────────────────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                       Data Layer                             │
│  ┌─────────────────────┐        ┌─────────────────────────┐ │
│  │     PostgreSQL      │        │         Redis           │ │
│  │  ┌───────────────┐  │        │  ┌───────────────────┐  │ │
│  │  │ Users         │  │        │  │ Session Cache     │  │ │
│  │  │ Vehicles      │  │        │  │ Rate Limiting     │  │ │
│  │  │ Drivers       │  │        │  │ Real-time PubSub  │  │ │
│  │  │ Trips         │  │        │  └───────────────────┘  │ │
│  │  │ Maintenance   │  │        └─────────────────────────┘ │
│  │  │ Fuel Logs     │  │                                    │
│  │  └───────────────┘  │                                    │
│  └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Users     │     │   Vehicles   │     │   Drivers    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ email        │     │ name         │     │ name         │
│ password     │     │ license_plate│     │ email        │
│ role         │     │ type         │     │ phone        │
│ created_at   │     │ status       │     │ license_no   │
└──────────────┘     │ capacity_kg  │     │ license_cat  │
                     │ mileage      │     │ license_exp  │
                     │ fuel_type    │     │ safety_score │
                     └──────────────┘     │ status       │
                            │             └──────────────┘
                            │                    │
                            ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐
                     │    Trips     │     │  Fuel Logs   │
                     ├──────────────┤     ├──────────────┤
                     │ id           │     │ id           │
                     │ vehicle_id   │     │ vehicle_id   │
                     │ driver_id    │     │ fuel_type    │
                     │ origin       │     │ quantity     │
                     │ destination  │     │ price/liter  │
                     │ status       │     │ total_cost   │
                     │ cargo_weight │     │ odometer     │
                     │ revenue      │     └──────────────┘
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Maintenance  │
                     ├──────────────┤
                     │ id           │
                     │ vehicle_id   │
                     │ type         │
                     │ description  │
                     │ cost         │
                     │ is_completed │
                     └──────────────┘
```

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Manager** | Full access to all features |
| **Dispatcher** | Create/manage trips, view vehicles & drivers |
| **Safety Officer** | View/update driver profiles, safety scores |
| **Financial Analyst** | View expenses, analytics, generate reports |

---

## License

This project is created for the hackathon evaluation.

---

<div align="center">
  <p>Built with ❤️ for FleetFlow Hackathon 2026</p>
</div>
