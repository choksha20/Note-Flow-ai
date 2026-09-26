import { query, usePostgres } from './index.js';

export async function initDb() {
  if (!usePostgres) {
    console.log('Local store active. Skipping SQL schema migration.');
    return;
  }

  const sql = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    summary TEXT,
    decisions JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft',
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    owner TEXT,
    deadline DATE,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_action_items_user_id ON action_items(user_id);
  CREATE INDEX IF NOT EXISTS idx_action_items_note_id ON action_items(note_id);
  `;

  try {
    await query(sql);
    console.log('PostgreSQL database schema initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL tables:', err.message);
  }
}
