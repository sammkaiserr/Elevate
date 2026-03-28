import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  requester_id: { type: String, ref: 'Profile', required: true },
  addressee_id: { type: String, ref: 'Profile', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model('Connection', connectionSchema);
