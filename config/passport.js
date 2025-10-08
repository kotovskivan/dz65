import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { getDB } from '../db.js';

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await getDB().collection('users').findOne({ username });
    if (!user) return done(null, false, { message: 'Невірний логін або пароль' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return done(null, false, { message: 'Невірний логін або пароль' });
    return done(null, { id: String(user._id), username: user.username });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try{
    const user = await getDB().collection('users').findOne({ _id: new (await import('mongodb')).ObjectId(id) });
    if (!user) return done(null, false);
    done(null, { id: String(user._id), username: user.username });
  }catch(err){
    done(err);
  }
});
