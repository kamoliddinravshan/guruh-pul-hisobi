import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Plus, Receipt, Scale, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { useAppData } from '@/lib/use-app-data';

export default function Dashboard() {
  const {
    groups,
    expenses,
    debts,
    totalExpenses,
    totalDebts,
    averageExpense,
    formatCurrency,
    openCreateGroup,
    openExpenseModal,
  } = useAppData();

  const recentExpenses = [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 4);
  const nextDebts = debts.slice(0, 3);
  const mostActiveGroups = groups
    .map((group) => ({
      group,
      expenseCount: expenses.filter((expense) => expense.groupId === group.id).length,
      debtCount: debts.filter((debt) => debt.groupId === group.id).length,
    }))
    .slice(0, 4);

  const getGroupName = (groupId: string) => groups.find((group) => group.id === groupId)?.name || 'Noma\'lum guruh';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Eng muhim ko'rsatkichlar, ochiq qarzlar va so'nggi xarajatlarni qisqa ko'rinishda kuzating."
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

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Jami xarajat</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{expenses.length} ta xarajat yozuvi</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Ochiq qarz</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{formatCurrency(totalDebts)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{debts.length ? `${debts.length} ta to'lov kutilmoqda` : 'Hamma hisoblar teng'}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Guruhlar</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{groups.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">O'rtacha xarajat: {formatCurrency(averageExpense)}</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-slate-950">Guruhlar holati</h2>
              <p className="text-sm text-slate-500">Qaysi guruhda qancha xarajat va qarz borligini tez ko'ring.</p>
            </div>
            <Button asChild variant="outline" className="hidden border-slate-300 bg-white sm:inline-flex">
              <Link to="/groups">Barchasi</Link>
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {mostActiveGroups.map(({ group, expenseCount, debtCount }) => (
              <div key={group.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-slate-950">{group.name}</p>
                    <Badge className={debtCount ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50'}>
                      {debtCount ? `${debtCount} qarz` : 'Hisob teng'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{group.members.length} a'zo - {expenseCount} xarajat</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-slate-950">{formatCurrency(group.totalExpenses)}</p>
                  <p className="text-xs text-slate-500">jami xarajat</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold tracking-normal text-slate-950">Keyingi to'lovlar</h2>
                <p className="text-sm text-slate-500">Eng yaqin qarzlarni yopish tartibi.</p>
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
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">{expense.title}</p>
                      <p className="text-xs text-slate-500">{expense.payer} to'ladi - {getGroupName(expense.groupId)}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
