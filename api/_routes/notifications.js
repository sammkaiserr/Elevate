import express from 'express';
import { requireAuth } from '@clerk/express';
import Notification from '../_models/Notification.js';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const notifs = await Notification.find({ user_id: req.auth.userId }).sort({ created_at: -1 });
    const formatted = notifs.map(n => {
      const obj = n.toObject();
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
    const notif = new Notification(req.body);
    await notif.save();
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
