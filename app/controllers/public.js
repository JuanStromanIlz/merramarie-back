import File from '../models/file.js';
import Image from '../models/image.js';

class PublicController {
  /* GET HOME IMAGES */
  async getHomeFiles(req, res, next) {
    try {
     let homeImages = await Image.find({label: 'homepage'});
     if (homeImages) {
      let list = [];
      homeImages.map(img => {
        let imgToSend = {
          width: img.width,
          height: img.height,
          url: img.url
        };
        list.push(imgToSend);
      });
      return res.status(200).json(list);
     }
    } catch(err) {
      next(err);
    }
  }
  /* GET LABELS */
  async getAllLabels(req, res, next) {
    try {
      let data = await File.find({});
      if (data) {
        let labelsArray = [];
        data = [...new Map(data.map(item => [item['label'], item])).values()];
        data.map(item => {
          labelsArray.push(item.label);
        });
        return res.status(200).json(labelsArray);
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
      const imagesList = await Image.find({});
      let data = [];
      if (list && imagesList) {
        list.map(item => {
          let imagesPerFolder = imagesList.filter(img => img.folder == item._id);
          if (imagesPerFolder.length > 0) {
            let imagesData = [];
            imagesPerFolder = imagesPerFolder.map(img => {
              let newImg = {
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
      }
      return res.status(200).json(data);
    } catch(err) {
      next(err);
    }
  }
  /* GET ITEM */
  async getItem(req, res, next) {
    let routeTitle = req.params.name;
    try {
      const item = await File.findOne({route_title: routeTitle});
      // Get the next record in a label
      const nextOne = await File.find({_id: {$gt: item._id}, label: item.label}).sort({_id: 1}).limit(1);
      let images = await Image.find({folder: item._id});
      if (item && images && nextOne) {
        if (images.length > 0) {
          let imagesData = [];
          images.map(img => {
            let newImg = {
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
            nextFolder: nextOne.length > 0 ? nextOne[0].route_title : null
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
            nextFolder: nextOne.length > 0 ? nextOne[0].route_title : null
          };
          return res.status(200).json(itemToSend);
        }
      }
    } catch(err) {
      next(err);
    }
  }
}

export default PublicController;