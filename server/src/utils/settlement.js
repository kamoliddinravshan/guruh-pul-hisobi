export function simplifyDebts(members, expenses) {
  const balances = Object.fromEntries(members.map((member) => [String(member._id || member), 0]));

  for (const expense of expenses) {
    const payer = String(expense.payer);
    const participants = expense.participants.map(String).filter((id) => balances[id] !== undefined);
    if (!participants.length || balances[payer] === undefined) continue;
    const share = expense.amount / participants.length;
    balances[payer] += expense.amount;
    participants.forEach((id) => (balances[id] -= share));
  }

  const creditors = Object.entries(balances)
    .filter(([, amount]) => amount > 0.01)
    .map(([id, amount]) => ({ id, amount }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = Object.entries(balances)
    .filter(([, amount]) => amount < -0.01)
    .map(([id, amount]) => ({ id, amount: Math.abs(amount) }))
    .sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    settlements.push({ from: debtors[i].id, to: creditors[j].id, amount: Math.round(amount) });
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount <= 0.01) i += 1;
    if (creditors[j].amount <= 0.01) j += 1;
  }
  return settlements;
}
