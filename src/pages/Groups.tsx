import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { GroupCard } from '@/components/GroupCard';
import { useAppData } from '@/lib/use-app-data';

export default function Groups() {
  const { groups, expenses, debts, openCreateGroup, openExpenseModal } = useAppData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guruhlar"
        description="Har bir guruhdagi xarajatlar, a'zolar va qarz holatini alohida boshqaring."
        actions={
          <Button onClick={openCreateGroup} className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Yangi guruh
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-normal">Barcha guruhlar</h2>
          <p className="text-sm text-slate-500">Guruh tanlab xarajat qo'shing yoki qarz holatini ko'ring.</p>
        </div>
        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
          {groups.length} guruh
        </Badge>
      </div>

      {groups.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-white">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Birinchi guruhni yarating</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Xarajatlarni taqsimlash uchun birinchi guruhingizni yarating.
            </p>
            <Button onClick={openCreateGroup} className="mt-5 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Yangi guruh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onAddExpense={() => openExpenseModal(group)}
              expenses={expenses.filter((expense) => expense.groupId === group.id)}
              debts={debts.filter((debt) => debt.groupId === group.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
