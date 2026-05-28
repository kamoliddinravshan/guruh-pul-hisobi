import express from 'express';
import { Group } from '../models/Group.js';
import { Expense } from '../models/Expense.js';
import { auth } from '../middleware/auth.js';
import { simplifyDebts } from '../utils/settlement.js';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const groups = await Group.find({ members: req.user.id }).populate('members', 'name email');
  res.json(groups);
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Guruh nomi kiritilishi shart' });
  const group = await Group.create({ name, description, createdBy: req.user.id, members: [req.user.id] });
  res.status(201).json(group);
});

router.post('/:groupId/expenses', async (req, res) => {
  const group = await Group.findOne({ _id: req.params.groupId, members: req.user.id });
  if (!group) return res.status(404).json({ message: 'Guruh topilmadi' });
  const { title, amount, payer, participants, category, description } = req.body;
  if (!title || !amount || amount <= 0) return res.status(400).json({ message: 'Xarajat ma\'lumotlari noto\'g\'ri' });
  const expense = await Expense.create({ groupId: group._id, title, amount, payer, participants, category, description });
  res.status(201).json(expense);
});

router.get('/:groupId/expenses', async (req, res) => {
  const group = await Group.findOne({ _id: req.params.groupId, members: req.user.id });
  if (!group) return res.status(404).json({ message: 'Guruh topilmadi' });
  const expenses = await Expense.find({ groupId: group._id }).sort({ createdAt: -1 });
  res.json(expenses);
});

router.get('/:groupId/settlements', async (req, res) => {
  const group = await Group.findOne({ _id: req.params.groupId, members: req.user.id });
  if (!group) return res.status(404).json({ message: 'Guruh topilmadi' });
  const expenses = await Expense.find({ groupId: group._id });
  res.json(simplifyDebts(group.members, expenses));
});

export default router;
