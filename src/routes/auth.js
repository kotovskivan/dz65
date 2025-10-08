import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ensurePassport, ensureJWT } from '../middlewares/ensure.js';

const router = Router();

router.get('/login', (req,res)=>{
  res.render('auth/login.pug', { title: 'Вхід' });
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).send('Email and password required');
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).send('User already exists');
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name, email, passwordHash });
    res.redirect('/');
  } catch (e) {
    next(e);
  }
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login?reason=bad' }),
  (req, res) => {
    // issue JWT cookie too (for /protected)
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt';
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.redirect('/');
  }
);

router.get('/logout', (req, res, next) => {
  try {
    req.logout?.(()=>{});
  } catch {}
  res.clearCookie('token');
  res.redirect('/');
});

// Protected examples
router.get('/protected_passport', ensurePassport, (req, res) => {
  res.send(`<h2>Вітаю, ${req.user.name || req.user.email}! Це захищений маршрут (Passport).</h2>`);
});

router.get('/protected', ensureJWT, (req, res) => {
  res.json({ message: 'JWT OK', user: req.jwtUser });
});

export default router;