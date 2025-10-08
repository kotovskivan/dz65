import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/login', (req, res) => {
  try {
    res.render('login', { title: 'Login', query: req.query });
  } catch (e) {
    res.send('<form method="post" action="/login"><input name="username"><input type="password" name="password"><button>Login</button></form>');
  }
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login?error=1' }), (req, res) => res.redirect('/'));

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

export default router;