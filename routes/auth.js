import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { getDB } from '../db.js';

const router = Router();

router.get('/login', (req, res) => {
  return res.render('login', { title: 'Login', query: req.query });
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login?error=1' }),
  (req, res) => res.redirect('/')
);

router.get('/register', (req, res) => {
  return res.render('register', { title: 'Register', query: req.query });
});

router.post('/register', async (req, res) => {
  try{
    const { username, password } = req.body || {};
    if(!username || !password) return res.redirect('/register?error=1');
    const users = getDB().collection('users');
    const exists = await users.findOne({ username });
    if (exists) return res.redirect('/register?exists=1');
    const passwordHash = await bcrypt.hash(password, 10);
    await users.insertOne({ username, passwordHash, createdAt: new Date() });
    return res.redirect('/login?registered=1');
  }catch(e){
    return res.status(500).send('Registration error');
  }
});

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

export default router;
