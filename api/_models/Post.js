import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user_id: { type: String, ref: 'Profile', required: true },
  title: { type: String, required: true },
  content: { type: String },
  cover_image_url: { type: String },
  tags: [{ type: String }],
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  comment_count: { type: Number, default: 0 },
  archived: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

postSchema.index({ archived: 1, created_at: -1 });
postSchema.index({ user_id: 1, archived: 1 });

export default mongoose.model('Post', postSchema);
