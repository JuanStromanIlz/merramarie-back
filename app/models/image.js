import mongoose from 'mongoose';

const imageSchema = mongoose.Schema({
  cloud_id: String,
  folder: String,
  width: Number,
  height: Number,
  url: String
});

const Image = mongoose.model('Image', imageSchema);

export default Image;