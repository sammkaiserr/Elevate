import express from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import Message from '../_models/Message.js';
import Conversation from '../_models/Conversation.js';

const router = express.Router();

router.get('/:conversationId', requireAuth(), async (req, res) => {
  try {
    const messages = await Message.find({ conversation_id: req.params.conversationId })
      .populate('sender_id', 'full_name title image email')
      .populate('conversation_id')
      .sort({ created_at: 1 });
    

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

router.post('/', requireAuth(), async (req, res) => {
  const { content, conversation_id, image_url } = req.body;
  
  if ((!content && !image_url) || !conversation_id) {
    return res.status(400).json({ error: "Invalid data passed into request" });
  }

  try {
    const auth = getAuth(req);
    const userId = auth.userId || (req.auth && req.auth.userId);

    const newMessage = {
      sender_id: userId,
      content: content || "",
      image_url: image_url || "",
      conversation_id: conversation_id,
    };

    let message = await Message.create(newMessage);

    message = await message.populate('sender_id', 'full_name title image');
    message = await message.populate('conversation_id');
    

    await Conversation.findByIdAndUpdate(req.body.conversation_id, {
      latestMessage: message._id,
    });

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
