# Running Prisma Migrations on Google Cloud SQL

## Option 1: Using Cloud SQL Proxy (Recommended for Local Development)

This is the most secure way to connect to Cloud SQL from your local machine.

### Step 1: Install Cloud SQL Proxy

**macOS:**
```bash
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.arm64
chmod +x cloud-sql-proxy
sudo mv cloud-sql-proxy /usr/local/bin/
```

**Linux:**
```bash
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64
chmod +x cloud-sql-proxy
sudo mv cloud-sql-proxy /usr/local/bin/
```

**Windows:**
Download from: https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.x64.exe
Rename to `cloud-sql-proxy.exe` and add to PATH.

### Step 2: Authenticate with Google Cloud

```bash
gcloud auth application-default login
```

### Step 3: Start Cloud SQL Proxy

Replace `PROJECT_ID`, `REGION`, and `INSTANCE_NAME` with your actual values:

```bash
cloud-sql-proxy PROJECT_ID:REGION:INSTANCE_NAME --port 5432
```

**Example:**
```bash
cloud-sql-proxy my-project:asia-southeast1:acs-fdd-db --port 5432
```

Keep this terminal window open - the proxy will run in the foreground.

### Step 4: Update .env File

In a new terminal, update your `.env` file to use localhost (since the proxy forwards to Cloud SQL):

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/acs_fdd140?schema=public"
```

Replace:
- `USERNAME` with your Cloud SQL database username
- `PASSWORD` with your Cloud SQL database password
- `acs_fdd140` with your database name (if different)

### Step 5: Run Migration

```bash
cd "/Users/michael/Desktop/ACSOBA/FDD Portal/acs-fdd-140"
npx prisma migrate deploy
```

**Note:** Use `migrate deploy` for production databases (applies pending migrations without creating new ones).
Use `migrate dev` only for local development databases.

---

## Option 2: Using Public IP (If Enabled)

If your Cloud SQL instance has a public IP and authorized networks configured:

### Step 1: Update .env File

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@PUBLIC_IP:5432/acs_fdd140?schema=public"
```

Replace:
- `USERNAME` with your Cloud SQL database username
- `PASSWORD` with your Cloud SQL database password
- `PUBLIC_IP` with your Cloud SQL instance's public IP address
- `acs_fdd140` with your database name

### Step 2: Ensure Your IP is Authorized

1. Go to Google Cloud Console → SQL → Your Instance
2. Click "Connections" tab
3. Under "Authorized networks", add your current IP address
4. Save

### Step 3: Run Migration

```bash
cd "/Users/michael/Desktop/ACSOBA/FDD Portal/acs-fdd-140"
npx prisma migrate deploy
```

---

## Option 3: Running from Cloud Run Container (If Already Deployed)

If your app is already deployed to Cloud Run, you can run migrations as part of the deployment process.

### Option A: Add Migration Step to Dockerfile

Add this before the `CMD` line in your Dockerfile:

```dockerfile
# Run migrations before starting the app
RUN npx prisma migrate deploy
```

### Option B: Run Migration Manually via Cloud Run Job

Create a Cloud Run job:

```bash
gcloud run jobs create migrate-db \
  --image gcr.io/PROJECT_ID/acs-fdd140:latest \
  --region asia-southeast1 \
  --set-env-vars DATABASE_URL=$DATABASE_URL \
  --command "npx" \
  --args "prisma,migrate,deploy"
```

Then execute it:

```bash
gcloud run jobs execute migrate-db --region asia-southeast1
```

---

## Finding Your Cloud SQL Connection Details

1. **Project ID:** 
   ```bash
   gcloud config get-value project
   ```

2. **Instance Name & Region:**
   - Go to Google Cloud Console → SQL
   - Click on your instance
   - Check "Instance connection name" (format: `PROJECT_ID:REGION:INSTANCE_NAME`)

3. **Database Username:**
   - Go to Google Cloud Console → SQL → Your Instance → Users
   - Or check your Cloud Run environment variables

4. **Database Password:**
   - Set during instance creation or in Users section
   - Or check your Cloud Run environment variables

---

## Troubleshooting

### "Connection refused" error
- Ensure Cloud SQL Proxy is running (Option 1)
- Check that your IP is authorized (Option 2)
- Verify DATABASE_URL format is correct

### "Authentication failed" error
- Double-check username and password
- Ensure user has proper permissions
- Try resetting the password in Cloud Console

### "Database does not exist" error
- Create the database first:
  ```sql
  CREATE DATABASE acs_fdd140;
  ```
- Or use Cloud Console → SQL → Databases → Create Database

### Migration already applied
- Check migration status:
  ```bash
  npx prisma migrate status
  ```
- If migration shows as applied but schema is out of sync, use:
  ```bash
  npx prisma migrate resolve --applied MIGRATION_NAME
  ```

---

## Quick Reference

**For Production (Cloud SQL):**
```bash
# Use migrate deploy (applies pending migrations)
npx prisma migrate deploy
```

**For Local Development:**
```bash
# Use migrate dev (creates and applies migrations)
npx prisma migrate dev --name migration_name
```

**Check Migration Status:**
```bash
npx prisma migrate status
```

**Generate Prisma Client (after schema changes):**
```bash
npx prisma generate
```

