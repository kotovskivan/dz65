import { Router } from 'express';
import { list, show, createForm, createPost } from '../controllers/articleController.js';
import { ensurePassport } from '../middlewares/ensure.js';

const router = Router();

router.get('/', list);
router.get('/new', ensurePassport, createForm);
router.post('/new', ensurePassport, createPost);
router.get('/:articleId', show);

export default router;
