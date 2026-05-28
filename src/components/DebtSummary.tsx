
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { Debt, Group } from '@/pages/Index';

interface DebtSummaryProps {
  debts: Debt[];
  groups: Group[];
}

export const DebtSummary = ({ debts, groups }: DebtSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} so'm`;
  };

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || 'Noma\'lum guruh';
  };

  const totalDebtAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);

  if (debts.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Qarzlar holati
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Ajoyib!
          </h3>
          <p className="text-green-600">
            Barcha hisob-kitoblar teng. Hech kim hech kimga qarz emas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <AlertCircle className="h-5 w-5" />
            Qarzlar holati
          </CardTitle>
          <Badge className="bg-debt-primary hover:bg-debt-secondary text-white">
            {debts.length} ta qarz
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Total Debt Amount */}
        <div className="text-center p-4 bg-white/50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-debt-primary">
            {formatCurrency(totalDebtAmount)}
          </div>
          <div className="text-sm text-debt-dark">
            Jami qarz miqdori
          </div>
        </div>

        {/* Debt List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {debts.map((debt, index) => (
            <div
              key={index}
              className="bg-white/70 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
            >
              {/* Debt Info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-debt-primary">
                    {debt.from}
                  </span>
                  <ArrowRight className="h-4 w-4 text-debt-secondary" />
                  <span className="font-medium text-debt-primary">
                    {debt.to}
                  </span>
                </div>
                <div className="text-lg font-bold text-debt-primary">
                  {formatCurrency(debt.amount)}
                </div>
              </div>

              {/* Group Info */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {getGroupName(debt.groupId)} guruhida
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs hover:bg-debt-light border-debt-primary text-debt-primary"
                >
                  To'landi deb belgilash
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Settlement Suggestions */}
        <div className="mt-4 p-3 bg-white/50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-debt-dark mb-2">
            💡 Maslahat: Qarzlarni oson to'lash uchun
          </div>
          <div className="text-xs text-debt-dark space-y-1">
            <div>• Bank o'tkazmalari orqali to'lang</div>
            <div>• To'lovdan keyin "To'landi" tugmasini bosing</div>
            <div>• Katta miqdordagi qarzlardan boshlang</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
