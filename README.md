# BE-SPOrchestrator

NestJS backend for S&P Orchestrator. Handles authentication via Supabase and exposes a REST API for the Next.js frontend.

## Stack

- **NestJS** — framework
- **PostgreSQL** — database (Supabase)
- **Supabase Auth** — authentication, password recovery, email flows
- **TypeORM** — ORM
- **pnpm** — package manager

## Architecture

Hexagonal (ports & adapters) per module:

```
src/
├── modules/
│   ├── auth/
│   │   ├── domain/ports/          → IAuthProvider
│   │   ├── infrastructure/        → SupabaseAuthAdapter
│   │   ├── application/use-cases/ → Login, Register, ForgotPassword, ResetPassword
│   │   └── presentation/          → AuthController, DTOs
│   └── users/
│       ├── domain/entities/       → User (TypeORM), UserRole
│       ├── domain/ports/          → IUserRepository
│       ├── infrastructure/        → TypeOrmUserRepository
│       └── presentation/          → UsersController, UserResponseDto
└── shared/
    ├── filters/                   → HttpExceptionFilter
    └── guards/                    → JwtAuthGuard
```

## Endpoints

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | `/api/v1/auth/register` | — | 201 |
| POST | `/api/v1/auth/login` | — | 200 |
| POST | `/api/v1/auth/forgot-password` | — | 204 |
| POST | `/api/v1/auth/reset-password` | — | 204 |
| GET | `/api/v1/users/:id` | Bearer JWT | 200 |

## Setup

```bash
pnpm install
```

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3001

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres

FRONTEND_URL=http://localhost:3000
```

## Run

```bash
# development
pnpm start:dev

# production
pnpm build
pnpm start:prod
```

## Test

```bash
pnpm test
pnpm test:e2e
pnpm test:cov
```
