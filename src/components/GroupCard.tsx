
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Calendar, Receipt } from 'lucide-react';
import { Group, Expense, Debt } from '@/pages/Index';

interface GroupCardProps {
  group: Group;
  onAddExpense: () => void;
  expenses: Expense[];
  debts: Debt[];
}

export const GroupCard = ({ group, onAddExpense, expenses, debts }: GroupCardProps) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} so'm`;
  };

  const getGroupDebts = () => {
    return debts.filter(debt => debt.groupId === group.id);
  };

  const groupDebts = getGroupDebts();
  const hasDebts = groupDebts.length > 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold text-foreground">
              {group.name}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {group.description}
            </p>
          </div>
          <Badge 
            className={`${hasDebts ? 'bg-debt-primary hover:bg-debt-secondary' : 'bg-primary hover:bg-primary/90'} text-white`}
          >
            {hasDebts ? 'Qarzlar bor' : 'Barcha hisob'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-expense-light rounded-lg">
            <div className="text-2xl font-bold text-expense-primary">
              {formatCurrency(group.totalExpenses)}
            </div>
            <div className="text-xs text-expense-dark">Jami xarajat</div>
          </div>
          
          <div className="text-center p-3 bg-debt-light rounded-lg">
            <div className="text-2xl font-bold text-debt-primary">
              {groupDebts.length}
            </div>
            <div className="text-xs text-debt-dark">Qarz holatlari</div>
          </div>
        </div>

        {/* Members */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>A'zolar ({group.members.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.members.map((member, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {member}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        {expenses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4" />
              <span>So'nggi xarajatlar</span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {expenses.slice(0, 3).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <div>
                    <div className="font-medium text-sm">{expense.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {expense.payer} to'ladi
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Debts */}
        {groupDebts.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-medium">Aktiv qarzlar:</div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {groupDebts.slice(0, 2).map((debt, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-debt-light rounded text-sm">
                  <span className="text-debt-dark">
                    {debt.from} → {debt.to}
                  </span>
                  <span className="font-medium text-debt-primary">
                    {formatCurrency(debt.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={onAddExpense}
            className="flex-1 expense-gradient border-0 hover:scale-105 transition-transform duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Xarajat qo'shish
          </Button>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>Yaratildi: {group.createdAt.toLocaleDateString('uz-UZ')}</span>
        </div>
      </CardContent>
    </Card>
  );
};
