import express from 'express';
import { query, usePostgres, localStore } from '../db/index.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createNoteSchema, updateNoteSchema } from '../validators/schemas.js';
import { processNotesWithAI } from '../services/geminiService.js';

const router = express.Router();

// GET /api/notes - List notes for current user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, status, archived, sort } = req.query;

    if (usePostgres) {
      let sql = 'SELECT * FROM notes WHERE user_id = $1';
      const params = [userId];
      let paramIdx = 2;

      if (archived !== undefined && archived !== null && archived !== '') {
        sql += ` AND archived = $${paramIdx++}`;
        params.push(String(archived) === 'true');
      } else {
        sql += ' AND archived = false';
      }

      if (status) {
        sql += ` AND status = $${paramIdx++}`;
        params.push(status);
      }

      if (search) {
        sql += ` AND (LOWER(title) LIKE $${paramIdx} OR LOWER(raw_text) LIKE $${paramIdx} OR LOWER(summary) LIKE $${paramIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        paramIdx++;
      }

      if (sort === 'oldest') {
        sql += ' ORDER BY created_at ASC';
      } else {
        sql += ' ORDER BY created_at DESC';
      }

      const result = await query(sql, params);
      return res.json({ notes: result.rows });
    } else {
      const notes = localStore.getNotesForUser(userId, { search, status, archived, sort });
      return res.json({ notes });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/notes - Create a note
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { raw_text, title: customTitle } = createNoteSchema.parse(req.body);

    const title = customTitle && customTitle.trim().length > 0
      ? customTitle.trim()
      : raw_text.split('\n')[0].substring(0, 60).trim() || 'Untitled Note';

    if (usePostgres) {
      const result = await query(
        `INSERT INTO notes (user_id, title, raw_text, status, archived)
         VALUES ($1, $2, $3, 'draft', false)
         RETURNING *`,
        [userId, title, raw_text]
      );
      return res.status(201).json({ note: result.rows[0] });
    } else {
      const note = localStore.createNote({ user_id: userId, title, raw_text });
      return res.status(201).json({ note });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id - Get single note with its action items
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    if (usePostgres) {
      const noteRes = await query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [noteId, userId]);
      if (noteRes.rows.length === 0) {
        return res.status(404).json({ error: 'Note not found or access denied' });
      }

      const itemsRes = await query(
        'SELECT * FROM action_items WHERE note_id = $1 AND user_id = $2 ORDER BY created_at ASC',
        [noteId, userId]
      );

      return res.json({
        note: noteRes.rows[0],
        action_items: itemsRes.rows
      });
    } else {
      const note = localStore.getNoteById(noteId, userId);
      if (!note) {
        return res.status(404).json({ error: 'Note not found or access denied' });
      }

      const action_items = localStore.getActionItemsForUser(userId, { note_id: noteId });
      return res.json({ note, action_items });
    }
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id - Update note title / raw_text
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { raw_text, title: customTitle } = updateNoteSchema.parse(req.body);

    const title = customTitle && customTitle.trim().length > 0
      ? customTitle.trim()
      : raw_text.split('\n')[0].substring(0, 60).trim() || 'Untitled Note';

    if (usePostgres) {
      const result = await query(
        `UPDATE notes 
         SET title = $1, raw_text = $2, updated_at = NOW() 
         WHERE id = $3 AND user_id = $4 
         RETURNING *`,
        [title, raw_text, noteId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Note not found or access denied' });
      }

      return res.json({ note: result.rows[0], message: 'Note updated successfully' });
    } else {
      const updated = localStore.updateNote(noteId, userId, { title, raw_text });
      if (!updated) {
        return res.status(404).json({ error: 'Note not found or access denied' });
      }
      return res.json({ note: updated, message: 'Note updated successfully' });
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id - Delete or Archive note
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const permanent = req.query.permanent === 'true';

    if (usePostgres) {
      if (permanent) {
        const result = await query('DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id', [noteId, userId]);
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Note not found or access denied' });
        }
        // Action items cascade deleted via ON DELETE CASCADE
        return res.json({ message: 'Note permanently deleted' });
      } else {
        const result = await query(
          'UPDATE notes SET archived = true, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
          [noteId, userId]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Note not found or access denied' });
        }
        return res.json({ message: 'Note archived successfully', note: result.rows[0] });
      }
    } else {
      const success = localStore.deleteNote(noteId, userId, permanent);
      if (!success) {
        return res.status(404).json({ error: 'Note not found or access denied' });
      }
      return res.json({ message: permanent ? 'Note permanently deleted' : 'Note archived successfully' });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/notes/:id/process - Trigger Gemini AI note processing
router.post('/:id/process', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  try {
    // 1. Fetch note
    let note;
    let existingItems = [];

    if (usePostgres) {
      const noteRes = await query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [noteId, userId]);
      if (noteRes.rows.length === 0) {
        return res.status(404).json({ error: 'Note not found or access denied' });
      }
      note = noteRes.rows[0];

      const itemsRes = await query('SELECT * FROM action_items WHERE note_id = $1 AND user_id = $2', [noteId, userId]);
      existingItems = itemsRes.rows;

      // Mark status as 'processing'
      await query("UPDATE notes SET status = 'processing', updated_at = NOW() WHERE id = $1", [noteId]);
    } else {
      note = localStore.getNoteById(noteId, userId);
      if (!note) {
        return res.status(404).json({ error: 'Note not found or access denied' });
      }
      existingItems = localStore.getActionItemsForUser(userId, { note_id: noteId });
      localStore.updateNote(noteId, userId, { status: 'processing' });
    }

    // Map existing completion status by task description
    const statusMap = new Map();
    existingItems.forEach(item => {
      statusMap.set(item.task.trim().toLowerCase(), item.status);
    });

    // 2. Call Gemini service
    try {
      const extracted = await processNotesWithAI(note.raw_text);

      // Save summary and decisions
      const decisionsJson = JSON.stringify(extracted.decisions || []);

      let updatedNote;
      let newActionItems = [];

      if (usePostgres) {
        const updateRes = await query(
          `UPDATE notes 
           SET summary = $1, decisions = $2::jsonb, status = 'processed', updated_at = NOW()
           WHERE id = $3 AND user_id = $4
           RETURNING *`,
          [extracted.summary, decisionsJson, noteId, userId]
        );
        updatedNote = updateRes.rows[0];

        // Delete old action items and insert new ones preserving status if task matches
        await query('DELETE FROM action_items WHERE note_id = $1 AND user_id = $2', [noteId, userId]);

        for (const item of extracted.action_items) {
          const taskNormalized = item.task.trim().toLowerCase();
          const preservedStatus = statusMap.get(taskNormalized) || 'open';

          const insertRes = await query(
            `INSERT INTO action_items (note_id, user_id, task, owner, deadline, priority, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
              noteId,
              userId,
              item.task,
              item.owner || null,
              item.deadline || null,
              item.priority || 'medium',
              preservedStatus
            ]
          );
          newActionItems.push(insertRes.rows[0]);
        }
      } else {
        updatedNote = localStore.updateNote(noteId, userId, {
          summary: extracted.summary,
          decisions: extracted.decisions || [],
          status: 'processed'
        });

        localStore.deleteActionItemsForNote(noteId, userId);

        for (const item of extracted.action_items) {
          const taskNormalized = item.task.trim().toLowerCase();
          const preservedStatus = statusMap.get(taskNormalized) || 'open';

          const createdItem = localStore.createActionItem({
            note_id: noteId,
            user_id: userId,
            task: item.task,
            owner: item.owner || null,
            deadline: item.deadline || null,
            priority: item.priority || 'medium',
            status: preservedStatus
          });
          newActionItems.push(createdItem);
        }
      }

      return res.json({
        message: 'Note processed successfully with AI',
        note: updatedNote,
        action_items: newActionItems
      });

    } catch (aiError) {
      console.error('AI processing failed for note:', noteId, aiError.message);
      
      // Update note status to 'failed' without losing raw_text
      let failedNote;
      if (usePostgres) {
        const failedRes = await query(
          "UPDATE notes SET status = 'failed', updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *",
          [noteId, userId]
        );
        failedNote = failedRes.rows[0];
      } else {
        failedNote = localStore.updateNote(noteId, userId, { status: 'failed' });
      }

      return res.status(500).json({
        error: `AI Processing failed: ${aiError.message}. Your raw text is safe.`,
        note: failedNote
      });
    }

  } catch (err) {
    next(err);
  }
});

export default router;
