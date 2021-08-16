import File from '../models/file.js';

const alreadyExists = async (req, res, next) => {
  try {
    const {label, title} = req.body;
    const alreadyExists = await File.findOne({label: label, title: title});
    if (alreadyExists) {
      return res.status(400).send('Titulo existente');
    } else {
      next();
    }
  } catch(err) {
    next(err);
  }
}

export default alreadyExists;