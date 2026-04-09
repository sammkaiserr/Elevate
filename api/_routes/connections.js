import express from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import Connection from '../_models/Connection.js';
import Profile from '../_models/Profile.js';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const auth = getAuth(req);
    const userId = auth.userId || (req.auth && req.auth.userId);
    const connections = await Connection.find({
      $or: [{ requester_id: userId }, { addressee_id: userId }]
    }).lean();

    const allUserIds = new Set();
    connections.forEach(c => {
      if (c.requester_id) allUserIds.add(c.requester_id);
      if (c.addressee_id) allUserIds.add(c.addressee_id);
    });

    const profiles = await Profile.find({ _id: { $in: [...allUserIds] } }).lean();
    const profileMap = {};
    profiles.forEach(p => { profileMap[p._id] = p; });

    const formatted = connections.map(c => ({
      ...c,
      id: c._id.toString(),
      requester_id: profileMap[c.requester_id] || c.requester_id,
      addressee_id: profileMap[c.addressee_id] || c.addressee_id,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const auth = getAuth(req);
    const currentUserId = auth.userId || (req.auth && req.auth.userId);
    req.body.requester_id = currentUserId;
    const conn = new Connection(req.body);
    await conn.save();

    if (req.body.addressee_id && req.body.addressee_id !== currentUserId) {
      try {
        const Notification = (await import('../_models/Notification.js')).default;
        const Profile = (await import('../_models/Profile.js')).default;
        

        let requesterName = 'Someone';
        try {
          const requesterProfile = await Profile.findById(currentUserId).lean();
          if (requesterProfile?.full_name) requesterName = requesterProfile.full_name;
        } catch (e) {  }

        const MessageNotif = new Notification({
          user_id: req.body.addressee_id,
          type: 'connection_request',
          message: `${requesterName} has sent you a connection request.`,
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

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const conn = await Connection.findById(req.params.id);
    if (!conn) return res.status(404).json({ error: 'Connection not found' });

    const auth = getAuth(req);
    const userId = auth.userId || (req.auth && req.auth.userId);
    if (conn.requester_id !== userId && conn.addressee_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await Connection.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
