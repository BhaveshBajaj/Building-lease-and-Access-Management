require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../src/config/logger');

/**
 * Script to run database migrations
 * Executes SQL migration files in order
 */

async function runMigrations() {
  try {
    logger.info('Starting database migration...');

    const migrationsDir = path.join(__dirname, '..', 'migrations', 'supabase', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      logger.error('Migrations directory not found:', migrationsDir);
      process.exit(1);
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      logger.warn('No migration files found');
      return;
    }

    logger.info(`Found ${migrationFiles.length} migration file(s)`);

    for (const file of migrationFiles) {
      logger.info(`Running migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Use psql to execute the migration
      const DATABASE_URL = process.env.DATABASE_URL;
      
      if (!DATABASE_URL) {
        throw new Error('DATABASE_URL not found in environment variables');
      }

      try {
        execSync(`psql "${DATABASE_URL}" -f "${filePath}"`, {
          stdio: 'inherit'
        });
        logger.info(`✅ Completed: ${file}`);
      } catch (error) {
        logger.error(`❌ Failed: ${file}`);
        throw error;
      }
    }

    logger.info('\n✅ All migrations completed successfully!');
    process.exit(0);

  } catch (error) {
    logger.error('❌ Migration failed:', error);
    logger.info('\nAlternative: You can manually run migrations using Supabase CLI:');
    logger.info('  1. Install Supabase CLI: npm install -g supabase');
    logger.info('  2. Link project: supabase link --project-ref <your-project-ref>');
    logger.info('  3. Apply migrations: supabase db push');
    logger.info('\nOr execute the SQL files directly in Supabase SQL Editor');
    process.exit(1);
  }
}

runMigrations();
