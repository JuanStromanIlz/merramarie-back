import jwt from 'jsonwebtoken';
import File from '../models/file.js';
import Image from '../models/image.js';
import User from '../models/user.js';
import { uploader } from '../config/cloudinary.js';

class AdminController {
  /* LOG IN */
  async logIn(req, res, next) {
    const {username, password} = req.body;
    try {
      //Check If User Exists
      let foundUser = await User.findOne({username});
      if (!foundUser) {
        return res.status(401).json({
          error: 'Ningun usuario bajo este nombre'
        });
      }
      const {user} = await User.authenticate()(username, password);
      if (!user) {
        return res.status(401).json({
          error: 'Alguno de los datos proporcionados es incorrecto'
        });
      } else {
        //Generate a token for auth
        const token = jwt.sign({
          id: user._id
        }, process.env.JWT_SECRET);
        return res.status(200).json(token);
      }
    } catch(err) {
      return next(err);
    }
  }
  /* GET ITEMS IN A LABEL */
  async getList(req, res, next) {
    const labelToGet = req.params.label;
    try {
      const list = await File.find({label: labelToGet}).sort({'created_at': -1});;
      const imagesList = await Image.find({});
      const data = [];
      if (list && imagesList) {
        list.map(item => {
          let imagesPerFolder = imagesList.filter(img => img.folder == item._id);
          if (imagesPerFolder.length > 0) {
            let imagesData = [];
            imagesPerFolder = imagesPerFolder.map(img => {
              let newImg = {
                path: img.cloud_id,
                width: img.width,
                height: img.height,
                url: img.url
              };
              imagesData.push(newImg);
            });
            let itemToSend = {
              label: item.label,
              category: item.category,
              title: item.title,
              route_title: item.route_title,
              description: item.description,
              videoLink: item.videoLink,
              images: imagesData
            };
            data.push(itemToSend);
          } else {
            let itemToSend = {
              label: item.label,
              category: item.category,
              title: item.title,
              route_title: item.route_title,
              description: item.description,
              videoLink: item.videoLink
            };
            data.push(itemToSend);
          }  
        });
        return res.status(200).json(data);
      }
    } catch(err) {
      next(err);
    }
  }
  /* GET ITEM */
  async getItem(req, res, next) {
    const routeTitle = req.params.folder;
    const folder = req.params.label;
    try {
      const item = await File.findOne({label: folder, route_title: routeTitle});
      // Get the next record in a label
      let nextOne = null;
      const label = await File.find({label: item.label}).sort({'updatedAt': -1});
      if (label) {
        for (let i = 0; i < label.length; i++) {
          let folder = label[i];
          let nextFolder = i+1;
          if (folder.title === item.title) {
            if (nextFolder < label.length) {
              nextOne = label[nextFolder];
            } else {
              nextOne = null;
            }
          }
        }
      }
      const imagesList = await Image.find({folder: item._id});
      if (item && imagesList && label) {
        if (imagesList.length > 0) {
          let imagesData = [];
          imagesList.map(img => {
            let newImg = {
              path: img.cloud_id,
              width: img.width,
              height: img.height,
              url: img.url
            };
            imagesData.push(newImg);
          });
          let itemToSend = {
            label: item.label,
            category: item.category,
            title: item.title,
            route_title: item.route_title,
            description: item.description,
            videoLink: item.videoLink,
            images: imagesData,
            nextFolder: nextOne
          };
          return res.status(200).json(itemToSend);
        } else {
          let itemToSend = {
            label: item.label,
            category: item.category,
            title: item.title,
            route_title: item.route_title,
            description: item.description,
            videoLink: item.videoLink,
            nextFolder: nextOne
          };
          return res.status(200).json(itemToSend);
        }
      }
    } catch(err) {
      next(err);
    }
  }
  /* NEW ITEM */
  async newItem(req, res, next) {
    let {label, category, title, description, videoLink} = req.body;
    title = title.trim();
    let routeTitle = title.toLowerCase();
    routeTitle = routeTitle.replace(/[^a-zA-Z ]/g, "");
    routeTitle = routeTitle.replace(/ /g, '_');
    try {
      const item = await new File({
        label: label,
        category: category,
        title: title,
        route_title: routeTitle,
        description: description,
        videoLink: videoLink
      }).save();
      //Ask for imgs
      if ('files' in req) {
        const images = res.locals.images;
        await images.map(img => {
          new Image({
            cloud_id: img.public_id,
            folder: item._id,
            width: img.width,
            height: img.height,
            url: img.secure_url
          }).save();
        });
      }
      return res.status(201).json({message: 'Item creado con exito'});
    } catch(err) {
      next(err);
    }
  }
  /* UPDATE ITEM */
  async updateItem(req, res, next) {
    const {label, folder} = req.params;
    const updateItem = req.body;
    const keysToDelete = {};
    for (let prop in updateItem) {
      if (updateItem[prop] === null || updateItem[prop] === undefined) {
        delete updateItem[prop];
      }
      if (updateItem[prop].length === 0) {
        keysToDelete[prop] = 1;
        delete updateItem[prop];
      }
    }
    if ('title' in updateItem) {
      let title = updateItem.title.trim();
      let routeTitle = title.toLowerCase();
      routeTitle = routeTitle.replace(/[^a-zA-Z ]/g, "");
      routeTitle = routeTitle.replace(/ /g, '_');
      updateItem.title = title;
      updateItem.route_title = routeTitle;
    }
    try {
      const changesToItem = { $set: {...updateItem}, $unset: {...keysToDelete}};
      const file = await File.findOneAndUpdate({label: label, route_title: folder}, changesToItem, {new: true});
      //If images was deleted
      if (updateItem.deleteImgs != undefined) {
        let deleteImgsArray = updateItem.deleteImgs.split(',');
        let deletePromises = deleteImgsArray.map(path => Image.deleteOne({cloud_id: path}));
        let deletedImages = Promise.all(deletePromises);
        if (deletedImages) {
          let cloudPromises = deleteImgsArray.map(path => uploader.destroy(path));
          Promise.all(cloudPromises);
        }
      }
      //If new imgs are being added
      if ('files' in req) {
        const images = res.locals.images;
        await images.map(img => {
          new Image({
            cloud_id: img.public_id,
            folder: file._id,
            width: img.width,
            height: img.height,
            url: img.secure_url
          }).save();
        });
      }
      return res.status(201).json({message: 'Item editado con exito'});
    } catch(err) {
      next(err);
    }
  }
  /* DELETE ITEM */
  async deleteItem(req, res, next) {
    const {label, folder} = req.params;
    try {
      //Delete the folder and use his id to delete Images model and cloud host
      let folderDelete = await File.findOneAndDelete({label: label, route_title: folder});
      let imagesToDelete = await Image.find({folder: folderDelete._id});
      if (imagesToDelete.length > 0) {
        let imagesPromises = imagesToDelete.map(({cloud_id}) => uploader.destroy(cloud_id));
        Promise.all(imagesPromises);
        Image.deleteMany({folder: folderDelete._id}).then(() => {
          return res.status(200).json({message: 'Item eliminado con exito'});
        });
      } else {
        return res.status(200).json({message: 'Item eliminado con exito'});
      }
    } catch(err) {
      next(err);
    }
  }
}

export default AdminController;