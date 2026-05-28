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

const port = Number(process.env.PORT || 5000);

function listen(portToUse, attemptsLeft = 10) {
  const server = app.listen(portToUse, '0.0.0.0', () => console.log(`API ${portToUse}-portda ishga tushdi`));

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && attemptsLeft > 0) {
      const nextPort = portToUse === 5000 ? 5050 : portToUse + 1;
      console.warn(`${portToUse}-port band. API ${nextPort}-portda qayta urinadi.`);
      listen(nextPort, attemptsLeft - 1);
      return;
    }

    throw error;
  });
}

connectDB()
  .then((connected) => {
    isMongoConnected = connected;
    listen(port);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
