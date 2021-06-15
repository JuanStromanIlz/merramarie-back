import mongoose from 'mongoose';

const imageSchema = mongoose.Schema({
  cloud_id: String,
  label: String,
  folder: String,
  width: String,
  height: String,
  url: String
});

const Image = mongoose.model('Image', imageSchema);

export default Image;