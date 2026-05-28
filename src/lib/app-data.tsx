import { useMemo, useState, type ReactNode } from 'react';
import type { Debt, Expense, Group } from '@/types';
import { AppDataContext, type AppDataContextValue } from '@/lib/app-data-context';

const defaultGroups: Group[] = [
  {
    id: '1',
    name: 'Toshkent Safari',
    description: 'Do\'stlar bilan sayohat',
    members: ['Ali', 'Bobur', 'Charos', 'Dildora'],
    totalExpenses: 1250000,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Restoran Kechasi',
    description: 'Tug\'ilgan kun nishonlashi',
    members: ['Eldor', 'Feruza', 'Guzal'],
    totalExpenses: 450000,
    createdAt: new Date('2024-02-01'),
  },
];

const defaultExpenses: Expense[] = [
  {
    id: '1',
    groupId: '1',
    title: 'Mehmonxona',
    amount: 800000,
    payer: 'Ali',
    participants: ['Ali', 'Bobur', 'Charos', 'Dildora'],
    category: 'turar-joy',
    date: new Date('2024-01-16'),
    description: 'Hilton mehmonxonasi, 2 kecha',
  },
  {
    id: '2',
    groupId: '1',
    title: 'Tushlik',
    amount: 150000,
    payer: 'Bobur',
    participants: ['Ali', 'Bobur', 'Charos'],
    category: 'ovqat',
    date: new Date('2024-01-16'),
  },
];

function calculateDebts(groups: Group[], expenses: Expense[]): Debt[] {
  const debts: Debt[] = [];

  groups.forEach((group) => {
    const groupExpenses = expenses.filter((expense) => expense.groupId === group.id);
    const balances: Record<string, number> = {};

    group.members.forEach((member) => {
      balances[member] = 0;
    });

    groupExpenses.forEach((expense) => {
      const participants = expense.participants.filter((member) => balances[member] !== undefined);
      if (!participants.length || balances[expense.payer] === undefined) return;

      const sharePerPerson = expense.amount / participants.length;
      balances[expense.payer] += expense.amount;
      participants.forEach((participant) => {
        balances[participant] -= sharePerPerson;
      });
    });

    const creditors = Object.entries(balances)
      .filter(([, amount]) => amount > 0.01)
      .map(([member, amount]) => ({ member, amount }))
      .sort((a, b) => b.amount - a.amount);
    const debtors = Object.entries(balances)
      .filter(([, amount]) => amount < -0.01)
      .map(([member, amount]) => ({ member, amount: Math.abs(amount) }))
      .sort((a, b) => b.amount - a.amount);

    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const amount = Math.min(debtor.amount, creditor.amount);

      if (amount > 0.01) {
        debts.push({
          from: debtor.member,
          to: creditor.member,
          amount: Math.round(amount),
          groupId: group.id,
        });
      }

      debtor.amount -= amount;
      creditor.amount -= amount;
      if (debtor.amount <= 0.01) debtorIndex += 1;
      if (creditor.amount <= 0.01) creditorIndex += 1;
    }
  });

  return debts;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>(defaultGroups);
  const [expenses, setExpenses] = useState<Expense[]>(defaultExpenses);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const debts = useMemo(() => calculateDebts(groups, expenses), [groups, expenses]);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalMembers = groups.reduce((sum, group) => sum + group.members.length, 0);
  const averageExpense = expenses.length ? Math.round(totalExpenses / expenses.length) : 0;

  const formatCurrency = (amount: number) => `${Math.round(amount).toLocaleString('uz-UZ')} so'm`;

  const openExpenseModal = (group?: Group | null) => {
    setSelectedGroup(group || null);
    setIsExpenseModalOpen(true);
  };

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setSelectedGroup(null);
  };

  const handleCreateGroup = (groupData: Omit<Group, 'id' | 'totalExpenses' | 'createdAt'>) => {
    const newGroup: Group = {
      ...groupData,
      id: Date.now().toString(),
      totalExpenses: 0,
      createdAt: new Date(),
    };
    setGroups((currentGroups) => [...currentGroups, newGroup]);
    setIsCreateGroupOpen(false);
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      date: new Date(),
    };

    setExpenses((currentExpenses) => [...currentExpenses, newExpense]);
    setGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === expenseData.groupId
          ? { ...group, totalExpenses: group.totalExpenses + expenseData.amount }
          : group
      )
    );

    closeExpenseModal();
  };

  const value: AppDataContextValue = {
    groups,
    expenses,
    debts,
    totalExpenses,
    totalDebts,
    totalMembers,
    averageExpense,
    isCreateGroupOpen,
    isExpenseModalOpen,
    selectedGroup,
    formatCurrency,
    openCreateGroup: () => setIsCreateGroupOpen(true),
    closeCreateGroup: () => setIsCreateGroupOpen(false),
    openExpenseModal,
    closeExpenseModal,
    handleCreateGroup,
    handleAddExpense,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
