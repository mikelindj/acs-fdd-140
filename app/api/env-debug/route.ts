import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  let envLocalContent = null;
  try {
    envLocalContent = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
  } catch {
    envLocalContent = "File not found or readable";
  }

  return Response.json({
    timestamp: new Date().toISOString(),
    environment: {
      DATABASE_URL: process.env.DATABASE_URL ? "✓ Set" : "✗ Not set",
      DATABASE_URL_VALUE: process.env.DATABASE_URL || null,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✓ Set" : "✗ Not set",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "✗ Not set",
      NODE_ENV: process.env.NODE_ENV,
    },
    env_file: {
      content: envLocalContent,
      parsed_database_url: envLocalContent?.match(/DATABASE_URL="([^"]*)"/)?.[1] || null
    }
  })
}