import pytest

from apps.groups.models import Group, Membership


@pytest.mark.django_db
class TestGroupsApi:
    def test_create_group_adds_creator_as_admin(self, api_client, users):
        api_client.force_authenticate(user=users['ali'])

        response = api_client.post('/api/v1/groups/', {
            'name': 'Kvartira xarajatlari',
            'description': 'Ijara va kommunal to‘lovlar',
            'currency': 'UZS',
        }, format='json')

        assert response.status_code == 201
        assert response.data['success'] is True
        group = Group.objects.get(id=response.data['data']['id'])
        assert group.created_by == users['ali']
        assert Membership.objects.filter(group=group, user=users['ali'], role=Membership.ROLE_ADMIN).exists()

    def test_list_only_current_user_groups(self, api_client, users, group):
        other_group = Group.objects.create(name='Begona guruh', created_by=users['gani'])
        Membership.objects.create(group=other_group, user=users['gani'])
        api_client.force_authenticate(user=users['vali'])

        response = api_client.get('/api/v1/groups/')

        assert response.status_code == 200
        ids = {item['id'] for item in response.data['data']}
        assert str(group.id) in ids
        assert str(other_group.id) not in ids

    def test_join_group_by_invite_code(self, api_client, users, group):
        api_client.force_authenticate(user=users['gani'])
        Membership.objects.filter(group=group, user=users['gani']).delete()

        response = api_client.post(f'/api/v1/groups/join/{group.invite_code}/')

        assert response.status_code == 201
        assert Membership.objects.filter(group=group, user=users['gani']).exists()

    def test_admin_can_add_members_by_name(self, api_client, users, group):
        api_client.force_authenticate(user=users['ali'])

        response = api_client.post(f'/api/v1/groups/{group.id}/members/', {
            'members': ['Dilshod', 'Madina'],
        }, format='json')

        assert response.status_code == 201
        names = {item['user']['full_name'] for item in response.data['data']['members']}
        assert {'Dilshod', 'Madina'}.issubset(names)
        assert Membership.objects.filter(group=group, user__full_name='Dilshod').exists()
