import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

const dataDir = path.resolve(process.cwd(), 'data');
const usersPath = path.join(dataDir, 'users.json');

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

async function readFileUsers() {
  try {
    const raw = await fs.readFile(usersPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeFileUsers(users) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    email: user.email || null,
    passwordHash: user.passwordHash || null,
    avatarUrl: user.avatarUrl || null,
    providers: user.providers || {},
  };
}

export async function findUserByEmail(email) {
  if (isMongoConnected()) return User.findOne({ email });

  const users = await readFileUsers();
  return users.find((user) => user.email === email) || null;
}

export async function findUserByGoogleOrEmail(googleId, email) {
  if (isMongoConnected()) return User.findOne({ $or: [{ 'providers.googleId': googleId }, { email }] });

  const users = await readFileUsers();
  return users.find((user) => user.providers?.googleId === googleId || user.email === email) || null;
}

export async function findUserByTelegramId(telegramId) {
  if (isMongoConnected()) return User.findOne({ 'providers.telegramId': telegramId });

  const users = await readFileUsers();
  return users.find((user) => user.providers?.telegramId === telegramId) || null;
}

export async function createUser(userData) {
  if (isMongoConnected()) return User.create(userData);

  const users = await readFileUsers();
  const user = normalizeUser({
    ...userData,
    _id: crypto.randomUUID(),
    providers: userData.providers || {},
  });
  users.push(user);
  await writeFileUsers(users);
  return user;
}

export async function updateUser(user) {
  if (isMongoConnected() && typeof user.save === 'function') {
    await user.save();
    return user;
  }

  const users = await readFileUsers();
  const index = users.findIndex((item) => String(item._id) === String(user._id));
  if (index === -1) return createUser(user);
  users[index] = normalizeUser(user);
  await writeFileUsers(users);
  return users[index];
}
