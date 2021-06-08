import cloudinary from 'cloudinary'
const Cloudinary = cloudinary.v2;

const cloudinaryConfig = (req, res, next) => {
  Cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  next();
}
const uploader = Cloudinary.uploader;

export { cloudinaryConfig, uploader};