import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, usePostgres, localStore } from '../db/index.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { registerSchema, loginSchema, profileUpdateSchema } from '../validators/schemas.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'noteflow_super_secret_jwt_key_2026_production_ready';

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    if (usePostgres) {
      const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const result = await query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
        [email, password_hash, name || null]
      );
      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({ user, token });
    } else {
      const existing = localStore.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user = localStore.createUser({ email, password_hash, name });
      const userResponse = { id: user.id, email: user.email, name: user.name, created_at: user.created_at };
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({ user: userResponse, token });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    let user;
    if (usePostgres) {
      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      user = result.rows[0];
    } else {
      user = localStore.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userResponse = { id: user.id, email: user.email, name: user.name, created_at: user.created_at };
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ user: userResponse, token });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    let user;
    if (usePostgres) {
      const result = await query('SELECT id, email, name, created_at FROM users WHERE id = $1', [req.user.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      user = result.rows[0];
    } else {
      const found = localStore.findUserById(req.user.id);
      if (!found) {
        return res.status(404).json({ error: 'User not found' });
      }
      user = { id: found.id, email: found.email, name: found.name, created_at: found.created_at };
    }

    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = profileUpdateSchema.parse(req.body);

    let user;
    if (usePostgres) {
      const resUser = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
      user = resUser.rows[0];
    } else {
      user = localStore.findUserById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let newHash = undefined;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) {
        return res.status(400).json({ error: 'Incorrect current password' });
      }
      newHash = await bcrypt.hash(newPassword, 10);
    }

    if (usePostgres) {
      const updatedName = name !== undefined ? name : user.name;
      const updatedHash = newHash !== undefined ? newHash : user.password_hash;
      const result = await query(
        'UPDATE users SET name = $1, password_hash = $2 WHERE id = $3 RETURNING id, email, name, created_at',
        [updatedName, updatedHash, req.user.id]
      );
      return res.json({ user: result.rows[0], message: 'Profile updated successfully' });
    } else {
      const updated = localStore.updateUserProfile(req.user.id, { name, password_hash: newHash });
      const userResponse = { id: updated.id, email: updated.email, name: updated.name, created_at: updated.created_at };
      return res.json({ user: userResponse, message: 'Profile updated successfully' });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
