import pytest


@pytest.mark.django_db
class TestExpensesApi:
    def test_create_expense_and_get_balances(self, api_client, users, group):
        api_client.force_authenticate(user=users['ali'])

        create_response = api_client.post(f'/api/v1/groups/{group.id}/expenses/', {
            'description': 'Mehmonxona',
            'amount': '300000.00',
            'category': 'housing',
            'split_type': 'equal',
            'date': '2026-06-04',
            'splits': [
                {'user_id': str(users['ali'].id), 'share': '0.00'},
                {'user_id': str(users['vali'].id), 'share': '0.00'},
                {'user_id': str(users['gani'].id), 'share': '0.00'},
            ],
        }, format='json')

        assert create_response.status_code == 201
        assert create_response.data['success'] is True

        balance_response = api_client.get(f'/api/v1/groups/{group.id}/balances/')

        assert balance_response.status_code == 200
        balances = {
            item['user']['email']: item['balance']
            for item in balance_response.data['data']['balances']
        }
        assert balances['ali@example.com'] == '200000.00'
        assert balances['vali@example.com'] == '-100000.00'
        assert balances['gani@example.com'] == '-100000.00'

    def test_non_member_cannot_list_group_expenses(self, api_client, django_user_model, group):
        outsider = django_user_model.objects.create_user(
            email='outsider@example.com',
            full_name='Outsider',
            password='Testpass123',
        )
        api_client.force_authenticate(user=outsider)

        response = api_client.get(f'/api/v1/groups/{group.id}/expenses/')

        assert response.status_code == 403
