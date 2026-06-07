from decimal import Decimal

import pytest

from apps.expenses.models import Expense, ExpenseSplit
from apps.settlements.models import Settlement


@pytest.mark.django_db
class TestSettlementsApi:
    def test_suggested_settlements_and_settle_history(self, api_client, users, group):
        expense = Expense.objects.create(
            group=group,
            paid_by=users['ali'],
            amount=Decimal('300000.00'),
            description='Ovqat',
        )
        for user in users.values():
            ExpenseSplit.objects.create(expense=expense, user=user, share=Decimal('100000.00'))

        api_client.force_authenticate(user=users['vali'])
        suggestions = api_client.get(f'/api/v1/groups/{group.id}/settlements/')

        assert suggestions.status_code == 200
        assert len(suggestions.data['data']['transactions']) == 2

        settle_response = api_client.post(f'/api/v1/groups/{group.id}/settle/', {
            'paid_to_id': str(users['ali'].id),
            'amount': '100000.00',
            'note': 'Naqd to‘landi',
        }, format='json')

        assert settle_response.status_code == 201
        assert Settlement.objects.filter(group=group, paid_by=users['vali'], paid_to=users['ali']).exists()

        history = api_client.get(f'/api/v1/groups/{group.id}/history/')

        assert history.status_code == 200
        assert history.data['data'][0]['note'] == 'Naqd to‘landi'
