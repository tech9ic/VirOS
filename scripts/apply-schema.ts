import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import * as schema from '../shared/schema';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: databaseUrl,
});

// Create a Drizzle ORM instance with the schema
const db = drizzle(pool, { schema });

async function main() {
  console.log('Applying schema to the database...');
  
  try {
    // Push schema to the database (create missing tables, etc.)
    // We'll manually execute SQL based on our schema
    
    // Create users table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        preferences JSONB
      );
    `);
    
    // Create tags table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id)
      );
    `);
    
    // Create tickets table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'unsolved' CHECK (status IN ('solved', 'unsolved')),
        progress TEXT DEFAULT 'not_started' CHECK (progress IN ('not_started', 'in_progress', 'solved')),
        priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Create ticket_tags table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ticket_tags (
        ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (ticket_id, tag_id)
      );
    `);
    
    // Create attachments table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS attachments (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Create user_activities table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL,
        activity_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Create session table if it doesn't exist (for connect-pg-simple)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    
    console.log('Schema applied successfully');
  } catch (error) {
    console.error('Error applying schema:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

main();