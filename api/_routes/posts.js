import express from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import Post from '../_models/Post.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ archived: false })
      .populate('user_id', 'full_name avatar_url job_title')
      .sort({ created_at: -1 });
    
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

router.get('/archived', requireAuth(), async (req, res) => {
  try {
    const posts = await Post.find({ archived: true, user_id: req.auth.userId })
      .populate('user_id', 'full_name avatar_url job_title')
      .sort({ created_at: -1 });
    
    const formatted = posts.map(p => {
      const obj = p.toObject();
      obj.profiles = obj.user_id;
      obj.user_id = obj.user_id?._id || obj.user_id;
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
    const checkPost = await Post.findById(req.params.id);
    if (!checkPost) return res.status(404).json({ error: 'Not found' });
    
    const uid = checkPost.user_id._id ? checkPost.user_id._id.toString() : checkPost.user_id.toString();
    if (uid !== req.auth.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this post' });
    }

    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user_id', 'full_name avatar_url job_title');
      
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const checkPost = await Post.findById(req.params.id);
    if (!checkPost) return res.status(404).json({ error: 'Not found' });
    
    const uid = checkPost.user_id._id ? checkPost.user_id._id.toString() : checkPost.user_id.toString();
    if (uid !== req.auth.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
