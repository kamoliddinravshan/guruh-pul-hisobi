
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Plus, Receipt, Scale, Users } from 'lucide-react';
import type { Group, Expense, Debt } from '@/types';

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
    <Card className="border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="truncate text-lg font-semibold tracking-normal text-slate-950">
                {group.name}
              </CardTitle>
              <p className="line-clamp-2 text-sm text-slate-500">
                {group.description || 'Tavsif kiritilmagan'}
              </p>
            </div>
          </div>
          <Badge 
            className={`w-fit ${hasDebts ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50'}`}
          >
            {hasDebts ? 'To\'lov kerak' : 'Hisob teng'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <Receipt className="h-3.5 w-3.5" />
              Jami xarajat
            </div>
            <div className="mt-2 truncate text-lg font-semibold text-slate-950">
              {formatCurrency(group.totalExpenses)}
            </div>
          </div>
          
          <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
              <Scale className="h-3.5 w-3.5" />
              Qarz holati
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-950">
              {groupDebts.length}
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Users className="h-4 w-4" />
            <span>A'zolar ({group.members.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.members.map((member, index) => (
              <Badge key={index} variant="secondary" className="bg-slate-100 text-xs text-slate-700 hover:bg-slate-100">
                {member}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        {expenses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Receipt className="h-4 w-4" />
              <span>So'nggi xarajatlar</span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {expenses.slice(0, 3).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-950">{expense.title}</div>
                    <div className="text-xs text-slate-500">
                      {expense.payer} to'ladi
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-slate-900">
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
            <div className="text-sm font-medium text-slate-600">To'lanishi kerak</div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {groupDebts.slice(0, 2).map((debt, index) => (
                <div key={index} className="flex items-center justify-between gap-3 rounded-lg bg-blue-50 p-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-blue-900">
                    <span className="truncate">{debt.from}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{debt.to}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-blue-700">
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
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Xarajat qo'shish
          </Button>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2 border-t pt-3 text-xs text-slate-500">
          <Calendar className="h-3 w-3" />
          <span>Yaratildi: {group.createdAt.toLocaleDateString('uz-UZ')}</span>
        </div>
      </CardContent>
    </Card>
  );
};
