const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing Supabase URL or key in environment variables');
  process.exit(1);
}

async function runMigration() {
  const migrationFile = path.join(__dirname, '016_add_booking_id_column.sql');
  
  if (!fs.existsSync(migrationFile)) {
    console.error(`Error: Migration file not found at ${migrationFile}`);
    process.exit(1);
  }

  console.log('Running migration...');
  
  // Use psql to run the migration
  const command = `psql "${SUPABASE_URL.replace('http', 'postgres')}" -f "${migrationFile.replace(/\\/g, '/')}"`;
  
  console.log(`Executing: ${command}`);
  
  exec(command, { env: { ...process.env, PGPASSWORD: SUPABASE_KEY } }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing migration: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Migration error: ${stderr}`);
      return;
    }
    console.log('Migration output:', stdout);
    console.log('✅ Migration completed successfully!');
  });
}

runMigration();
