import { useState } from 'react';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { RecentActivity } from '@/components/RecentActivity';
import { useAppData } from '@/lib/use-app-data';

export default function Activity() {
  const { groups, expenses, openExpenseModal } = useAppData();
  const [query, setQuery] = useState('');
  const filteredExpenses = expenses.filter((expense) => {
    const groupName = groups.find((group) => group.id === expense.groupId)?.name || '';
    const value = `${expense.title} ${expense.payer} ${expense.category} ${groupName} ${expense.participants.join(' ')}`.toLowerCase();
    return value.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faoliyat"
        description="So'nggi xarajat yozuvlari, to'lovchilar va ishtirokchilar tarixi."
        actions={
          <Button
            onClick={() => openExpenseModal()}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={groups.length === 0}
          >
            <Receipt className="h-4 w-4" />
            Xarajat qo'shish
          </Button>
        }
      />

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Xarajat, to'lovchi yoki guruh bo'yicha qidirish"
        className="h-11 max-w-3xl border-slate-300 bg-white"
      />

      <div className="max-w-3xl">
        <RecentActivity expenses={filteredExpenses} groups={groups} />
      </div>
    </div>
  );
}
