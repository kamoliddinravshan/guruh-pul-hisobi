import pytest


@pytest.mark.django_db
class TestAuthApi:
    def test_register_returns_user_and_tokens(self, api_client):
        response = api_client.post('/api/v1/auth/register/', {
            'full_name': 'Kamoliddin Ravshanov',
            'email': 'kamoliddin@example.com',
            'password': '1234',
            'password2': '1234',
        }, format='json')

        assert response.status_code == 201
        assert response.data['success'] is True
        assert response.data['data']['user']['email'] == 'kamoliddin@example.com'
        assert response.data['data']['access']
        assert response.data['data']['refresh']

    def test_me_returns_current_user(self, api_client, users):
        api_client.force_authenticate(user=users['ali'])

        response = api_client.get('/api/v1/auth/me/')

        assert response.status_code == 200
        assert response.data['success'] is True
        assert response.data['data']['email'] == users['ali'].email

    def test_logout_requires_refresh_token(self, api_client, users):
        api_client.force_authenticate(user=users['ali'])

        response = api_client.post('/api/v1/auth/logout/', {}, format='json')

        assert response.status_code == 400
        assert response.data['success'] is False
        assert response.data['error'] == 'Refresh token kiritilishi kerak.'
