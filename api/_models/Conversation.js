import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  isGroupChat: { type: Boolean, default: false },
  chatName: { type: String, trim: true },
  users: [{ type: String, ref: 'Profile' }],
  latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  groupAdmin: { type: String, ref: 'Profile' }
}, {
  timestamps: true
});

export default mongoose.model('Conversation', conversationSchema);
