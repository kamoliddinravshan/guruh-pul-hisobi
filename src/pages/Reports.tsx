import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { useAppData } from '@/lib/use-app-data';

export default function Reports() {
  const { groups, expenses, formatCurrency } = useAppData();

  const categoryRows = Object.entries(
    expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {})
  ).map(([category, amount]) => ({ category, amount }));

  const groupRows = groups.map((group) => ({
    name: group.name,
    amount: expenses.filter((expense) => expense.groupId === group.id).reduce((sum, expense) => sum + expense.amount, 0),
  }));

  const topPayers = Object.entries(
    expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.payer] = (acc[expense.payer] || 0) + expense.amount;
      return acc;
    }, {})
  )
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const exportCsv = () => {
    const rows = [
      ['Sana', 'Guruh', 'Xarajat', 'Kategoriya', 'Tolovchi', 'Summa'],
      ...expenses.map((expense) => [
        expense.date.toLocaleDateString('uz-UZ'),
        groups.find((group) => group.id === expense.groupId)?.name || '',
        expense.title,
        expense.category,
        expense.payer,
        String(expense.amount),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'guruh-pul-hisobi.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hisobotlar"
        description="Xarajatlarni guruh, kategoriya va to'lovchi bo'yicha tahlil qiling."
        actions={
          <>
            <Button onClick={exportCsv} className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Download className="h-4 w-4" />
              CSV yuklash
            </Button>
            <Button variant="outline" className="border-slate-300 bg-white" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Chop etish
            </Button>
          </>
        }
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg tracking-normal">Guruhlar bo'yicha xarajat</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg tracking-normal">Kategoriya bo'yicha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryRows.map((row) => (
              <div key={row.category} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="font-medium capitalize text-slate-900">{row.category}</span>
                <span className="font-semibold text-slate-950">{formatCurrency(row.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg tracking-normal">Eng ko'p to'laganlar</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {topPayers.map((payer) => (
              <div key={payer.name} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="font-medium text-slate-950">{payer.name}</p>
                <p className="mt-1 text-xl font-semibold text-emerald-700">{formatCurrency(payer.amount)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
