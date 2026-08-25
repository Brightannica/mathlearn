# MathLearn Deployment Guide

## Prerequisites

1. A Supabase project with the database schema applied
2. A hosting account (Render, Fly.io, Railway, or any VPS)
3. Google OAuth credentials (optional)

## Environment Variables

Create a `.env.production` file with the following variables:

```env
# Database (if using Prisma directly)
DATABASE_URL="postgresql://user:password@host:5432/mathlearn?schema=public"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-strong-secret-here-generate-with-openssl-rand-base64-32"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# App URL (public)
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Optional: Demo mode (development only)
NEXT_PUBLIC_DEMO_EMAIL="demo@mathlearn.app"
NEXT_PUBLIC_DEMO_PASSWORD="demopass"
```

## Deployment Options (No GitHub Required)

### Option 1: Render.com (Recommended - Free Tier Available)

1. Create a Render account at https://render.com
2. Click "New" → "Deploy from local files" or use the Render CLI
3. Connect your Supabase database or use Render's PostgreSQL
4. Set environment variables in Render dashboard
5. Deploy

**Or use Render CLI:**
```bash
npm install -g render
render deploy
```

### Option 2: Fly.io

1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Create a `fly.toml`:
```toml
app = "mathlearn"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
```

3. Deploy:
```bash
flyctl launch
flyctl deploy
```

### Option 3: Railway.app

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

### Option 4: Docker to Any VPS

1. Build the Docker image:
```bash
docker build -t mathlearn .
```

2. Run the container:
```bash
docker run -d \
  --name mathlearn \
  -p 3000:3000 \
  -e NEXTAUTH_URL=https://your-domain.com \
  -e NEXTAUTH_SECRET=your-secret \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  mathlearn
```

### Option 5: Netlify Drop (Static Export)

Note: Next.js with server-side features requires a server. Netlify Drop works best for static sites. For full functionality, use Option 1-4.

## Access Restriction

The app uses authentication by default. All dashboard routes require login.

### Restricting Access Further

To restrict access to specific email domains or users:

1. Update `src/proxy.ts` to add IP whitelisting or email domain checks
2. Update `src/lib/auth.ts` to add custom authorization logic
3. Use Supabase RLS policies to restrict data access at the database level

### Example: Email Domain Restriction

Update the `authorize` callback in `src/lib/auth.ts`:

```typescript
async authorize(credentials) {
  // ... existing logic ...
  
  // Restrict to specific email domain
  const allowedDomains = ["your-school.edu", "your-organization.com"];
  const userDomain = user.email.split("@")[1];
  
  if (!allowedDomains.includes(userDomain)) {
    return null;
  }
  
  // ... rest of logic ...
}
```

## Database Setup

Run the Supabase migrations:

```bash
npm run db:migrate
```

Or apply the SQL migrations directly in the Supabase SQL editor.

## Security Notes

1. **Never commit `.env` files** - They contain secrets
2. **Use strong NEXTAUTH_SECRET** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS** - Required for OAuth and secure cookies
4. **Configure CORS** - Update `next.config.ts` for your domain
5. **Enable RLS** - Supabase Row Level Security is enabled by default

## Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Check that Supabase credentials are correct
- Verify database migrations have been run

### Authentication Issues
- Check NEXTAUTH_URL matches your deployed domain
- Verify Google OAuth redirect URIs are configured
- Check browser console for CORS errors

### Database Errors
- Verify Supabase project is active
- Check RLS policies allow the necessary operations
- Ensure all migrations have been applied
