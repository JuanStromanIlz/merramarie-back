import multer from 'multer';
import { uploader } from '../config/cloudinary.js';

/* MULTER CONFIG TO PROCESS FILES */

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/gif' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  }else{
    cb(null, false);
  }
};
const multerUploads = multer({
  storage: storage,
  fileFilter: fileFilter
});

/* MIDDLEWARE TO UPLOAD IMAGE TO CLOUDINARY */

const formatToUpload = async(req, res, next) => {
  try {
    let pictureFiles = req.files;
    let folderName = req.body.title;
    //Map through images and create a promise array using cloudinary upload function
    let multiplePicturePromise = pictureFiles.map((picture) =>
      uploader.upload(`data:${picture.mimetype};base64,${picture.buffer.toString('base64')}`, {
        folder: `/portfolio/${folderName}`
      })
    );
    //Await all the cloudinary upload functions in promise.all
    let imageResponses = await Promise.all(multiplePicturePromise);
    let images = imageResponses.map(({public_id, url}) => ({public_id, url}));
    //Passing to the next middleware
    res.locals.images = images;
    next();
  } catch (err) {
    res.send('Ocurrio un error al intentar guardar la imagen');
  }
}

export { multerUploads, formatToUpload };