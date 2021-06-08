import File from '../models/file.js';
import Image from '../models/image.js';

class PublicController {
  async getHomeFiles(req, res, next) {
    try {
      const list = await File.find({});
      return res.status(200).send(list);
    } catch(err) {
      next(err);
    }
  }
  async getList(req, res, next) {
    let labelToGet = req.params.label;
    try {
      const list = await File.find({label: labelToGet});
      const imagesList = await Image.find({label: labelToGet});
      let data = [];
      if (list && imagesList) {
        list.map(item => {
          let imagesPerFolder = imagesList.filter(img => img.folder == item._id);
          imagesPerFolder = imagesPerFolder.map(img => img.url);
          let itemPublic = {
            label: item.label,
            category: item.category,
            title: item.title,
            route_title: item.route_title,
            description: item.description,
            videoLink: item.videoLink,
            images: imagesPerFolder
          };
          data.push(itemPublic);
        });
      }
      return res.status(200).send(data);
    } catch(err) {
      next(err);
    }
  }
  async getItem(req, res, next) {
    let labelToGet = req.params.label;
    let routeTitle = req.params.name;
    try {
      const item = await File.findOne({route_title: routeTitle, label: labelToGet});
      let images = await Image.find({folder: item._id});
      images = images.map(img => img.url);
      let itemPublic = {
        label: item.label,
        category: item.category,
        title: item.title,
        route_title: item.route_title,
        description: item.description,
        videoLink: item.videoLink,
        images: images
      };
      return res.status(200).send(itemPublic);
    } catch(err) {
      next(err);
    }
  }
}

export default PublicController;