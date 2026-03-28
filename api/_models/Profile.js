import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  avatar_url: { type: String, default: '' },
  job_title: { type: String, default: '' },
  bio: { type: String, default: '' },
  university: { type: String, default: '' },
  graduation_year: { type: String },
  company: { type: String, default: '' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model('Profile', profileSchema);
