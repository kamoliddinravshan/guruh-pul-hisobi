from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.groups.models import Group, Membership


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ['user', 'role', 'joined_at']


class GroupSerializer(serializers.ModelSerializer):
    members = MembershipSerializer(source='memberships', many=True, read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'created_by', 'currency', 'invite_code', 'members', 'created_at']
        read_only_fields = ['id', 'created_by', 'invite_code', 'members', 'created_at']

    def validate_currency(self, value):
        if value != 'UZS':
            raise serializers.ValidationError('Hozircha faqat UZS qo‘llab-quvvatlanadi.')
        return value


class JoinGroupSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=8)
