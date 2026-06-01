from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.groups.models import Membership
from apps.settlements.models import Settlement


class SettlementSerializer(serializers.ModelSerializer):
    paid_by = UserSerializer(read_only=True)
    paid_to = UserSerializer(read_only=True)
    paid_to_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Settlement
        fields = ['id', 'paid_by', 'paid_to', 'paid_to_id', 'amount', 'note', 'settled_at']
        read_only_fields = ['id', 'paid_by', 'paid_to', 'settled_at']

    def validate_paid_to_id(self, value):
        group = self.context['group']
        if not Membership.objects.filter(group=group, user_id=value).exists():
            raise serializers.ValidationError('To‘lov qabul qiluvchi guruh a’zosi bo‘lishi kerak.')
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Summa musbat bo‘lishi kerak.')
        return value
