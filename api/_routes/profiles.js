import express from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import Profile from '../_models/Profile.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { full_name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};
    

    const users = await Profile.find(keyword).limit(1000);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {

  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { id, full_name, email } = req.body;
    const auth = getAuth(req);
    const userId = auth.userId || (req.auth && req.auth.userId);
    if (userId !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const profile = await Profile.findByIdAndUpdate(
      id, 
      { full_name, email }, 
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const auth = getAuth(req);
    const userId = auth.userId || (req.auth && req.auth.userId);
    if (userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const profile = await Profile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
