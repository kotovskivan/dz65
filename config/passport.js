import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

// Demo user — replace with your DZ63 logic if needed
const DEMO_USER = { id: '1', username: 'admin', password: 'admin123' };

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    if (username === DEMO_USER.username && password === DEMO_USER.password) {
      return done(null, { id: DEMO_USER.id, username: DEMO_USER.username });
    }
    return done(null, false, { message: 'Невірний логін або пароль' });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  if (id === DEMO_USER.id) return done(null, { id: DEMO_USER.id, username: DEMO_USER.username });
  return done(null, false);
});