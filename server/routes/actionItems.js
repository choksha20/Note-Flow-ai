import express from 'express';
import { query, usePostgres, localStore } from '../db/index.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { updateActionItemSchema } from '../validators/schemas.js';

const router = express.Router();

// GET /api/action-items - List action items for logged in user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, priority, search, note_id } = req.query;

    if (usePostgres) {
      let sql = `
        SELECT ai.*, n.title as note_title 
        FROM action_items ai 
        LEFT JOIN notes n ON ai.note_id = n.id 
        WHERE ai.user_id = $1
      `;
      const params = [userId];
      let paramIdx = 2;

      if (status && status !== 'all') {
        sql += ` AND ai.status = $${paramIdx++}`;
        params.push(status);
      }

      if (priority && priority !== 'all') {
        sql += ` AND ai.priority = $${paramIdx++}`;
        params.push(priority);
      }

      if (note_id) {
        sql += ` AND ai.note_id = $${paramIdx++}`;
        params.push(note_id);
      }

      if (search) {
        sql += ` AND (LOWER(ai.task) LIKE $${paramIdx} OR LOWER(ai.owner) LIKE $${paramIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        paramIdx++;
      }

      sql += ' ORDER BY ai.created_at DESC';

      const result = await query(sql, params);
      return res.json({ action_items: result.rows });
    } else {
      let items = localStore.getActionItemsForUser(userId, { status: status === 'all' ? null : status, priority: priority === 'all' ? null : priority, search, note_id });
      // Attach note title
      const notes = localStore.getNotes();
      items = items.map(item => {
        const parent = notes.find(n => n.id === item.note_id);
        return {
          ...item,
          note_title: parent ? parent.title : 'Untitled Note'
        };
      });
      return res.json({ action_items: items });
    }
  } catch (err) {
    next(err);
  }
});

// PATCH /api/action-items/:id - Update action item (status, task, owner, deadline, priority)
router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const updates = updateActionItemSchema.parse(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    if (usePostgres) {
      // Build dynamic UPDATE query
      const setClauses = [];
      const params = [];
      let paramIdx = 1;

      Object.entries(updates).forEach(([key, val]) => {
        setClauses.push(`${key} = $${paramIdx++}`);
        params.push(val);
      });

      setClauses.push(`updated_at = NOW()`);
      params.push(itemId);
      params.push(userId);

      const sql = `
        UPDATE action_items 
        SET ${setClauses.join(', ')} 
        WHERE id = $${paramIdx - 1} AND user_id = $${paramIdx}
        RETURNING *
      `;

      const result = await query(sql, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Action item not found or access denied' });
      }

      return res.json({ action_item: result.rows[0], message: 'Action item updated' });
    } else {
      const updated = localStore.updateActionItem(itemId, userId, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Action item not found or access denied' });
      }
      return res.json({ action_item: updated, message: 'Action item updated' });
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/action-items/:id - Delete an action item
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    if (usePostgres) {
      const result = await query('DELETE FROM action_items WHERE id = $1 AND user_id = $2 RETURNING id', [itemId, userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Action item not found or access denied' });
      }
      return res.json({ message: 'Action item deleted successfully' });
    } else {
      const success = localStore.deleteActionItem(itemId, userId);
      if (!success) {
        return res.status(404).json({ error: 'Action item not found or access denied' });
      }
      return res.json({ message: 'Action item deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
