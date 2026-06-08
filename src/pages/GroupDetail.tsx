import { FormEvent, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Receipt, Scale, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { DebtSummary } from '@/components/DebtSummary';
import { useAppData } from '@/lib/use-app-data';

export default function GroupDetail() {
  const { groupId } = useParams();
  const { getGroupById, expenses, debts, openExpenseModal, markDebtPaid, formatCurrency, addGroupMembers } = useAppData();
  const [memberName, setMemberName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const group = groupId ? getGroupById(groupId) : undefined;

  if (!group) return <Navigate to="/groups" replace />;

  const groupExpenses = expenses.filter((expense) => expense.groupId === group.id);
  const groupDebts = debts.filter((debt) => debt.groupId === group.id);
  const total = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const memberRows = group.members.map((member) => {
    const paid = groupExpenses.filter((expense) => expense.payer === member).reduce((sum, expense) => sum + expense.amount, 0);
    const share = groupExpenses.reduce((sum, expense) => {
      if (!expense.participants.includes(member)) return sum;
      return sum + expense.amount / expense.participants.length;
    }, 0);
    return { member, paid, share, balance: paid - share };
  });

  const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextMember = memberName.trim();
    if (!nextMember) return;

    setIsAddingMember(true);
    try {
      await addGroupMembers(group.id, [nextMember]);
      setMemberName('');
      toast({
        title: 'A’zo qo‘shildi',
        description: `${nextMember} guruhga qo‘shildi.`,
      });
    } catch (error) {
      toast({
        title: 'A’zo qo‘shilmadi',
        description: error instanceof Error ? error.message : 'Server a’zo qo‘shish so‘rovini qabul qilmadi.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingMember(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Button asChild variant="ghost" className="mb-4 px-0 text-slate-600 hover:bg-transparent">
          <Link to="/groups">
            <ArrowLeft className="h-4 w-4" />
            Guruhlarga qaytish
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-slate-950">{group.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">{group.description || 'Tavsif kiritilmagan'}</p>
          </div>
          <Button onClick={() => openExpenseModal(group)} className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Xarajat qo'shish
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <Receipt className="h-5 w-5 text-emerald-700" />
            <p className="mt-3 text-sm text-slate-500">Jami xarajat</p>
            <p className="mt-1 text-2xl font-semibold">{formatCurrency(total)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <Users className="h-5 w-5 text-violet-700" />
            <p className="mt-3 text-sm text-slate-500">A'zolar</p>
            <p className="mt-1 text-2xl font-semibold">{group.members.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <Scale className="h-5 w-5 text-blue-700" />
            <p className="mt-3 text-sm text-slate-500">Ochiq qarzlar</p>
            <p className="mt-1 text-2xl font-semibold">{groupDebts.length}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg tracking-normal">
                <UserPlus className="h-5 w-5 text-emerald-700" />
                A’zo qo‘shish
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={memberName}
                  onChange={(event) => setMemberName(event.target.value)}
                  placeholder="Masalan: Ali Valiyev"
                  className="h-11 border-slate-300 bg-white text-slate-950"
                />
                <Button
                  type="submit"
                  disabled={!memberName.trim() || isAddingMember}
                  className="h-11 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {isAddingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Qo‘shish
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg tracking-normal">A'zolar balansi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {memberRows.map((row) => (
                <div key={row.member} className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-medium text-slate-950">{row.member}</p>
                    <p className="text-xs text-slate-500">To'lagan: {formatCurrency(row.paid)} - Ulush: {formatCurrency(row.share)}</p>
                  </div>
                  <Badge className={row.balance >= 0 ? 'w-fit bg-emerald-50 text-emerald-700 hover:bg-emerald-50' : 'w-fit bg-blue-50 text-blue-700 hover:bg-blue-50'}>
                    {row.balance >= 0 ? '+' : ''}{formatCurrency(row.balance)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg tracking-normal">Xarajatlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">{expense.title}</p>
                    <p className="text-xs text-slate-500">{expense.payer} to'ladi - {expense.participants.length} ishtirokchi</p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-900">{formatCurrency(expense.amount)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <DebtSummary debts={groupDebts} groups={[group]} onMarkPaid={markDebtPaid} />
      </section>
    </div>
  );
}
