def simplify_debts(members, expenses, settlements=None):
    balances = {member: 0.0 for member in members}

    for expense in expenses:
        participants = [member for member in expense.participants if member in balances]
        if not participants or expense.payer not in balances:
            continue
        amount = float(expense.amount)
        share = amount / len(participants)
        balances[expense.payer] += amount
        for member in participants:
            balances[member] -= share

    for settlement in settlements or []:
        if settlement.from_member in balances and settlement.to_member in balances:
            amount = float(settlement.amount)
            balances[settlement.from_member] += amount
            balances[settlement.to_member] -= amount

    creditors = sorted(
        [{"member": member, "amount": amount} for member, amount in balances.items() if amount > 0.01],
        key=lambda item: item["amount"],
        reverse=True,
    )
    debtors = sorted(
        [{"member": member, "amount": abs(amount)} for member, amount in balances.items() if amount < -0.01],
        key=lambda item: item["amount"],
        reverse=True,
    )

    result = []
    debtor_index = 0
    creditor_index = 0

    while debtor_index < len(debtors) and creditor_index < len(creditors):
        debtor = debtors[debtor_index]
        creditor = creditors[creditor_index]
        amount = min(debtor["amount"], creditor["amount"])

        if amount > 0.01:
            result.append({"from": debtor["member"], "to": creditor["member"], "amount": round(amount)})

        debtor["amount"] -= amount
        creditor["amount"] -= amount
        if debtor["amount"] <= 0.01:
            debtor_index += 1
        if creditor["amount"] <= 0.01:
            creditor_index += 1

    return result
