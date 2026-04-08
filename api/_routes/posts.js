import express from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import Post from '../_models/Post.js';
import Profile from '../_models/Profile.js';

// Helper: attach profile info to an array of plain post objects
// user_id on posts is a Clerk string ID — populate() won't work, so we do it manually.
async function attachProfiles(posts) {
  const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))];
  const profiles = userIds.length
    ? await Profile.find({ _id: { $in: userIds } }).lean()
    : [];
  const profileMap = {};
  profiles.forEach(p => { profileMap[p._id] = p; });

  return posts.map(p => ({
    ...p,
    id: p._id.toString(),
    profiles: profileMap[p.user_id] || null,
  }));
}

const router = express.Router();

// ─── Search endpoint ────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');
    const posts = await Post.find({
      archived: false,
      $or: [
        { title: regex },
        { content: regex },
        { tags: regex },
      ],
    })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    const formatted = await attachProfiles(posts);
    res.json(formatted);
  } catch (err) {
    console.error('Error searching posts:', err);
    res.status(500).json({ error: err.message });
  }
});
// ────────────────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ archived: false })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    const formatted = await attachProfiles(posts);
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching feed posts:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/archived', requireAuth(), async (req, res) => {
  try {
    const posts = await Post.find({ archived: true, user_id: req.auth.userId })
      .sort({ created_at: -1 })
      .lean();

    const formatted = await attachProfiles(posts);
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching archived posts:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ archived: false, user_id: req.params.userId })
      .sort({ created_at: -1 })
      .lean();

    const formatted = await attachProfiles(posts);
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ error: err.message });
  }
});
router.get('/my', requireAuth(), async (req, res) => {
  try {
    const posts = await Post.find({ archived: false, user_id: req.auth.userId })
      .sort({ created_at: -1 });
    const formatted = posts.map(p => {
      const obj = p.toObject();
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
    
    const uid = checkPost.user_id ? checkPost.user_id.toString() : '';
    if (uid !== req.auth.userId) {
      console.error(`Auth mismatch: post uid=${uid}, req userId=${req.auth.userId}`);
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
    
    const uid = checkPost.user_id ? checkPost.user_id.toString() : '';
    if (uid !== req.auth.userId) {
      console.error(`Auth mismatch: post uid=${uid}, req userId=${req.auth.userId}`);
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
