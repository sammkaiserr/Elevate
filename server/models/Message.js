import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: { type: String, ref: 'Profile', required: true },
  receiver_id: { type: String, ref: 'Profile', required: true },
  content: { type: String, required: true },
  is_read: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model('Message', messageSchema);
