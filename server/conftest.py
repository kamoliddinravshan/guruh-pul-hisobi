import pytest
from rest_framework.test import APIClient

from apps.groups.models import Group, Membership


@pytest.fixture
def api_client():
    """DRF test client."""
    return APIClient()


@pytest.fixture
def users(django_user_model):
    """Reusable users for integration tests."""
    return {
        'ali': django_user_model.objects.create_user(
            email='ali@example.com',
            full_name='Ali Valiyev',
            password='Testpass123',
        ),
        'vali': django_user_model.objects.create_user(
            email='vali@example.com',
            full_name='Vali Aliyev',
            password='Testpass123',
        ),
        'gani': django_user_model.objects.create_user(
            email='gani@example.com',
            full_name='Gani Karimov',
            password='Testpass123',
        ),
    }


@pytest.fixture
def group(users):
    """A group with three members."""
    item = Group.objects.create(name='Safar xarajatlari', created_by=users['ali'])
    Membership.objects.create(group=item, user=users['ali'], role=Membership.ROLE_ADMIN)
    Membership.objects.create(group=item, user=users['vali'])
    Membership.objects.create(group=item, user=users['gani'])
    return item
