import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'student' },
  avatar_url: { type: String, default: '' },
  job_title: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  dob: { type: String, default: '' },
  university: { type: String, default: '' },
  field_of_study: { type: String, default: '' },
  graduation_year: { type: String, default: '' },
  company: { type: String, default: '' },
  skills: [{ type: String }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model('Profile', profileSchema);
