import mongoose from 'mongoose';

const filesSchema = new mongoose.Schema({
  label: String,
  category: String,
  title: String,
  route_title: String,
  description: String,
  videoLink: String
}, { timestamps: { createdAt: 'created_at' } });

const File = mongoose.model('File', filesSchema);

export default File;