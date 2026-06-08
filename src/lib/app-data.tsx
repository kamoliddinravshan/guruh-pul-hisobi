import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Debt, Expense, Group, Settlement } from '@/types';
import { AppDataContext, type AppDataContextValue } from '@/lib/app-data-context';
import { apiRequest } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

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

interface ApiUser {
  full_name?: string;
  email?: string;
}

interface ApiMembership {
  user?: ApiUser;
}

interface ApiGroup {
  id: string;
  name: string;
  description?: string;
  members?: Array<string | ApiMembership>;
  totalExpenses?: number;
  total_expenses?: number;
  createdAt?: string | Date;
  created_at?: string;
}

interface ApiSettlement {
  id: string;
  groupId?: string;
  group_id?: string;
  paid_by?: ApiUser;
  paid_to?: ApiUser;
  from?: string;
  to?: string;
  amount: string | number;
  paidAt?: string | Date;
  settled_at?: string;
}

function normalizeGroup(group: ApiGroup): Group {
  const members = (group.members || [])
    .map((member) => {
      if (typeof member === 'string') return member;
      return member.user?.full_name || member.user?.email || 'Azo';
    })
    .filter(Boolean);

  return {
    id: group.id,
    name: group.name,
    description: group.description || '',
    members,
    totalExpenses: Number(group.totalExpenses ?? group.total_expenses ?? 0),
    createdAt: new Date(group.createdAt || group.created_at || Date.now()),
  };
}

function normalizeSettlement(settlement: ApiSettlement, groupId: string): Settlement {
  return {
    id: settlement.id,
    groupId: settlement.groupId || settlement.group_id || groupId,
    from: settlement.from || settlement.paid_by?.full_name || settlement.paid_by?.email || '',
    to: settlement.to || settlement.paid_to?.full_name || settlement.paid_to?.email || '',
    amount: Number(settlement.amount),
    paidAt: new Date(settlement.paidAt || settlement.settled_at || Date.now()),
  };
}

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
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadBackendData() {
      try {
        const apiGroups = await apiRequest<ApiGroup[]>('/groups/');
        const apiExpenses = (
          await Promise.all(
            apiGroups.map((group) =>
              apiRequest<Expense[]>(`/groups/${group.id}/expenses/`).catch(() => [])
            )
          )
        ).flat();
        const apiSettlements = (
          await Promise.all(
            apiGroups.map((group) =>
              apiRequest<ApiSettlement[]>(`/groups/${group.id}/history/`)
                .then((items) => items.map((item) => normalizeSettlement(item, group.id)))
                .catch(() => [])
            )
          )
        ).flat();

        if (ignore) return;
        setGroups(apiGroups.map(normalizeGroup));
        setExpenses(apiExpenses.map((expense) => ({ ...expense, date: new Date(expense.date) })));
        setSettlements(apiSettlements);
      } catch {
        // Backend ishlamasa demo ma'lumotlar bilan ishlashda davom etadi.
      }
    }

    loadBackendData();

    return () => {
      ignore = true;
    };
  }, []);

  const debts = useMemo(() => {
    const paidKeys = new Set(
      settlements.map((settlement) => `${settlement.groupId}:${settlement.from}:${settlement.to}:${settlement.amount}`)
    );
    return calculateDebts(groups, expenses).filter((debt) => !paidKeys.has(`${debt.groupId}:${debt.from}:${debt.to}:${debt.amount}`));
  }, [groups, expenses, settlements]);
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

    apiRequest<ApiGroup>('/groups/', {
      method: 'POST',
      body: JSON.stringify({
        name: groupData.name,
        description: groupData.description,
        currency: 'UZS',
      }),
    })
      .then(async (createdGroup) => {
        const groupWithMembers = groupData.members.length
          ? await apiRequest<ApiGroup>(`/groups/${createdGroup.id}/members/`, {
              method: 'POST',
              body: JSON.stringify({ members: groupData.members }),
            })
          : createdGroup;
        const normalizedGroup = normalizeGroup(groupWithMembers);
        setGroups((currentGroups) =>
          currentGroups.map((group) =>
            group.id === newGroup.id ? normalizedGroup : group
          )
        );
      })
      .catch((error: unknown) => {
        setGroups((currentGroups) => currentGroups.filter((group) => group.id !== newGroup.id));
        toast({
          title: 'Guruh yaratilmadi',
          description: error instanceof Error ? error.message : 'Server guruh yaratish so\'rovini qabul qilmadi.',
          variant: 'destructive',
        });
      });
  };

  const addGroupMembers = async (groupId: string, members: string[]) => {
    const cleanedMembers = members.map((member) => member.trim()).filter(Boolean);
    if (!cleanedMembers.length) return;

    const updatedGroup = await apiRequest<ApiGroup>(`/groups/${groupId}/members/`, {
      method: 'POST',
      body: JSON.stringify({ members: cleanedMembers }),
    });
    const normalizedGroup = normalizeGroup(updatedGroup);
    setGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === groupId ? normalizedGroup : group
      )
    );
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

    apiRequest<Expense>(`/groups/${expenseData.groupId}/expenses/`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    })
      .then((createdExpense) => {
        setExpenses((currentExpenses) =>
          currentExpenses.map((expense) =>
            expense.id === newExpense.id ? { ...createdExpense, date: new Date(createdExpense.date) } : expense
          )
        );
      })
      .catch(() => undefined);
  };

  const markDebtPaid = (debt: Debt) => {
    const settlement: Settlement = {
      id: Date.now().toString(),
      groupId: debt.groupId,
      from: debt.from,
      to: debt.to,
      amount: debt.amount,
      paidAt: new Date(),
    };
    setSettlements((currentSettlements) => [
      settlement,
      ...currentSettlements,
    ]);

    // Backend settlement endpoint requires member UUIDs. This legacy UI stores debts by display name,
    // so the item is marked locally and no invalid /settlements request is sent.
  };

  const value: AppDataContextValue = {
    groups,
    expenses,
    debts,
    settlements,
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
    addGroupMembers,
    handleAddExpense,
    markDebtPaid,
    getGroupById: (groupId) => groups.find((group) => group.id === groupId),
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
