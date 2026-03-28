import express from 'express';
import { requireAuth } from '@clerk/express';
import Message from '../models/Message.js';

const router = express.Router();

// Get messages involving the authenticated user
router.get('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const messages = await Message.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }]
    }).sort({ created_at: 1 });
    
    const formatted = messages.map(m => {
      const obj = m.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send message
router.post('/', requireAuth(), async (req, res) => {
  try {
    req.body.sender_id = req.auth.userId;
    const msg = new Message(req.body);
    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update (e.g. read status)
router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
