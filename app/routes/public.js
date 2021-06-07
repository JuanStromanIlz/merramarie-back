import express from 'express';
const publicRouter = express.Router();

/* IMPORT PUBLIC CONTROLLER */
import PublicController from '../controllers/public.js';
const publicCont = new PublicController();

publicRouter.get('/', publicCont.getHomeFiles);
publicRouter.get('/:label', publicCont.getList);
publicRouter.get('/:label/:id', publicCont.getItem)

export default publicRouter;