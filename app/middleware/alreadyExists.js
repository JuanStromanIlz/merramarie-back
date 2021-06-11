import File from '../models/file.js';

const alreadyExists = async (req, res, next) => {
  try {
    const {title} = req.body;
    const alreadyExists = await File.findOne({title: title});
    if (alreadyExists) {
      return res.send('Titulo existente');
    } else {
      next();
    }
  } catch(err) {
    next(err);
  }
}

export default alreadyExists;