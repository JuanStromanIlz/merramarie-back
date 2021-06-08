import jwt from 'jsonwebtoken';
import File from '../models/file.js';
import Image from '../models/image.js';
import User from '../models/user.js';
import {uploader} from '../config/cloudinary.js';

class AdminController {
  async logIn(req, res, next) {
    const { username, password } = req.body;
    try {
      //Check If User Exists
      let foundUser = await User.findOne({username});
      if (!foundUser) {
        return res.status(404).json({
          error: 'Ningun usuario bajo este nombre'
        });
      }
      const { user } = await User.authenticate()(username, password);
      if (!user) {
        return res.status(401).json({
          error: 'Alguno de los datos proporcionados es incorrecto'
        });
      } else {
        //Generate a token for auth
        const token = jwt.sign({
          id: user._id
        }, process.env.JWT_SECRET);
        return res.status(200).send(token);
      }
    } catch(err) {
      return next(err);
    }
  }
  async newItem(req, res, next) {
    let {label, category, title, description, videoLink} = req.body;
    title = title.trim();
    let routeTitle = title.toLowerCase();
    routeTitle = routeTitle.replace(/ /g, '_');
    const images = res.locals.images;
    try {
      const item = await new File({
        label: label,
        category: category,
        title: title,
        route_title: routeTitle,
        description: description,
        videoLink: videoLink
      }).save();
      const newImages = await images.map(img => {
        new Image({
          cloud_id: img.public_id,
          label: item.label,
          folder: item._id,
          url: img.url
        }).save();
      });
      if (item && newImages) {
        return res.status(201).send('Item creado con exito');
      }
    } catch(err) {
      next(err);
    }
  }
  async updateItem(req, res, next) {
    const {id} = req.params;
    const updateItem = req.body;
    for (let prop in updateItem) {
      if (updateItem[prop] === null || updateItem[prop] === undefined || updateItem[prop].length === 0) {
        delete updateItem[prop];
      }
    }
    if ('title' in updateItem) {
      let title = updateItem.title.trim();
      let routeTitle = title.toLowerCase();
      routeTitle = routeTitle.replace(/ /g, '_');
      updateItem.title = title;
      updateItem.route_title = routeTitle;
    }
    try {
      const file = await File.findOneAndUpdate({_id: id}, updateItem, { new: true });
      //If images was deleted
      if (updateItem.deleteImgs != undefined) {
        let deletePromises = updateItem.deleteImgs.map(path => Image.deleteOne({cloud_id: path}));
        let deletedImages = Promise.all(deletePromises);
        if (deletedImages) {
          let cloudPromises = updateItem.deleteImgs.map(path => uploader.destroy(path));
          Promise.all(cloudPromises);
        }
      }
      //If new imgs are being added
      if ('files' in req) {
        const images = res.locals.images;
        const newImages = await images.map(img => {
          new Image({
            cloud_id: img.public_id,
            label: file.label,
            folder: file._id,
            url: img.url
          }).save();
        });
      }
      return res.status(201).send('Item editado con exito');
    } catch(err) {
      next(err);
    }
  }
  async deleteItem(req, res, next) {
    const {id} = req.params;
    try {
      //Delete the folder and use his id to delete Images model and cloud host
      let folder= await File.findOneAndDelete({_id: id});
      let imagesToDelete = await Image.find({folder: folder._id});
      //Check if file have images
      if (imagesToDelete.length > 0) {
        imagesToDelete = imagesToDelete.map(({cloud_id}) => uploader.destroy(cloud_id));
        let cloudDeleted = Promise.all(imagesToDelete);
        let imagesDeleted = await Image.deleteMany({folder: folder._id});
      }
      return res.status(200).send('Item eliminado con exito');
    } catch(err) {
      next(err);
    }
  }
}

export default AdminController;