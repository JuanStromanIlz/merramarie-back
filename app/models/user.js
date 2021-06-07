import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const usersSchema = new mongoose.Schema({
  username: String
});

usersSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', usersSchema);

export default User;