import File from '../models/file.js';

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
      return res.status(200).send(list);
    } catch(err) {
      next(err);
    }
  }
  async getItem(req, res, next) {
    let labelToGet = req.params.label;
    let item = req.params.id;
    try {
      const item = await File.findOne({_id: item, label: labelToGet});
      return res.status(200).send(item);
    } catch(err) {
      next(err);
    }
  }
}

export default PublicController;