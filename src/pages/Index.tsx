
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Receipt, TrendingUp, AlertCircle, LogOut } from 'lucide-react';
import { GroupCard } from '@/components/GroupCard';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { ExpenseModal } from '@/components/ExpenseModal';
import { DebtSummary } from '@/components/DebtSummary';
import { RecentActivity } from '@/components/RecentActivity';
import { useAuth } from '@/lib/use-auth';

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  totalExpenses: number;
  createdAt: Date;
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

export interface Debt {
  from: string;
  to: string;
  amount: number;
  groupId: string;
}

const Index = () => {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Toshkent Safari',
      description: 'Do\'stlar bilan sayohat',
      members: ['Ali', 'Bobur', 'Charos', 'Dildora'],
      totalExpenses: 1250000,
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2', 
      name: 'Restoran Kechasi',
      description: 'Tug\'ilgan kun nishonlashi',
      members: ['Eldor', 'Feruza', 'Guzal'],
      totalExpenses: 450000,
      createdAt: new Date('2024-02-01')
    }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      groupId: '1',
      title: 'Mehmonxona',
      amount: 800000,
      payer: 'Ali',
      participants: ['Ali', 'Bobur', 'Charos', 'Dildora'],
      category: 'turar-joy',
      date: new Date('2024-01-16'),
      description: 'Hilton mehmonxonasi, 2 kecha'
    },
    {
      id: '2',
      groupId: '1', 
      title: 'Tushlik',
      amount: 150000,
      payer: 'Bobur',
      participants: ['Ali', 'Bobur', 'Charos'],
      category: 'ovqat',
      date: new Date('2024-01-16')
    }
  ]);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const calculateDebts = (): Debt[] => {
    const debts: Debt[] = [];
    
    groups.forEach(group => {
      const groupExpenses = expenses.filter(e => e.groupId === group.id);
      const balances: { [member: string]: number } = {};
      
      // Initialize balances
      group.members.forEach(member => {
        balances[member] = 0;
      });
      
      // Calculate balances
      groupExpenses.forEach(expense => {
        const sharePerPerson = expense.amount / expense.participants.length;
        
        // Payer gets positive balance
        balances[expense.payer] += expense.amount;
        
        // Participants get negative balance
        expense.participants.forEach(participant => {
          balances[participant] -= sharePerPerson;
        });
      });
      
      // Convert balances to debts
      const positiveBalances = Object.entries(balances).filter(([_, amount]) => amount > 0);
      const negativeBalances = Object.entries(balances).filter(([_, amount]) => amount < 0);
      
      negativeBalances.forEach(([debtor, debtAmount]) => {
        let remainingDebt = Math.abs(debtAmount);
        
        positiveBalances.forEach(([creditor, creditAmount]) => {
          if (remainingDebt > 0 && creditAmount > 0) {
            const transferAmount = Math.min(remainingDebt, creditAmount);
            
            if (transferAmount > 0) {
              debts.push({
                from: debtor,
                to: creditor,
                amount: transferAmount,
                groupId: group.id
              });
              
              remainingDebt -= transferAmount;
              positiveBalances[positiveBalances.findIndex(([name]) => name === creditor)][1] -= transferAmount;
            }
          }
        });
      });
    });
    
    return debts.filter(debt => debt.amount > 0);
  };

  const debts = calculateDebts();
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);

  const handleCreateGroup = (groupData: Omit<Group, 'id' | 'totalExpenses' | 'createdAt'>) => {
    const newGroup: Group = {
      ...groupData,
      id: Date.now().toString(),
      totalExpenses: 0,
      createdAt: new Date()
    };
    setGroups([...groups, newGroup]);
    setIsCreateGroupOpen(false);
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      date: new Date()
    };
    setExpenses([...expenses, newExpense]);
    
    // Update group total
    setGroups(groups.map(group => 
      group.id === expenseData.groupId 
        ? { ...group, totalExpenses: group.totalExpenses + expenseData.amount }
        : group
    ));
    
    setIsExpenseModalOpen(false);
    setSelectedGroup(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-3 rounded-lg border bg-white/80 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Hisob</p>
              <p className="truncate font-medium">{user?.name}</p>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Chiqish
            </Button>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold expense-gradient bg-clip-text text-transparent">
              Guruh Xarajatlari
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Do'stlaringiz bilan xarajatlarni oson taqsimlang va qarzlarni kuzatib boring
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="expense-gradient text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Jami Xarajat</CardTitle>
              <Receipt className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExpenses.toLocaleString()} so'm</div>
            </CardContent>
          </Card>

          <Card className="debt-gradient text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Jami Qarzlar</CardTitle>
              <AlertCircle className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDebts.toLocaleString()} so'm</div>
            </CardContent>
          </Card>

          <Card className="payment-gradient text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Guruhlar</CardTitle>
              <Users className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Xarajatlar</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => setIsCreateGroupOpen(true)}
            size="lg"
            className="expense-gradient border-0 hover:scale-105 transition-transform duration-200 shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Yangi Guruh
          </Button>
          <Button 
            onClick={() => setIsExpenseModalOpen(true)}
            size="lg"
            variant="outline"
            className="hover:scale-105 transition-transform duration-200 shadow-lg"
            disabled={groups.length === 0}
          >
            <Receipt className="mr-2 h-5 w-5" />
            Xarajat Qo'shish
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Guruhlarim</h2>
              <Badge variant="secondary" className="text-sm">
                {groups.length} guruh
              </Badge>
            </div>
            
            {groups.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Guruh yarating</h3>
                <p className="text-muted-foreground mb-4">
                  Xarajatlarni taqsimlash uchun birinchi guruhingizni yarating
                </p>
                <Button onClick={() => setIsCreateGroupOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi Guruh
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {groups.map((group, index) => (
                  <div key={group.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <GroupCard 
                      group={group} 
                      onAddExpense={() => {
                        setSelectedGroup(group);
                        setIsExpenseModalOpen(true);
                      }}
                      expenses={expenses.filter(e => e.groupId === group.id)}
                      debts={debts.filter(d => d.groupId === group.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <DebtSummary debts={debts} groups={groups} />
            <RecentActivity expenses={expenses} groups={groups} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreate={handleCreateGroup}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setSelectedGroup(null);
        }}
        onAdd={handleAddExpense}
        groups={groups}
        selectedGroup={selectedGroup}
      />
    </div>
  );
};

export default Index;
