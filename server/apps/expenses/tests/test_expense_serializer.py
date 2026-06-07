from decimal import Decimal

import pytest

from apps.expenses.models import ExpenseSplit
from apps.expenses.serializers import ExpenseSerializer


@pytest.mark.django_db
class TestExpenseSerializer:
    def test_equal_split_creates_equal_shares(self, group, users):
        serializer = ExpenseSerializer(data={
            'description': 'Kechki ovqat',
            'amount': '300000.00',
            'category': 'food',
            'split_type': 'equal',
            'date': '2026-06-04',
            'splits': [
                {'user_id': str(users['ali'].id), 'share': '0.00'},
                {'user_id': str(users['vali'].id), 'share': '0.00'},
                {'user_id': str(users['gani'].id), 'share': '0.00'},
            ],
        }, context={'group': group})

        assert serializer.is_valid(), serializer.errors
        expense = serializer.save(group=group, paid_by=users['ali'])

        shares = list(ExpenseSplit.objects.filter(expense=expense).values_list('share', flat=True))
        assert shares == [Decimal('100000.00'), Decimal('100000.00'), Decimal('100000.00')]

    def test_exact_split_rejects_invalid_total(self, group, users):
        serializer = ExpenseSerializer(data={
            'description': 'Taxi',
            'amount': '100000.00',
            'category': 'transport',
            'split_type': 'exact',
            'date': '2026-06-04',
            'splits': [
                {'user_id': str(users['ali'].id), 'share': '40000.00'},
                {'user_id': str(users['vali'].id), 'share': '40000.00'},
            ],
        }, context={'group': group})

        assert serializer.is_valid() is False
        assert 'splits' in serializer.errors
