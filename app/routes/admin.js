import express from 'express';
const adminRouter = express.Router();

//TOKEN VALIDATION
import passport from '../middleware/passport.js';

/* UPLOAD IMAGES SETUP */
import {cloudinaryConfig} from '../config/cloudinary.js';
import {multerUploads, formatToUpload} from '../middleware/multer.js';
adminRouter.use('*', cloudinaryConfig);

/* IMPORT ADMIN CONTROLLER */
import AdminController from '../controllers/admin.js';
const adminCont = new AdminController();
/* CHECK IF FOLDER EXISTS */
import alreadyExists from '../middleware/alreadyExists.js';

adminRouter.post('/log_in', adminCont.logIn);
//Get items
adminRouter.get('/label/:label', passport.authenticate('jwt',{session: false}), adminCont.getList);
adminRouter.get('/folder/:name', passport.authenticate('jwt',{session: false}), adminCont.getItem);
//New item
adminRouter.post('/new', passport.authenticate('jwt',{session: false}), alreadyExists, adminCont.newItem);
adminRouter.post('/new_with_imgs', passport.authenticate('jwt',{session: false}), multerUploads.array('images'), alreadyExists, formatToUpload, adminCont.newItem);
//Edit item
adminRouter.patch('/edit/:name', passport.authenticate('jwt',{session: false}), alreadyExists, adminCont.updateItem);
adminRouter.patch('/edit_new_imgs/:name', passport.authenticate('jwt',{session: false}), multerUploads.array('images'), alreadyExists, formatToUpload, adminCont.updateItem);
//Delete item
adminRouter.delete('/delete/:name', passport.authenticate('jwt',{session: false}), adminCont.deleteItem);

export default adminRouter;