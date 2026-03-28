import express from 'express';
import { requireAuth } from '@clerk/express';
import Connection from '../models/Connection.js';

const router = express.Router();

// Get connections for the auth user
router.get('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const connections = await Connection.find({
      $or: [{ requester_id: userId }, { addressee_id: userId }]
    }).populate('requester_id addressee_id', 'full_name avatar_url job_title');
    
    // Map to Supabase-like response
    const formatted = connections.map(c => {
      const obj = c.toObject();
      obj.id = obj._id.toString();
      // Emulate Supabase returning related records
      // The frontend network page expects an array of profiles or similar, this may need frontend adjustment
      return obj;
    });
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create connection request
router.post('/', requireAuth(), async (req, res) => {
  try {
    req.body.requester_id = req.auth.userId;
    const conn = new Connection(req.body);
    await conn.save();
    res.json(conn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update connection status
router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const conn = await Connection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(conn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
