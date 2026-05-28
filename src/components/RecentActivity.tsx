
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Receipt, Users } from 'lucide-react';
import type { Expense, Group } from '@/types';

interface RecentActivityProps {
  expenses: Expense[];
  groups: Group[];
}

const categoryLabels: { [key: string]: string } = {
  'ovqat': 'Ovqat',
  'transport': 'Transport',
  'turar-joy': 'Turar joy',
  'ko\'ngilochar': 'Ko\'ngilochar',
  'shopping': 'Xarid',
  'sog\'liq': 'Sog\'liq',
  'boshqa': 'Boshqa'
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
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-normal text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Clock className="h-5 w-5" />
            </span>
            So'nggi faoliyat
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Receipt className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate-500">
            Hali hech qanday xarajat qo'shilmagan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-normal text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Clock className="h-5 w-5" />
          </span>
          So'nggi faoliyat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {sortedExpenses.map((expense, index) => (
            <div
              key={expense.id}
              className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-slate-100/70 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Category Icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                <Receipt className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-950">
                      {expense.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {expense.payer} to'ladi - {getGroupName(expense.groupId)}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-slate-900">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatTimeAgo(expense.date)}
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="h-6 border-slate-200 bg-white text-xs text-slate-600">
                    {categoryLabels[expense.category] || 'Boshqa'}
                  </Badge>
                  <Users className="h-3 w-3 text-slate-400" />
                  <div className="flex gap-1 flex-wrap">
                    {expense.participants.slice(0, 3).map((participant, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-white px-1.5 py-0.5 text-xs text-slate-600 hover:bg-white"
                      >
                        {participant}
                      </Badge>
                    ))}
                    {expense.participants.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="bg-white px-1.5 py-0.5 text-xs text-slate-600 hover:bg-white"
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
          <div className="border-t pt-2 text-center">
            <div className="text-sm text-slate-500">
              ... va yana {expenses.length - 10} ta xarajat
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
