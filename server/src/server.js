import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import groupRoutes from './routes/group.routes.js';

const app = express();

const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (configuredOrigins.includes(origin)) return callback(null, true);
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
      if (/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return callback(null, true);
      return callback(new Error('CORS ruxsat bermadi'));
    },
  })
);
app.use(express.json());
let isMongoConnected = false;

app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    service: 'xarajat-taqsimlagich-api',
    storage: isMongoConnected ? 'mongodb' : 'local-file',
  })
);
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);

const port = process.env.PORT || 5000;
connectDB()
  .then((connected) => {
    isMongoConnected = connected;
    app.listen(port, '0.0.0.0', () => console.log(`API ${port}-portda ishga tushdi`));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
