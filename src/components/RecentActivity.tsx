
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Receipt, Users } from 'lucide-react';
import { Expense, Group } from '@/pages/Index';

interface RecentActivityProps {
  expenses: Expense[];
  groups: Group[];
}

const categoryEmojis: { [key: string]: string } = {
  'ovqat': '🍽️',
  'transport': '🚗',
  'turar-joy': '🏠',
  'ko\'ngilochar': '🎉',
  'shopping': '🛍️',
  'sog\'liq': '💊',
  'boshqa': '📋'
};

export const RecentActivity = ({ expenses, groups }: RecentActivityProps) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} so'm`;
  };

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || 'Noma\'lum guruh';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} kun oldin`;
    } else if (diffHours > 0) {
      return `${diffHours} soat oldin`;
    } else {
      return 'Hozirgina';
    }
  };

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10); // Show last 10 activities

  if (sortedExpenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            So'nggi faoliyat
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Hali hech qanday xarajat qo'shilmagan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          So'nggi faoliyat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {sortedExpenses.map((expense, index) => (
            <div
              key={expense.id}
              className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Category Icon */}
              <div className="text-xl">
                {categoryEmojis[expense.category] || '📋'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {expense.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {expense.payer} to'ladi • {getGroupName(expense.groupId)}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-primary">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(expense.date)}
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-center gap-2 mt-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <div className="flex gap-1 flex-wrap">
                    {expense.participants.slice(0, 3).map((participant, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {participant}
                      </Badge>
                    ))}
                    {expense.participants.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5"
                      >
                        +{expense.participants.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {expenses.length > 10 && (
          <div className="text-center pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              ... va yana {expenses.length - 10} ta xarajat
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
