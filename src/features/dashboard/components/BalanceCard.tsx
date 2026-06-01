import { useEffect, useState } from 'react';
import { CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/shared/utils/formatCurrency';

interface BalanceCardProps {
  balance: number;
  className?: string;
}

/**
 * Shows the current user balance with a one-second count-up animation.
 */
export function BalanceCard({ balance, className }: BalanceCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const isPositive = balance > 0;
  const isNegative = balance < 0;
  const title = isPositive ? 'Sizga qarzdorlar bor' : isNegative ? 'Siz qarzdorsiz' : 'Balansingiz toza';
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : CheckCircle2;

  useEffect(() => {
    const duration = 1000;
    const startedAt = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      setDisplayValue(Math.round(balance * progress));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [balance]);

  return (
    <section className={cn('overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200', className)}>
      <div
        className={cn(
          'flex items-center justify-between gap-4 p-5 text-white',
          isPositive && 'bg-gradient-to-r from-green-600 to-emerald-500',
          isNegative && 'bg-gradient-to-r from-red-600 to-rose-500',
          !isPositive && !isNegative && 'bg-gradient-to-r from-slate-600 to-slate-500'
        )}
      >
        <div>
          <p className="text-sm font-medium text-white/85">Joriy balans</p>
          <h2 className="mt-1 text-xl font-bold tracking-normal">{title}</h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>

      <div className="p-6">
        <p className={cn('text-3xl font-bold tracking-normal', isPositive && 'text-green-700', isNegative && 'text-red-700')}>
          {formatCurrency(Math.abs(displayValue))}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {isPositive && 'Bu summa sizga qaytarilishi kerak.'}
          {isNegative && 'Bu summa bo‘yicha to‘lov qilish kerak.'}
          {!isPositive && !isNegative && 'Barcha xarajatlar teng taqsimlangan.'}
        </p>
      </div>
    </section>
  );
}
