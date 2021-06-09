import 'dotenv/config.js';
import express from 'express';
import mongoose from 'mongoose';
const app = express();
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({extended: false, limit: '20mb'}));

/* MONGOOSE SETUP */
import dbConfig from './app/config/db.js';

mongoose.connect(dbConfig.online, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => {
  console.log('Connected to the database!');
})
.catch(err => {
  console.log('Cannot connect to the database!', err);
  process.exit();
});

/* PASSPORT INIT */
import passport from './app/middleware/passport.js';
app.use(passport.initialize());

/* CORS CONFIG */
import cors from 'cors';
if (process.env.CORS == 'true') {
  const corsOptions = {
    origin: [process.env.FRONTEND_HOST],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders:  ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200,
    credentials: true,
    maxAge: 3600
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  console.log('.----- API IS USING CORS ------------------.');
}

/* ROUTER LIST */
import publicRouter from './app/routes/public.js';
import adminRouter from './app/routes/admin.js';

app.get('/', (req, res) => {
  res.json({
    owner: {
      name: 'Merra Marie',
      visit_web_site: `${process.env.FRONTEND_HOST}`
    },
    author: {
      name: 'Juan Stroman Ilz',
      contact: 'https://www.linkedin.com/in/jstromanilz'
    }    
  });
});
app.use('/public', publicRouter);
app.use('/panel', adminRouter);
app.use((err, req, res, next) => {
  return res.status(500).send(err.toString());
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server runnig on port ${PORT}`);
});