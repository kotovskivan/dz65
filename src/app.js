import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import passport from 'passport';
import './config/passport.js';
import { connectDB } from './config/db.js';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import articlesRouter from './routes/articles.js';
import authRouter from './routes/auth.js';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect DB (no-op if MONGODB_URI missing)
connectDB().catch(err => console.error('DB error:', err));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Sessions (for Passport)
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret';
app.use(cookieSession({
  name: 'sid',
  secret: SESSION_SECRET,
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Views (support pug + ejs)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.engine('ejs', ejs.__express);

// Static
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use(express.static(path.join(__dirname, '../public')));

// Theme from cookie to locals
app.use((req, res, next) => {
  res.locals.theme = (req.cookies && req.cookies.theme) || '';
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/users', usersRouter);
app.use('/articles', articlesRouter);

// 404
app.use((req, res) => {
  res.status(404).render('error/404.pug', { title: '404' });
});

// 500
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error/500.pug', { title: '500' });
});

export default app;