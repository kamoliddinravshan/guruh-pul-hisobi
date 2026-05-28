import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  createUser,
  findUserByEmail,
  findUserByGoogleOrEmail,
  findUserByTelegramId,
  updateUser,
} from '../services/userStore.js';

const router = express.Router();

function createToken(user) {
  return jwt.sign({ id: user._id, email: user.email || null }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function isConfigured(value, placeholder) {
  return Boolean(value && value !== placeholder && !value.startsWith('your_'));
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email || null,
    avatarUrl: user.avatarUrl || null,
    telegramUsername: user.providers?.telegramUsername || null,
  };
}

function authResponse(user) {
  return { token: createToken(user), user: publicUser(user) };
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Barcha maydonlar to\'ldirilishi shart' });
  const normalizedEmail = email.toLowerCase().trim();
  const exists = await findUserByEmail(normalizedEmail);
  if (exists) return res.status(409).json({ message: 'Bu email avval ro\'yxatdan o\'tgan' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email: normalizedEmail, passwordHash });
  res.status(201).json(authResponse(user));
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email?.toLowerCase().trim());
  if (!user) return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });
  if (!user.passwordHash) return res.status(401).json({ message: 'Bu hisob Google yoki Telegram orqali ochilgan' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });
  res.json(authResponse(user));
});

router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: 'Google token topilmadi' });
  if (!isConfigured(process.env.GOOGLE_CLIENT_ID, 'your_google_oauth_client_id.apps.googleusercontent.com')) {
    return res.status(500).json({ message: 'GOOGLE_CLIENT_ID sozlanmagan' });
  }

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  const profile = await response.json();

  const isEmailVerified = profile.email_verified === true || profile.email_verified === 'true';
  if (!response.ok || profile.aud !== process.env.GOOGLE_CLIENT_ID || !isEmailVerified) {
    return res.status(401).json({ message: 'Google token noto\'g\'ri' });
  }

  const googleId = profile.sub;
  const email = profile.email?.toLowerCase().trim();
  let user = await findUserByGoogleOrEmail(googleId, email);

  if (user) {
    user.providers = { ...(user.providers || {}), googleId };
    user.email = user.email || email;
    user.avatarUrl = profile.picture || user.avatarUrl;
    user = await updateUser(user);
  } else {
    user = await createUser({
      name: profile.name || email,
      email,
      avatarUrl: profile.picture,
      providers: { googleId },
    });
  }

  res.json(authResponse(user));
});

router.post('/telegram', async (req, res) => {
  const data = req.body || {};
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!isConfigured(botToken, '123456789:your_telegram_bot_token')) {
    return res.status(500).json({ message: 'TELEGRAM_BOT_TOKEN sozlanmagan' });
  }
  if (!data.id || !data.auth_date || !data.hash) return res.status(400).json({ message: 'Telegram ma\'lumotlari to\'liq emas' });

  const authAgeSeconds = Math.floor(Date.now() / 1000) - Number(data.auth_date);
  if (authAgeSeconds > 86400) return res.status(401).json({ message: 'Telegram sessiyasi eskirgan' });

  const checkString = Object.keys(data)
    .filter((key) => key !== 'hash' && data[key] !== undefined && data[key] !== null)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  const expected = Buffer.from(calculatedHash, 'hex');
  const received = Buffer.from(String(data.hash), 'hex');
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return res.status(401).json({ message: 'Telegram imzosi noto\'g\'ri' });
  }

  const telegramId = String(data.id);
  const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username || `Telegram ${telegramId}`;
  let user = await findUserByTelegramId(telegramId);

  if (user) {
    user.name = user.name || name;
    user.avatarUrl = data.photo_url || user.avatarUrl;
    user.providers = {
      ...(user.providers || {}),
      telegramId,
      telegramUsername: data.username,
    };
    user = await updateUser(user);
  } else {
    user = await createUser({
      name,
      avatarUrl: data.photo_url,
      providers: {
        telegramId,
        telegramUsername: data.username,
      },
    });
  }

  res.json(authResponse(user));
});

export default router;
