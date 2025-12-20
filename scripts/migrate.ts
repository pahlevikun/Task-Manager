import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://admin:password@localhost:5432/task_manager';

// Ensure migrations directory exists
if (!fs.existsSync(MIGRATIONS_DIR)) {
  fs.mkdirSync(MIGRATIONS_DIR);
}

const client = new Client({
  connectionString: DATABASE_URL,
});

async function runMigration() {
  const args = process.argv.slice(2);
  const command = args[0];
  const name = args[1];

  if (command === 'create') {
    if (!name) {
      console.error('Usage: migrate create <name>');
      process.exit(1);
    }
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const upFileName = `${timestamp}_${name}.up.sql`;
    const downFileName = `${timestamp}_${name}.down.sql`;

    fs.writeFileSync(path.join(MIGRATIONS_DIR, upFileName), '-- Up migration');
    fs.writeFileSync(path.join(MIGRATIONS_DIR, downFileName), '-- Down migration');

    console.log(`Created migration: ${upFileName}`);
    console.log(`Created migration: ${downFileName}`);
    process.exit(0);
  }

  try {
    await client.connect();
    
    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    if (command === 'up') {
      const { rows } = await client.query('SELECT name FROM migrations');
      const appliedMigrations = new Set(rows.map(row => row.name));

      const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.up.sql')).sort();

      for (const file of files) {
        if (!appliedMigrations.has(file)) {
          console.log(`Applying migration: ${file}`);
          const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
          await client.query('BEGIN');
          try {
            await client.query(sql);
            await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
            await client.query('COMMIT');
            console.log(`Applied migration: ${file}`);
          } catch (err) {
            await client.query('ROLLBACK');
            console.error(`Failed to apply migration ${file}:`, err);
            process.exit(1);
          }
        }
      }
      console.log('All migrations applied.');
    } else if (command === 'down') {
      const { rows } = await client.query('SELECT name FROM migrations ORDER BY id DESC LIMIT 1');
      if (rows.length === 0) {
        console.log('No migrations to rollback.');
        process.exit(0);
      }

      const lastMigration = rows[0].name;
      const downFile = lastMigration.replace('.up.sql', '.down.sql');
      
      if (fs.existsSync(path.join(MIGRATIONS_DIR, downFile))) {
        console.log(`Rolling back migration: ${lastMigration}`);
        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, downFile), 'utf8');
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('DELETE FROM migrations WHERE name = $1', [lastMigration]);
          await client.query('COMMIT');
          console.log(`Rolled back migration: ${lastMigration}`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`Failed to rollback migration ${lastMigration}:`, err);
          process.exit(1);
        }
      } else {
        console.error(`Down migration file not found: ${downFile}`);
        process.exit(1);
      }
    } else {
      console.error('Unknown command. Use create, up, or down.');
      process.exit(1);
    }

  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
