import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { RecentActivity } from '@/components/RecentActivity';
import { useAppData } from '@/lib/use-app-data';

export default function Activity() {
  const { groups, expenses, openExpenseModal } = useAppData();

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

      <div className="max-w-3xl">
        <RecentActivity expenses={expenses} groups={groups} />
      </div>
    </div>
  );
}
