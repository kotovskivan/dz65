import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: String,
  body: String
}, { timestamps: true });

export default mongoose.models.Article || mongoose.model('Article', articleSchema);
