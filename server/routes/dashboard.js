import express from 'express';
import { query, usePostgres, localStore } from '../db/index.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (usePostgres) {
      const notesRes = await query(
        'SELECT COUNT(*) as count FROM notes WHERE user_id = $1 AND archived = false',
        [userId]
      );
      const totalNotes = parseInt(notesRes.rows[0].count, 10);

      const openItemsRes = await query(
        "SELECT COUNT(*) as count FROM action_items WHERE user_id = $1 AND status = 'open'",
        [userId]
      );
      const openActionItems = parseInt(openItemsRes.rows[0].count, 10);

      // Completed in the last 7 days
      const completedRes = await query(
        `SELECT COUNT(*) as count FROM action_items 
         WHERE user_id = $1 AND status = 'done' AND updated_at >= NOW() - INTERVAL '7 days'`,
        [userId]
      );
      const completedThisWeek = parseInt(completedRes.rows[0].count, 10);

      const processedRes = await query(
        "SELECT COUNT(*) as count FROM notes WHERE user_id = $1 AND status = 'processed' AND archived = false",
        [userId]
      );
      const processedNotes = parseInt(processedRes.rows[0].count, 10);

      return res.json({
        stats: {
          totalNotes,
          openActionItems,
          completedThisWeek,
          processedNotes
        }
      });
    } else {
      const stats = localStore.getDashboardStats(userId);
      return res.json({ stats });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
