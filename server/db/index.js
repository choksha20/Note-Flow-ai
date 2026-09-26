import pg from 'pg';
import dotenv from 'dotenv';
import { localStore } from './dataStore.js';

dotenv.config();

let pool = null;
let usePostgres = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    usePostgres = true;
    console.log('PostgreSQL database pool initialized.');
  } catch (err) {
    console.warn('Failed to initialize PostgreSQL pool, using local store fallback:', err.message);
    usePostgres = false;
  }
} else {
  console.log('No DATABASE_URL configured. Using local JSON store fallback.');
}

// Database query function
export const query = async (text, params = []) => {
  if (usePostgres && pool) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      // console.log('executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (err) {
      console.error('PostgreSQL Query Error:', err.message);
      throw err;
    }
  } else {
    // Return simulated PG query result format using localStore
    return await executeLocalQuery(text, params);
  }
};

async function executeLocalQuery(text, params) {
  const normalized = text.trim().toLowerCase();
  
  // Create tables migration check
  if (normalized.startsWith('create table')) {
    return { rows: [], rowCount: 0 };
  }

  // Users
  if (normalized.includes('insert into users')) {
    const email = params[0];
    const password_hash = params[1];
    const name = params[2];
    const user = localStore.createUser({ email, password_hash, name });
    return { rows: [user], rowCount: 1 };
  }
  if (normalized.includes('select * from users where email = $1')) {
    const user = localStore.findUserByEmail(params[0]);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }
  if (normalized.includes('select id, email, name, created_at from users where id = $1') || normalized.includes('select * from users where id = $1')) {
    const user = localStore.findUserById(params[0]);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // Notes
  if (normalized.includes('insert into notes')) {
    const [user_id, title, raw_text] = params;
    const note = localStore.createNote({ user_id, title, raw_text });
    return { rows: [note], rowCount: 1 };
  }

  // Fallback for custom routing queries through localStore directly
  return { rows: [], rowCount: 0 };
}

export { usePostgres, localStore };
