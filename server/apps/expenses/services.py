from collections import defaultdict
from decimal import Decimal
from typing import NamedTuple


class Transaction(NamedTuple):
    from_user: str
    to_user: str
    amount: Decimal


class DebtSimplificationService:
    """
    Greedy Minimum Cash Flow algorithm.

    Reduces debts to a minimal practical transaction list.
    Time complexity is O(n log n) for n group members per matching iteration.
    """

    @staticmethod
    def compute_net_balances(group_id: str) -> dict[str, Decimal]:
        """Compute net balance for each group member, including settled payments."""
        from apps.expenses.models import Expense
        from apps.settlements.models import Settlement

        balances: dict[str, Decimal] = defaultdict(Decimal)
        expenses = Expense.objects.filter(group_id=group_id).select_related('paid_by').prefetch_related('splits')

        for expense in expenses:
            balances[str(expense.paid_by_id)] += expense.amount
            for split in expense.splits.all():
                balances[str(split.user_id)] -= split.share

        settlements = Settlement.objects.filter(group_id=group_id)
        for settlement in settlements:
            balances[str(settlement.paid_by_id)] += settlement.amount
            balances[str(settlement.paid_to_id)] -= settlement.amount

        return {user_id: balance for user_id, balance in balances.items() if abs(balance) > Decimal('0.01')}

    @classmethod
    def simplify(cls, group_id: str) -> list[Transaction]:
        """Return minimal transactions needed to settle a group."""
        balances = cls.compute_net_balances(group_id)
        creditors = sorted([(user, balance) for user, balance in balances.items() if balance > 0], key=lambda item: -item[1])
        debtors = sorted([(user, balance) for user, balance in balances.items() if balance < 0], key=lambda item: item[1])
        transactions: list[Transaction] = []

        while creditors and debtors:
            creditors.sort(key=lambda item: -item[1])
            debtors.sort(key=lambda item: item[1])
            creditor_user, credit = creditors[0]
            debtor_user, debt = debtors[0]
            payment = min(credit, -debt)

            transactions.append(Transaction(from_user=debtor_user, to_user=creditor_user, amount=payment.quantize(Decimal('0.01'))))

            new_credit = credit - payment
            new_debt = debt + payment
            creditors[0] = (creditor_user, new_credit)
            debtors[0] = (debtor_user, new_debt)

            if new_credit < Decimal('0.01'):
                creditors.pop(0)
            if new_debt > Decimal('-0.01'):
                debtors.pop(0)

        return transactions
