import 'dotenv/config.js';
import express from 'express';
import mongoose from 'mongoose';
const app = express();
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({ extended: false, limit: '20mb' }));

/* MONGOOSE SETUP */
import dbConfig from './app/config/db.js';

mongoose.connect(dbConfig.online, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
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

/* ROUTER LIST */
import publicRouter from './app/routes/public.js';
import adminRouter from './app/routes/admin.js';

app.use('/', publicRouter);
app.use('/panel', adminRouter);
app.use((err, req, res, next) => {
  return res.status(500).send(err.toString());
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
  console.log(`Server runnig on port ${PORT}`);
});