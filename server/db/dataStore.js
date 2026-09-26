import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'local_db.json');

// Initialize empty DB structure if not exists
const defaultData = {
  users: [],
  notes: [],
  action_items: []
};

function loadData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || [],
      notes: parsed.notes || [],
      action_items: parsed.action_items || []
    };
  } catch (err) {
    console.error('Error reading local_db.json, re-initializing:', err.message);
    return defaultData;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local_db.json:', err.message);
  }
}

export const localStore = {
  getUsers() {
    return loadData().users;
  },
  getNotes() {
    return loadData().notes;
  },
  getActionItems() {
    return loadData().action_items;
  },
  
  // Users
  createUser({ email, password_hash, name }) {
    const data = loadData();
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password_hash,
      name: name || null,
      created_at: new Date().toISOString()
    };
    data.users.push(newUser);
    saveData(data);
    return newUser;
  },
  
  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findUserById(id) {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  },

  updateUserProfile(id, { name, password_hash }) {
    const data = loadData();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    if (name !== undefined) data.users[idx].name = name;
    if (password_hash !== undefined) data.users[idx].password_hash = password_hash;
    saveData(data);
    return data.users[idx];
  },

  // Notes
  createNote({ user_id, title, raw_text }) {
    const data = loadData();
    const now = new Date().toISOString();
    const newNote = {
      id: crypto.randomUUID(),
      user_id,
      title: title || raw_text.split('\n')[0].substring(0, 60) || 'Untitled Note',
      raw_text,
      summary: null,
      decisions: [],
      status: 'draft', // draft | processing | processed | failed
      archived: false,
      created_at: now,
      updated_at: now
    };
    data.notes.push(newNote);
    saveData(data);
    return newNote;
  },

  getNotesForUser(userId, { search, status, archived, sort = 'recent' }) {
    let notes = this.getNotes().filter(n => n.user_id === userId);
    
    if (archived !== undefined && archived !== null && archived !== '') {
      const isArchived = String(archived) === 'true';
      notes = notes.filter(n => n.archived === isArchived);
    } else {
      // By default, exclude archived notes unless specified
      notes = notes.filter(n => !n.archived);
    }

    if (status) {
      notes = notes.filter(n => n.status === status);
    }

    if (search) {
      const term = search.toLowerCase();
      notes = notes.filter(n => 
        n.title.toLowerCase().includes(term) || 
        n.raw_text.toLowerCase().includes(term) ||
        (n.summary && n.summary.toLowerCase().includes(term))
      );
    }

    // Sort
    if (sort === 'oldest') {
      notes.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else {
      notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return notes;
  },

  getNoteById(id, userId) {
    const notes = this.getNotes();
    const note = notes.find(n => n.id === id);
    if (!note) return null;
    if (userId && note.user_id !== userId) return null;
    return note;
  },

  updateNote(id, userId, updates) {
    const data = loadData();
    const idx = data.notes.findIndex(n => n.id === id && n.user_id === userId);
    if (idx === -1) return null;

    const current = data.notes[idx];
    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };
    data.notes[idx] = updated;
    saveData(data);
    return updated;
  },

  deleteNote(id, userId, hardDelete = false) {
    const data = loadData();
    const idx = data.notes.findIndex(n => n.id === id && n.user_id === userId);
    if (idx === -1) return false;

    if (hardDelete) {
      data.notes.splice(idx, 1);
      // Cascade delete action items
      data.action_items = data.action_items.filter(ai => ai.note_id !== id);
    } else {
      // Soft delete / archive
      data.notes[idx].archived = true;
      data.notes[idx].updated_at = new Date().toISOString();
    }

    saveData(data);
    return true;
  },

  // Action Items
  createActionItem({ note_id, user_id, task, owner = null, deadline = null, priority = 'medium', status = 'open' }) {
    const data = loadData();
    const now = new Date().toISOString();
    const newItem = {
      id: crypto.randomUUID(),
      note_id,
      user_id,
      task,
      owner,
      deadline,
      priority: priority || 'medium',
      status: status || 'open',
      created_at: now,
      updated_at: now
    };
    data.action_items.push(newItem);
    saveData(data);
    return newItem;
  },

  getActionItemsForUser(userId, { status, priority, search, note_id }) {
    let items = this.getActionItems().filter(ai => ai.user_id === userId);

    if (note_id) {
      items = items.filter(ai => ai.note_id === note_id);
    }
    if (status) {
      items = items.filter(ai => ai.status === status);
    }
    if (priority) {
      items = items.filter(ai => ai.priority === priority);
    }
    if (search) {
      const term = search.toLowerCase();
      items = items.filter(ai => 
        ai.task.toLowerCase().includes(term) ||
        (ai.owner && ai.owner.toLowerCase().includes(term))
      );
    }

    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return items;
  },

  getActionItemById(id, userId) {
    const items = this.getActionItems();
    const item = items.find(ai => ai.id === id);
    if (!item) return null;
    if (userId && item.user_id !== userId) return null;
    return item;
  },

  updateActionItem(id, userId, updates) {
    const data = loadData();
    const idx = data.action_items.findIndex(ai => ai.id === id && ai.user_id === userId);
    if (idx === -1) return null;

    const current = data.action_items[idx];
    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };
    data.action_items[idx] = updated;
    saveData(data);
    return updated;
  },

  deleteActionItem(id, userId) {
    const data = loadData();
    const idx = data.action_items.findIndex(ai => ai.id === id && ai.user_id === userId);
    if (idx === -1) return false;
    data.action_items.splice(idx, 1);
    saveData(data);
    return true;
  },

  deleteActionItemsForNote(noteId, userId) {
    const data = loadData();
    data.action_items = data.action_items.filter(ai => !(ai.note_id === noteId && ai.user_id === userId));
    saveData(data);
  },

  // Stats
  getDashboardStats(userId) {
    const notes = this.getNotes().filter(n => n.user_id === userId && !n.archived);
    const actionItems = this.getActionItems().filter(ai => ai.user_id === userId);
    
    const totalNotes = notes.length;
    const openActionItems = actionItems.filter(ai => ai.status === 'open').length;
    
    // Completed this week
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const completedThisWeek = actionItems.filter(ai => 
      ai.status === 'done' && new Date(ai.updated_at) >= oneWeekAgo
    ).length;

    const processedNotes = notes.filter(n => n.status === 'processed').length;

    return {
      totalNotes,
      openActionItems,
      completedThisWeek,
      processedNotes
    };
  }
};
