import express from 'express';
import { requireAuth } from '@clerk/express';
import Connection from '../_models/Connection.js';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const connections = await Connection.find({
      $or: [{ requester_id: userId }, { addressee_id: userId }]
    }).populate('requester_id addressee_id', 'full_name avatar_url job_title');
    
    const formatted = connections.map(c => {
      const obj = c.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    req.body.requester_id = req.auth.userId;
    const conn = new Connection(req.body);
    await conn.save();

    // Send a notification to the addressee
    if (req.body.addressee_id && req.body.addressee_id !== req.auth.userId) {
      try {
        const Notification = (await import('../_models/Notification.js')).default;
        const MessageNotif = new Notification({
          user_id: req.body.addressee_id,
          type: 'connection_request',
          message: 'Someone wants to connect with you.',
          is_read: false
        });
        await MessageNotif.save();
      } catch (notifErr) {
        console.error('Error creating connection notification:', notifErr);
      }
    }

    res.json(conn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const conn = await Connection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(conn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
