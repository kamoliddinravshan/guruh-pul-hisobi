
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import type { Debt, Group } from '@/types';

interface DebtSummaryProps {
  debts: Debt[];
  groups: Group[];
  onMarkPaid?: (debt: Debt) => void;
}

export const DebtSummary = ({ debts, groups, onMarkPaid }: DebtSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} so'm`;
  };

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || 'Noma\'lum guruh';
  };

  const totalDebtAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);

  if (debts.length === 0) {
    return (
      <Card className="border-emerald-100 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-normal text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle className="h-5 w-5" />
            </span>
            Qarzlar holati
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-950">
            Hisoblar teng
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Barcha hisob-kitoblar teng. Hech kim hech kimga qarz emas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-normal text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <AlertCircle className="h-5 w-5" />
            </span>
            Qarzlar holati
          </CardTitle>
          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            {debts.length} ta qarz
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Total Debt Amount */}
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="text-sm font-medium text-blue-700">
            Jami qarz miqdori
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-950">
            {formatCurrency(totalDebtAmount)}
          </div>
        </div>

        {/* Debt List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {debts.map((debt, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
            >
              {/* Debt Info */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium text-slate-900">
                    {debt.from}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate font-medium text-slate-900">
                    {debt.to}
                  </span>
                </div>
                <div className="shrink-0 text-sm font-semibold text-blue-700">
                  {formatCurrency(debt.amount)}
                </div>
              </div>

              {/* Group Info */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  {getGroupName(debt.groupId)} guruhida
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-slate-300 bg-white text-xs text-slate-700"
                  onClick={() => onMarkPaid?.(debt)}
                >
                  To'landi deb belgilash
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Settlement Suggestions */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 text-sm font-medium text-slate-800">
            Qarzlarni yopish bo'yicha tavsiya
          </div>
          <div className="space-y-1 text-xs text-slate-600">
            <div>- Bank o'tkazmalari orqali to'lang</div>
            <div>- To'lovdan keyin "To'landi" tugmasini bosing</div>
            <div>- Katta miqdordagi qarzlardan boshlang</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
