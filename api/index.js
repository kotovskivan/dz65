import serverless from 'serverless-http';
import app from '../app_ejs.js';

export const config = { api: { bodyParser: false } };
export default serverless(app);
