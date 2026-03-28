import express from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import Post from '../models/Post.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ archived: false })
      .populate('user_id', 'full_name avatar_url job_title')
      .sort({ created_at: -1 });
    
    // Map to Supabase expected frontend structure
    const formatted = posts.map(p => {
      const obj = p.toObject();
      obj.profiles = obj.user_id;
      obj.user_id = obj.user_id._id;
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
    const auth = getAuth(req);
    req.body.user_id = auth.userId || (req.auth && req.auth.userId);
    const post = new Post(req.body);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, user_id: req.auth.userId });
    if (!post) return res.status(404).json({ error: 'Not found or unauthorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
