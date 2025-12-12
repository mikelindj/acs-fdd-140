# ACS Founders' Day Dinner 140 Years - Web Application

A complete event ticketing and seating management system for the ACS Founders' Day Dinner celebrating 140 years.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v3.4+** for styling
- **PostgreSQL** with Prisma ORM
- **NextAuth.js** for admin authentication
- **HitPay** payment gateway integration
- **Resend** for transactional emails
- **Zod** for validation
- **dnd-kit** for drag-and-drop table management

## Features

- ✅ Public booking system (tables and individual seats)
- ✅ Magic link-based table management (no login required for buyers)
- ✅ Guest self-registration via invite codes
- ✅ HitPay payment integration with webhook handling
- ✅ Admin dashboard with statistics
- ✅ Visual table assignment with drag-and-drop
- ✅ Broadcast email system with rich text editor
- ✅ Membership number validation
- ✅ Responsive design with ACS brand colors (navy blue + gold)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 16+ (for local development)
- HitPay account and API credentials
- Resend account and API key

## Local Development Setup

### 1. Install PostgreSQL Locally

**macOS (using Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql-16
sudo systemctl start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Local Database

```bash
# Connect to PostgreSQL (replace 'your_username' with your PostgreSQL username)
psql postgres

# Create database
CREATE DATABASE acs_fdd140;

# Exit psql
\q
```

**Note:** If your PostgreSQL requires a password, you'll need to include it in the connection string:
```bash
# Format: postgresql://username:password@localhost:5432/acs_fdd140?schema=public
```

### 3. Clone and Install

```bash
cd acs-fdd-140
npm install
```

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
# Local PostgreSQL Database
# Replace 'your_username' with your PostgreSQL username
# If password is required, use: postgresql://username:password@localhost:5432/acs_fdd140?schema=public
DATABASE_URL="postgresql://your_username@localhost:5432/acs_fdd140?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-dev-secret-change-in-production"

# HitPay (use test/sandbox credentials for local dev)
HITPAY_API_KEY="your-hitpay-api-key"
HITPAY_SALT="your-hitpay-salt"
HITPAY_WEBHOOK_SECRET="your-webhook-secret"

# Resend (use test API key for local dev)
RESEND_API_KEY="re_your-resend-api-key"
RESEND_FROM_EMAIL="noreply@acs.edu.sg"

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Membership Database (optional - leave commented if not using)
# MEMBERSHIP_DB_URL="postgresql://your_username@localhost:5432/membership_db?schema=public"
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates all database tables)
npx prisma migrate dev --name init

# Seed database with sample data (creates admin user and sample tables)
npm run db:seed
```

**Verify database connection:**
```bash
# Open Prisma Studio to view your database in a GUI
npm run db:studio
```

### 6. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Troubleshooting Local Database

**Connection refused error:**
- Ensure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check PostgreSQL is listening on port 5432: `lsof -i :5432`

**Authentication failed:**
- If using password authentication, update `DATABASE_URL` to include password
- Check PostgreSQL user permissions: `psql postgres -c "\du"`

**Database doesn't exist:**
- Create it manually: `psql postgres -c "CREATE DATABASE acs_fdd140;"`

## Default Admin Credentials

After seeding:
- Email: `admin@acs.edu.sg`
- Password: `admin123`

**⚠️ Change these credentials in production!**

## Project Structure

```
acs-fdd-140/
├── app/
│   ├── actions/          # Server actions
│   ├── admin/            # Admin pages (protected)
│   ├── api/              # API routes
│   ├── book/             # Booking page
│   ├── invite/           # Guest registration
│   ├── manage/           # Table management (magic link)
│   ├── payment/          # Payment success/failure
│   └── layout.tsx        # Root layout
├── components/
│   └── ui/               # Reusable UI components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── crypto.ts         # Hash generation
│   ├── email.ts          # Email sending
│   ├── hitpay.ts         # HitPay integration
│   ├── pricing.ts        # Pricing calculations
│   └── validations.ts    # Zod schemas
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts          # Seed file
└── public/               # Static assets
```

## Key Pages

- `/` - Landing page
- `/book` - Booking form
- `/manage?table=xxxxx` - Table management (magic link)
- `/invite?code=xxxxx` - Guest registration
- `/payment/success` - Payment success page
- `/payment/failure` - Payment failure page
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/tables` - Table management
- `/admin/broadcast` - Email broadcast

## API Endpoints

- `POST /api/webhooks/hitpay` - HitPay webhook handler
- `GET /api/membership/validate?membershipNo=xxx` - Validate membership
- `GET /api/bookings?tableHash=xxx` - Get booking by table hash
- `GET /api/admin/tables` - Get tables and guests (admin only)

## Deployment to Google Cloud Run

### 1. Build Docker Image

```bash
# Build the image
docker build -t gcr.io/PROJECT_ID/acs-fdd140:latest .

# Push to Google Container Registry
docker push gcr.io/PROJECT_ID/acs-fdd140:latest
```

### 2. Deploy to Cloud Run

```bash
gcloud run deploy acs-fdd140 \
  --image gcr.io/PROJECT_ID/acs-fdd140:latest \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL,RESEND_API_KEY=$RESEND_API_KEY,HITPAY_API_KEY=$HITPAY_API_KEY,HITPAY_SALT=$HITPAY_SALT,NEXTAUTH_SECRET=$NEXTAUTH_SECRET,NEXTAUTH_URL=https://acs-fdd140.run.app,NEXT_PUBLIC_SITE_URL=https://acs-fdd140.run.app
```

### 3. Create Dockerfile

Create a `Dockerfile` in the root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Update `next.config.js`:

```js
const nextConfig = {
  output: 'standalone',
  // ... rest of config
}
```

## Database Migrations

```bash
# Create a new migration (for local development)
npx prisma migrate dev --name migration_name

# Apply migrations in production (Google Cloud)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data - local dev only)
npx prisma migrate reset
```

## Switching from Local to Google Cloud Database

When ready to deploy to Google Cloud:

1. **Update `.env` file** with your Google Cloud SQL connection string:
   ```env
   # For Cloud SQL Unix socket (recommended)
   DATABASE_URL="postgresql://USERNAME:PASSWORD@/acs_fdd140?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME"
   
   # OR for public IP
   DATABASE_URL="postgresql://USERNAME:PASSWORD@PUBLIC_IP:5432/acs_fdd140?schema=public"
   ```

2. **Run migrations** on the production database:
   ```bash
   npx prisma migrate deploy
   ```

3. **Update other environment variables** for production (NEXTAUTH_URL, NEXT_PUBLIC_SITE_URL, etc.)

## Useful Local Development Commands

```bash
# View database in Prisma Studio (GUI)
npm run db:studio

# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration after schema changes
npx prisma migrate dev --name migration_name

# Reset database and reseed (WARNING: deletes all data)
npx prisma migrate reset
npm run db:seed

# Check database connection
npx prisma db pull  # Pull schema from existing database
```

## Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## Support

For issues or questions, contact the development team.

## License

Proprietary - ACS Founders' Day Dinner 140 Years

