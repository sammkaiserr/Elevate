import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: { type: String, ref: 'Profile', required: true },
  type: { type: String, required: true }, // e.g., 'connection_request', 'message'
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model('Notification', notificationSchema);
