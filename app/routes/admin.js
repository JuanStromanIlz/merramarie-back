import express from 'express';
const adminRouter = express.Router();

//TOKEN VALIDATION
import passport from '../middleware/passport.js';

/* UPLOAD IMAGES SETUP */
import { cloudinaryConfig } from '../config/cloudinary.js';
import { multerUploads, formatToUpload } from '../middleware/multer.js';
adminRouter.use('*', cloudinaryConfig);

/* IMPORT ADMIN CONTROLLER */
import AdminController from '../controllers/admin.js';
const adminCont = new AdminController();
/* CHECK IF FOLDER EXISTS */
import alreadyExists from '../middleware/alreadyExists.js';

adminRouter.post('/', adminCont.logIn);
adminRouter.post('/new', passport.authenticate('jwt',{session: false}), multerUploads.array('images'), alreadyExists, formatToUpload, adminCont.newItem);
adminRouter.patch('/:id', passport.authenticate('jwt',{session: false}), alreadyExists, adminCont.updateItem);
adminRouter.patch('/new_imgs/:id', passport.authenticate('jwt',{session: false}), multerUploads.array('images'), alreadyExists, formatToUpload, adminCont.updateItem);
adminRouter.delete('/:id', passport.authenticate('jwt',{session: false}), adminCont.deleteItem);

export default adminRouter;