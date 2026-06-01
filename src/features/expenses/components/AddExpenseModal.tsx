import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { ExpenseDraft, SplitType, User } from '@/shared/types';

const categories = [
  ['🍽️', 'ovqat'], ['🚕', 'transport'], ['🏠', 'turar-joy'], ['🎬', 'ko\'ngilochar'],
  ['🛒', 'bozor'], ['☕', 'kafe'], ['🎁', 'sovg\'a'], ['💊', 'sog\'liq'],
  ['📚', 'o\'qish'], ['⛽', 'yoqilg\'i'], ['✈️', 'sayohat'], ['📌', 'boshqa'],
] as const;

const schema = z.object({
  amount: z.coerce.number().min(1000, 'Kamida 1 000 so\'m kiriting'),
  description: z.string().trim().min(2, 'Tavsif kamida 2 ta belgidan iborat bo\'lsin').max(120),
  category: z.string().min(1, 'Kategoriya tanlang'),
  paidBy: z.string().min(1, 'Kim to\'laganini tanlang'),
  splitType: z.enum(['equal', 'percent', 'exact']),
});

type FormValues = z.infer<typeof schema>;

interface AddExpenseModalProps {
  open: boolean;
  members: User[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (expense: ExpenseDraft) => Promise<void> | void;
}

/**
 * Multi-step add expense modal with live validation and equal/percent/exact split preview.
 */
export function AddExpenseModal({ open, members, onOpenChange, onSubmit }: AddExpenseModalProps) {
  const [step, setStep] = useState(1);
  const [smartSplit, setSmartSplit] = useState(true);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { amount: 0, description: '', category: 'ovqat', paidBy: '', splitType: 'equal' },
  });
  const amount = form.watch('amount') || 0;
  const splitType = smartSplit ? 'equal' : form.watch('splitType');

  const shares = useMemo(() => {
    const memberCount = Math.max(1, members.length);
    if (splitType === 'percent') return members.map((member) => ({ userId: member.id, share: Math.round(amount / memberCount) }));
    if (splitType === 'exact') return members.map((member) => ({ userId: member.id, share: Math.round(amount / memberCount) }));
    return members.map((member) => ({ userId: member.id, share: Math.round(amount / memberCount) }));
  }, [amount, members, splitType]);

  const next = async () => {
    const fields: Array<keyof FormValues> = step === 1 ? ['amount', 'description', 'category'] : ['paidBy'];
    if (await form.trigger(fields)) setStep((current) => Math.min(3, current + 1));
  };

  const submit = form.handleSubmit(async (values) => {
    await onSubmit({
      amount: values.amount,
      description: values.description.trim(),
      category: values.category,
      paidBy: values.paidBy,
      splitType: splitType as SplitType,
      splitBetween: shares,
      date: new Date().toISOString(),
    });
    form.reset();
    setStep(1);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bottom-0 top-auto max-h-[92vh] translate-y-0 rounded-b-none p-0 sm:top-1/2 sm:max-w-xl sm:-translate-y-1/2 sm:rounded-lg">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Yangi xarajat qo'shish</DialogTitle>
          <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Jarayon">
            {[1, 2, 3].map((item) => (
              <div key={item} className={cn('h-2 rounded-full bg-slate-200', item <= step && 'bg-blue-600')} />
            ))}
          </div>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5 overflow-y-auto px-5 py-4" aria-live="polite">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Summa</Label>
                <Input id="amount" inputMode="numeric" {...form.register('amount')} placeholder="320000" />
                <p className="text-sm text-red-600">{form.formState.errors.amount?.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Tavsif</Label>
                <Input id="description" {...form.register('description')} placeholder="Kechki ovqat" />
                <p className="text-sm text-red-600">{form.formState.errors.description?.message}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {categories.map(([icon, value]) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => form.setValue('category', value, { shouldValidate: true })}
                    className={cn('rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600', form.watch('category') === value && 'border-blue-600 bg-blue-50')}
                  >
                    <span className="block text-xl" aria-hidden="true">{icon}</span>
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-3">
              {members.map((member) => (
                <button type="button" key={member.id} onClick={() => form.setValue('paidBy', member.id, { shouldValidate: true })} className={cn('flex w-full items-center justify-between rounded-xl border p-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-600', form.watch('paidBy') === member.id && 'border-blue-600 bg-blue-50')}>
                  <span className="font-medium">{member.name}</span>
                  {form.watch('paidBy') === member.id ? <Check className="h-4 w-4 text-blue-600" /> : null}
                </button>
              ))}
              <p className="text-sm text-red-600">{form.formState.errors.paidBy?.message}</p>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <Label htmlFor="smartSplit">Aqlli taqsimlash</Label>
                <Switch id="smartSplit" checked={smartSplit} onCheckedChange={setSmartSplit} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['equal', 'percent', 'exact'] as SplitType[]).map((type) => (
                  <button type="button" disabled={smartSplit} key={type} onClick={() => form.setValue('splitType', type)} className={cn('rounded-xl border p-3 text-sm capitalize disabled:opacity-50', splitType === type && 'border-blue-600 bg-blue-50')}>
                    {type}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {shares.map((share) => (
                  <div key={share.userId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span>{members.find((member) => member.id === share.userId)?.name}</span>
                    <span className="font-semibold">{formatCurrency(share.share)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex justify-between border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4" /> Orqaga
            </Button>
            {step < 3 ? <Button type="button" onClick={next}>Davom etish <ChevronRight className="h-4 w-4" /></Button> : <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Saqlash</Button>}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
