import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import ejsMate from 'ejs-mate';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import './config/passport.js';
import { ensureAuthApi, ensureAuthPage } from './middlewares/auth.js';
import itemsRoutes from './routes/items.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Views
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static (also served by Vercel routes)
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
const isProd = process.env.NODE_ENV === 'production';
app.set('trust proxy', 1);
app.use(session({
  name: 'dz65.sid',
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 1000*60*60*24*7 }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Locals
app.use((req,res,next)=>{ res.locals.currentUser = req.user || null; next(); });

// Healthcheck (doesn't touch DB)
app.get('/health', (req, res) => res.json({ ok: true }));

// Lazy DB connect to avoid crashing function at cold start if env is missing
let dbReadyPromise = null;
async function ensureDB() {
  if (!dbReadyPromise) {
    const uri = process.env.MONGODB_URI;
    const dbn = process.env.MONGODB_DBNAME || 'dz65';
    if (!uri) {
      console.warn('[WARN] MONGODB_URI is not set — API writes will fail, read-only pages will work.');
      // don't throw; allow pages to render
      dbReadyPromise = Promise.resolve();
    } else {
      dbReadyPromise = connectDB(uri, dbn).catch(err => {
        console.error('[DB] connect error:', err?.message || err);
        // prevent unhandled rejection on module import
        // keep a resolved promise so app continues; API routes will still error on use
        return;
      });
    }
  }
  return dbReadyPromise;
}

// Ensure DB before API that needs it
app.use('/api', async (req, res, next) => { await ensureDB(); next(); });

// Pages
app.get('/', (req, res) => res.render('home', { title: 'DZ65' }));
app.get('/protected', ensureAuthPage, (req, res) => res.render('protected', { title: 'Protected' }));

// API & auth
app.use('/api/items', itemsRoutes);
app.use('/', authRoutes);

// 404
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api/')) return res.status(404).json({ message: 'Not found' });
  try { return res.status(404).render('404', { title: '404' }); }
  catch { return res.status(404).send('404'); }
});

// Global error handler (never crash the function)
app.use((err, req, res, next) => {
  console.error('[ERR]', err?.stack || err);
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ message: 'Internal error' });
  }
  return res.status(500).send('Internal error');
});

export default app;
