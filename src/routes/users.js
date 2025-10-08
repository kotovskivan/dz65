import { Router } from 'express';
import path from 'path';

const router = Router();

// For demo: static users list (task 61)
const USERS = [
  { id: 1, name: 'Ivan', email: 'ivan@example.com' },
  { id: 2, name: 'Denys', email: 'denys@example.com' },
  { id: 3, name: 'Vita', email: 'vita@example.com' },
];

router.get('/', (req, res) => {
  res.render('users/index.pug', { title: 'Користувачі', users: USERS });
});

router.get('/:userId', (req, res) => {
  const user = USERS.find(u => String(u.id) === req.params.userId);
  if (!user) return res.status(404).send('User not found');
  res.render('users/show.pug', { title: user.name, user });
});

export default router;
