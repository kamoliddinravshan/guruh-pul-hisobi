import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  createUser,
  findUserByEmail,
  findUserByGoogleOrEmail,
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
  if (!user.passwordHash) return res.status(401).json({ message: 'Bu hisob Google orqali ochilgan' });
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

export default router;
