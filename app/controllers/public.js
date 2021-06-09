import File from '../models/file.js';
import Image from '../models/image.js';

class PublicController {
  /* GET ALL FILES */
  async getHomeFiles(req, res, next) {
    try {
      let list = [];
      let categories = ['editorial', 'artworks', 'commercial', 'film', 'exhibition', 'publication'];
      let images = await Image.find();
      if (images) {
        categories.map(cat => {
          let firstItem = images.find(img => img.label === cat);
          if (firstItem) {
            let url = firstItem.url;
            list.push(url);
          }
        });
        return res.send(list);
      }
    } catch(err) {
      next(err);
    }
  }
  /* GET LABEL */
  async getList(req, res, next) {
    let labelToGet = req.params.label;
    try {
      const list = await File.find({label: labelToGet});
      const imagesList = await Image.find({label: labelToGet});
      let data = [];
      if (list && imagesList) {
        list.map(item => {
          let imagesPerFolder = imagesList.filter(img => img.folder == item._id);
          if (imagesPerFolder.length > 0) {
            let imagesData = [];
            imagesPerFolder = imagesPerFolder.map(img => {
              let newImg = img.url;
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
      }
      return res.status(200).send(data);
    } catch(err) {
      next(err);
    }
  }
  /* GET ITEM */
  async getItem(req, res, next) {
    let labelToGet = req.params.label;
    let routeTitle = req.params.name;
    try {
      const item = await File.findOne({route_title: routeTitle, label: labelToGet});
      let images = await Image.find({folder: item._id});
      if (item && images) {
        if (images.length > 0) {
          let imagesData = [];
          images.map(img => {
            let newImg = img.url;
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
          return res.status(200).send(itemToSend);
        } else {
          let itemToSend = {
            label: item.label,
            category: item.category,
            title: item.title,
            route_title: item.route_title,
            description: item.description,
            videoLink: item.videoLink
          };
          return res.status(200).send(itemToSend);
        }
      }
    } catch(err) {
      next(err);
    }
  }
}

export default PublicController;