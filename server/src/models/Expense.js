import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    category: { type: String, default: 'Boshqa' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Expense = mongoose.model('Expense', expenseSchema);
