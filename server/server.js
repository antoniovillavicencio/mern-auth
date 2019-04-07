import app from './express';
import path from 'path';
import config from '../config/config';
import mongoose from 'mongoose';
const CURRENT_WORKING_DIR = process.cwd();

// MARK: Mongoose Setup
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri);

mongoose.connection.on('error', () => {
  throw new Error(`Unable to connect to Mongo Database: ${mongoUri}`)
})

// MARK: Express Routes

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(CURRENT_WORKING_DIR, 'client/public/index.html'));
})

app.listen(config.port, () => {
  console.log(`Server initialized on port ${config.port}`);
});