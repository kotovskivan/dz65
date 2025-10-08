import { Router } from 'express';

const router = Router();

router.get('/', (req,res)=>{
  res.render('index.pug', { title: 'DZ64 — Головна' });
});

router.get('/theme/:name', (req, res) => {
  const name = ['light','dark'].includes(req.params.name) ? req.params.name : 'light';
  res.cookie('theme', name, { httpOnly: false, sameSite: 'lax' });
  const back = req.get('Referer') || '/';
  res.redirect(back);
});

export default router;
