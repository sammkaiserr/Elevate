import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: { type: String, ref: 'Profile', required: true },
  content: { type: String, trim: true },
  image_url: { type: String },
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  is_read: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model('Message', messageSchema);
