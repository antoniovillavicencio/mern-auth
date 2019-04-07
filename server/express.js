import express from 'express';
import devBundle from './devBundle.js';
import path from 'path';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';

import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';

const CURRENT_WORKING_DIR = process.cwd();

const app = express();

if (process.env.NODE_ENV == 'development') {
  devBundle.compile(app);
}

app.use(express.json());
app.use(cookieParser());
app.use(compress());
app.use(helmet());
app.use(cors());

app.use("/dist", express.static(path.join(CURRENT_WORKING_DIR, 'dist')));

app.use('/api/users', userRoutes);
app.use('/auth', authRoutes);

app.use(function(err, req, res, next) {
  if (err.name == 'UnauthorizedError') {
    res.status(401).json({
      error: 'You need to sign in! ' + err.message
    })
  }
})

export default app;