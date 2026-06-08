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


class AddGroupMembersSerializer(serializers.Serializer):
    members = serializers.ListField(
        child=serializers.CharField(max_length=150, trim_whitespace=True),
        required=False,
        allow_empty=False,
    )
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True, trim_whitespace=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate(self, attrs):
        members = attrs.get('members') or []
        full_name = attrs.get('full_name', '').strip()
        email = attrs.get('email', '').strip().lower()

        if not members and not full_name and not email:
            raise serializers.ValidationError('Kamida bitta a’zo ismi yoki email kiritilishi kerak.')

        if members:
            attrs['members'] = [' '.join(member.split()) for member in members if member.strip()]
            if not attrs['members']:
                raise serializers.ValidationError({'members': 'A’zo ismi bo‘sh bo‘lmasligi kerak.'})

        if full_name:
            attrs['full_name'] = ' '.join(full_name.split())
        if email:
            attrs['email'] = email

        return attrs

    def get_member_entries(self):
        members = self.validated_data.get('members') or []
        if members:
            return [{'full_name': member, 'email': ''} for member in members]

        full_name = self.validated_data.get('full_name') or self.validated_data.get('email')
        return [{
            'full_name': full_name,
            'email': self.validated_data.get('email', ''),
        }]
