export interface Member {
  id: string;
  name: string;
  email?: string;
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  payer: string;
  participants: string[];
  category: string;
  date: Date;
  description?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  totalExpenses: number;
  createdAt: Date;
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
  groupId: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  paidAt: Date;
}

export interface BalanceRow {
  member: string;
  paid: number;
  share: number;
  balance: number;
}
