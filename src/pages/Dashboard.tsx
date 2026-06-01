import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Plus,
  Receipt,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/PageHeader';
import { useAppData } from '@/lib/use-app-data';

const chartColors = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2'];

const categoryLabels: Record<string, string> = {
  'ovqat': 'Ovqat',
  'transport': 'Transport',
  'turar-joy': 'Turar joy',
  'ko\'ngilochar': 'Ko\'ngilochar',
  'boshqa': 'Boshqa',
};

function chartCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)} mln`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} ming`;
  return `${Math.round(value)}`;
}

export default function Dashboard() {
  const {
    groups,
    expenses,
    debts,
    settlements,
    totalExpenses,
    totalDebts,
    totalMembers,
    averageExpense,
    formatCurrency,
    openCreateGroup,
    openExpenseModal,
  } = useAppData();

  const recentExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5),
    [expenses]
  );
  const nextDebts = debts.slice(0, 4);
  const paidTotal = settlements.reduce((sum, settlement) => sum + settlement.amount, 0);
  const debtRatio = totalExpenses ? Math.min(100, Math.round((totalDebts / totalExpenses) * 100)) : 0;
  const clearedRatio = totalDebts + paidTotal ? Math.round((paidTotal / (totalDebts + paidTotal)) * 100) : 100;
  const healthScore = Math.max(0, Math.min(100, 100 - debtRatio));
  const largestDebt = debts.reduce((largest, debt) => (debt.amount > largest.amount ? debt : largest), debts[0] || null);

  const timelineData = useMemo(() => {
    const monthly = new Map<string, { label: string; amount: number; count: number }>();

    expenses.forEach((expense) => {
      const date = expense.date instanceof Date ? expense.date : new Date(expense.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('uz-UZ', { month: 'short', year: '2-digit' });
      const current = monthly.get(key) || { label, amount: 0, count: 0 };
      monthly.set(key, {
        label: current.label,
        amount: current.amount + expense.amount,
        count: current.count + 1,
      });
    });

    return [...monthly.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, value]) => value);
  }, [expenses]);

  const groupChartData = useMemo(() => {
    return groups
      .map((group) => {
        const groupExpenses = expenses.filter((expense) => expense.groupId === group.id);
        const total = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0) || group.totalExpenses;
        const debtTotal = debts
          .filter((debt) => debt.groupId === group.id)
          .reduce((sum, debt) => sum + debt.amount, 0);

        return {
          id: group.id,
          name: group.name,
          members: group.members.length,
          expenses: total,
          debts: debtTotal,
          count: groupExpenses.length,
        };
      })
      .sort((a, b) => b.expenses - a.expenses)
      .slice(0, 6);
  }, [debts, expenses, groups]);

  const categoryData = useMemo(() => {
    const totals = new Map<string, number>();

    expenses.forEach((expense) => {
      const label = categoryLabels[expense.category] || expense.category || 'Boshqa';
      totals.set(label, (totals.get(label) || 0) + expense.amount);
    });

    return [...totals.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [expenses]);

  const groupStatus = useMemo(() => {
    return groupChartData.slice(0, 5).map((group) => ({
      ...group,
      debtPercent: group.expenses ? Math.round((group.debts / group.expenses) * 100) : 0,
    }));
  }, [groupChartData]);

  const getGroupName = (groupId: string) => groups.find((group) => group.id === groupId)?.name || 'Noma\'lum guruh';

  const healthLabel = totalDebts === 0 ? 'Toza balans' : debtRatio <= 20 ? 'Nazoratda' : 'E\'tibor kerak';
  const healthClass =
    totalDebts === 0
      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
      : debtRatio <= 20
        ? 'bg-blue-50 text-blue-700 hover:bg-blue-50'
        : 'bg-amber-50 text-amber-700 hover:bg-amber-50';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Guruh xarajatlari, qarzlar va to'lov holatini diagrammalar bilan aniq kuzating."
        actions={
          <>
            <Button onClick={openCreateGroup} className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Yangi guruh
            </Button>
            <Button
              onClick={() => openExpenseModal()}
              variant="outline"
              className="border-slate-300 bg-white"
              disabled={groups.length === 0}
            >
              <Receipt className="h-4 w-4" />
              Xarajat qo'shish
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Jami xarajat</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{expenses.length} ta xarajat yozuvi</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Ochiq qarz</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{formatCurrency(totalDebts)}</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{debts.length ? `${debts.length} ta to'lov kutilmoqda` : 'Hamma hisoblar teng'}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">A'zolar va guruhlar</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{totalMembers}</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{groups.length} ta faol guruh</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">O'rtacha xarajat</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{formatCurrency(averageExpense)}</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">Har bir xarajat bo'yicha</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-slate-950">Xarajatlar dinamikasi</h2>
              <p className="text-sm text-slate-500">Oylar kesimida xarajat hajmi va yozuvlar soni.</p>
            </div>
            <Badge className={healthClass}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {healthLabel}
            </Badge>
          </div>

          <div className="h-[320px] px-2 py-5 sm:px-5">
            {timelineData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={chartCurrency}
                    width={56}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Xarajat']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#059669"
                    strokeWidth={3}
                    fill="url(#expenseGradient)"
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-center text-sm text-slate-500">
                Xarajat qo'shilgandan keyin trend diagrammasi ko'rinadi.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-slate-950">Moliyaviy salomatlik</h2>
              <p className="text-sm text-slate-500">Ochiq qarzlar umumiy xarajatga nisbatan.</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Ishonch indeksi</p>
                <p className="mt-1 text-4xl font-semibold tracking-normal text-slate-950">{healthScore}%</p>
              </div>
              <Badge className={healthClass}>{healthLabel}</Badge>
            </div>
            <Progress value={healthScore} className="mt-4 h-2" />
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Qarz ulushi</span>
                <span className="font-semibold text-slate-950">{debtRatio}%</span>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Yopilgan to'lovlar</span>
                <span className="font-semibold text-slate-950">{clearedRatio}%</span>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Eng katta qarz</span>
                <span className="font-semibold text-slate-950">{largestDebt ? formatCurrency(largestDebt.amount) : 'Yo\'q'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-slate-950">Guruhlar bo'yicha taqqoslash</h2>
              <p className="text-sm text-slate-500">Xarajat va ochiq qarzlar kesimida eng faol guruhlar.</p>
            </div>
            <Button asChild variant="outline" className="w-full border-slate-300 bg-white sm:w-auto">
              <Link to="/groups">Barcha guruhlar</Link>
            </Button>
          </div>

          <div className="h-[320px] px-2 py-5 sm:px-5">
            {groupChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    interval={0}
                    minTickGap={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={chartCurrency}
                    width={56}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name === 'expenses' ? 'Xarajat' : 'Ochiq qarz',
                    ]}
                    contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="expenses" name="Xarajat" radius={[6, 6, 0, 0]} fill="#2563eb" />
                  <Bar dataKey="debts" name="Ochiq qarz" radius={[6, 6, 0, 0]} fill="#d97706" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-center text-sm text-slate-500">
                Guruh ochilgandan keyin taqqoslash ko'rinadi.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="text-lg font-semibold tracking-normal text-slate-950">Kategoriya taqsimoti</h2>
            <p className="text-sm text-slate-500">Qaysi yo'nalishga ko'proq pul ketayotganini ko'ring.</p>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
            <div className="h-[220px]">
              {categoryData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={86} paddingAngle={3}>
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), 'Xarajat']}
                      contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-center text-sm text-slate-500">
                  Kategoriya yo'q
                </div>
              )}
            </div>

            <div className="space-y-3">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="truncate text-sm font-medium text-slate-900">{category.name}</span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-950">{formatCurrency(category.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-slate-950">Guruhlar holati</h2>
              <p className="text-sm text-slate-500">Qarz ulushi yuqori guruhlarni tez aniqlash.</p>
            </div>
            <WalletCards className="h-5 w-5 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100">
            {groupStatus.length ? (
              groupStatus.map((group) => (
                <div key={group.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-slate-950">{group.name}</p>
                      <Badge
                        className={
                          group.debts
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-50'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                        }
                      >
                        {group.debts ? `${formatCurrency(group.debts)} qarz` : 'Hisob teng'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {group.members} a'zo - {group.count} xarajat - {formatCurrency(group.expenses)}
                    </p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>Qarz ulushi</span>
                      <span>{group.debtPercent}%</span>
                    </div>
                    <Progress value={Math.min(100, group.debtPercent)} className="h-2" />
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-slate-500">Hozircha guruh mavjud emas.</div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold tracking-normal text-slate-950">Keyingi to'lovlar</h2>
                <p className="text-sm text-slate-500">Eng muhim qarzlarni yopish tartibi.</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/debts">
                  Ko'rish
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="space-y-3 p-5">
              {nextDebts.length ? (
                nextDebts.map((debt, index) => (
                  <div key={`${debt.from}-${debt.to}-${index}`} className="rounded-lg bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-sm font-medium text-slate-950">
                        {debt.from} to'laydi: {debt.to}
                      </p>
                      <p className="shrink-0 text-sm font-semibold text-blue-700">{formatCurrency(debt.amount)}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{getGroupName(debt.groupId)}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-emerald-50 p-4 text-center">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-700" />
                  <p className="mt-2 text-sm font-medium text-emerald-900">Ochiq qarz yo'q</p>
                  <p className="mt-1 text-xs text-emerald-700">Barcha guruhlarda hisob-kitoblar teng.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold tracking-normal text-slate-950">So'nggi xarajatlar</h2>
                <p className="text-sm text-slate-500">Yangi kiritilgan yozuvlar.</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/activity">
                  Ko'rish
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentExpenses.length ? (
                recentExpenses.map((expense) => (
                  <div key={expense.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-950">{expense.title}</p>
                        <p className="text-xs text-slate-500">
                          {expense.payer} to'ladi - {getGroupName(expense.groupId)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-slate-900">{formatCurrency(expense.amount)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-sm text-slate-500">Hozircha xarajat yozuvi yo'q.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-slate-950">Xarajatlarni vaqtida kiriting</p>
              <p className="mt-1 text-sm text-slate-500">Har bir xarajat kiritilganda balans avtomatik yangilanadi.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-slate-950">Qarzlarni yopib boring</p>
              <p className="mt-1 text-sm text-slate-500">To'langan qarzlar dashboard salomatlik indeksini oshiradi.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-slate-950">Hisobotlardan foydalaning</p>
              <p className="mt-1 text-sm text-slate-500">CSV va print orqali ma'lumotlarni ishonchli ulashish mumkin.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
