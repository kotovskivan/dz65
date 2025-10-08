import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: 'User not found' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return done(null, false, { message: 'Wrong credentials' });
    return done(null, user);
  } catch (e) {
    return done(e);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user);
  } catch (e) {
    done(e);
  }
});

export default passport;