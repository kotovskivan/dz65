import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, default: '' },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
