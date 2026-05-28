import { Receipt, Scale, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppData } from '@/lib/use-app-data';

export function StatsGrid() {
  const { expenses, debts, groups, totalExpenses, totalDebts, totalMembers, averageExpense, formatCurrency } = useAppData();

  const stats = [
    {
      label: 'Jami xarajat',
      value: formatCurrency(totalExpenses),
      note: `${expenses.length} ta xarajat yozuvi`,
      icon: Receipt,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Ochiq qarzlar',
      value: formatCurrency(totalDebts),
      note: totalDebts > 0 ? `${debts.length} ta to'lov kerak` : 'Hisob-kitoblar teng',
      icon: Scale,
      iconClass: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Guruhlar',
      value: `${groups.length}`,
      note: `${totalMembers} ta a'zo qo'shilgan`,
      icon: Users,
      iconClass: 'bg-violet-50 text-violet-700',
    },
    {
      label: "O'rtacha xarajat",
      value: formatCurrency(averageExpense),
      note: "Har bir yozuv bo'yicha",
      icon: TrendingUp,
      iconClass: 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-2 truncate text-2xl font-semibold tracking-normal text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.note}</p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
