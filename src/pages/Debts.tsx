import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { DebtSummary } from '@/components/DebtSummary';
import { useAppData } from '@/lib/use-app-data';

export default function Debts() {
  const { groups, debts, openExpenseModal } = useAppData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Qarzlar"
        description="Kim kimga qancha to'lashi kerakligini kuzating va hisoblarni tartibga keltiring."
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

      <StatsGrid />

      <div className="max-w-3xl">
        <DebtSummary debts={debts} groups={groups} />
      </div>
    </div>
  );
}
