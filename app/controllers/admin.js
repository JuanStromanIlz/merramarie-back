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
    const {label, category, title, description, videoLink} = req.body;
    const images = res.locals.images;
    try {
      const item = await new File({
        label: label,
        category: category,
        title: title,
        description: description,
        videoLink: videoLink
      }).save();
      const newImages = await images.map(img => {
        new Image({
          cloud_id: img.public_id,
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
    try {
      const file = await File.updateOne({_id: id}, updateItem, { new: true });
      if (file) {
        return res.status(201).json('Item editado con exito');
      }
    } catch(err) {
      next(err);
    }
  }
  async deleteItem(req, res, next) {
    const {id} = req.params;
    // try {
    //   let folderName = await File.findOne({_id: id});
    //   folderName = folderName.title;
    //   let imagesToDelete = await Image.find({folder: id});
    //   imagesToDelete = imagesToDelete.map(({cloud_id}) => cloud_id);
    //   const deleteFolder = await File.deleteOne({_id: id});
    //   const deleteImages = await Image.deleteMany({folder: id});
    //   if (deleteFolder && deleteImages) {
    //     api.delete_resources(imagesToDelete, (err, res) => {
    //       if (!err) {
    //         api.delete_folder(folderName, (err, res) => {
    //           if (!err) {
    //             return res.status(200).send('Item eliminado con exito');
    //           }
    //         });
    //       }
    //     });
    //   }
    // } catch(err) {
    //   next(err);
    // }
  }
}

export default AdminController;