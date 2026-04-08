import express from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import Comment from '../_models/Comment.js';
import Post from '../_models/Post.js';

const router = express.Router();

router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post_id: req.params.postId })
      .populate('user_id', 'full_name avatar_url job_title')
      .sort({ created_at: -1 });

    const formatted = comments.map(c => {
      const obj = c.toObject();
      obj.profiles = obj.user_id;
      if (obj.user_id) obj.user_id = obj.user_id._id;
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
    const userId = auth.userId || (req.auth && req.auth.userId);
    
    const { post_id, content } = req.body;
    if (!post_id || !content) return res.status(400).json({ error: 'Missing fields' });

    const comment = await Comment.create({
      post_id,
      user_id: userId,
      content,
    });

    await comment.populate('user_id', 'full_name avatar_url job_title');
    

    await Post.findByIdAndUpdate(post_id, { $inc: { comment_count: 1 } });

    const obj = comment.toObject();
    obj.profiles = obj.user_id;
    if (obj.user_id) obj.user_id = obj.user_id._id;
    obj.id = obj._id.toString();

    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
