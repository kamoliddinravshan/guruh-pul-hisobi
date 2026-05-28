import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import groupRoutes from './routes/group.routes.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'xarajat-taqsimlagich-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`API ${port}-portda ishga tushdi`)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
