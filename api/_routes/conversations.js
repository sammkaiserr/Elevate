import express from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import Conversation from '../_models/Conversation.js';
import Profile from '../_models/Profile.js';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const auth = getAuth(req);
    const userId = auth.userId || (req.auth && req.auth.userId);

    const conversations = await Conversation.find({ users: { $in: [userId] } })
      .populate('users', 'full_name title image')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    const populatedConvos = await Profile.populate(conversations, {
      path: 'latestMessage.sender_id',
      select: 'full_name title image'
    });

    res.json(populatedConvos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const auth = getAuth(req);
    const userId = auth.userId || (req.auth && req.auth.userId);
    const { partnerId } = req.body;

    if (!partnerId) {
      return res.status(400).json({ error: 'Partner ID is required' });
    }

    let isChat = await Conversation.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: partnerId } } }
      ]
    })
      .populate('users', 'full_name title image')
      .populate('latestMessage');

    isChat = await Profile.populate(isChat, {
      path: 'latestMessage.sender_id',
      select: 'full_name title image'
    });

    if (isChat.length > 0) {
      return res.json(isChat[0]);
    }

    const newChatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [userId, partnerId]
    };

    const createdChat = await Conversation.create(newChatData);
    const fullChat = await Conversation.findOne({ _id: createdChat._id }).populate(
      "users",
      "full_name title image"
    );

    res.status(200).json(fullChat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/group', requireAuth(), async (req, res) => {
  try {
    const auth = getAuth(req);
    const userId = auth.userId || (req.auth && req.auth.userId);
    
    if (!req.body.users || !req.body.name) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    let users = typeof req.body.users === 'string' ? JSON.parse(req.body.users) : req.body.users;

    if (users.length < 2) {
      return res.status(400).json({ error: "More than 2 users are required to form a group chat" });
    }

    users.push(userId);

    const groupChat = await Conversation.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: userId,
    });

    const fullGroupChat = await Conversation.findOne({ _id: groupChat._id })
      .populate("users", "full_name title image")
      .populate("groupAdmin", "full_name title image");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
