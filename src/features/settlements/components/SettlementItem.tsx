import { useState } from 'react';
import { ArrowRight, Check, WalletCards } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/shared/utils/formatCurrency';

interface Person {
  id: string;
  name: string;
  avatar?: string;
}

interface SettlementItemProps {
  from: Person;
  to: Person;
  amount: number;
  onSettle: () => Promise<void> | void;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Renders one settlement row with payment app deep links and settle animation.
 */
export function SettlementItem({ from, to, amount, onSettle }: SettlementItemProps) {
  const [settled, setSettled] = useState(false);
  const paymentLabel = `${to.name} uchun ${formatCurrency(amount)} to'lov`;
  const paymeUrl = `https://payme.uz`;
  const clickUrl = `https://my.click.uz`;

  const handleSettle = async () => {
    await onSettle();
    setSettled(true);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 sm:flex-row sm:items-center',
        settled && 'translate-y-1 opacity-60'
      )}
    >
      <div className={cn('flex min-w-0 flex-1 items-center gap-3', settled && 'line-through decoration-2')}>
        <Avatar className="h-9 w-9">
          <AvatarImage src={from.avatar} alt={from.name} />
          <AvatarFallback>{initials(from.name)}</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium text-slate-950">{from.name}</span>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <Avatar className="h-9 w-9">
          <AvatarImage src={to.avatar} alt={to.name} />
          <AvatarFallback>{initials(to.name)}</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium text-slate-950">{to.name}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        <p className="text-base font-semibold text-slate-950">{formatCurrency(amount)}</p>
        <Button asChild variant="outline" size="sm" className="border-slate-300 bg-white">
          <a href={clickUrl} aria-label={`Click orqali ${paymentLabel}`} target="_blank" rel="noreferrer">
            <WalletCards className="h-4 w-4" />
            Click
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="border-slate-300 bg-white">
          <a href={paymeUrl} aria-label={`Payme orqali ${paymentLabel}`} target="_blank" rel="noreferrer">
            Payme
          </a>
        </Button>
        <Button onClick={handleSettle} disabled={settled} size="sm" className="bg-green-600 text-white hover:bg-green-700">
          {settled ? <Check className="h-4 w-4" /> : null}
          {settled ? 'To\'landi' : 'To\'lash'}
        </Button>
      </div>
    </div>
  );
}
