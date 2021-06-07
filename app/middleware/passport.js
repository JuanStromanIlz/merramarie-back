import passport from 'passport';
import User from '../models/user.js';

import passportJWT from 'passport-jwt';
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  },
  async (token, done) => {
    return User.findById(token.id)
    .then(user => {
      return done(null, user);
    })
    .catch(err => {
      return done(err);
    });
  }
));

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

export default passport;