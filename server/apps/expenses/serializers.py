from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import CustomUser
from apps.accounts.serializers import UserSerializer
from apps.expenses.models import Expense, ExpenseSplit
from apps.groups.models import Membership


class ExpenseSplitSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField()

    class Meta:
        model = ExpenseSplit
        fields = ['user_id', 'share']


class ExpenseSerializer(serializers.ModelSerializer):
    splits = ExpenseSplitSerializer(many=True)
    paid_by = UserSerializer(read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'description', 'amount', 'category', 'split_type', 'date', 'paid_by', 'splits', 'created_at', 'updated_at']
        read_only_fields = ['id', 'paid_by', 'created_at', 'updated_at']

    def validate(self, data):
        group = self.context.get('group') or getattr(self.instance, 'group', None)
        splits = data.get('splits', [])
        amount = data.get('amount', getattr(self.instance, 'amount', None))
        split_type = data.get('split_type', getattr(self.instance, 'split_type', 'equal'))

        if not splits:
            raise serializers.ValidationError({'splits': 'Kamida bitta ishtirokchi tanlang.'})

        member_ids = set(Membership.objects.filter(group=group).values_list('user_id', flat=True))
        split_user_ids = {split['user_id'] for split in splits}
        if not split_user_ids.issubset(member_ids):
            raise serializers.ValidationError({'splits': 'Faqat guruh a’zolari xarajatga qo‘shilishi mumkin.'})

        total_shares = sum((split['share'] for split in splits), Decimal('0'))
        if split_type == 'exact' and abs(total_shares - amount) > Decimal('0.01'):
            raise serializers.ValidationError({'splits': "Ulushlar yig'indisi umumiy summaga teng bo'lishi kerak."})
        if split_type == 'percent' and abs(total_shares - Decimal('100')) > Decimal('0.01'):
            raise serializers.ValidationError({'splits': "Foizlar yig'indisi 100% bo'lishi kerak."})
        return data

    @transaction.atomic
    def create(self, validated_data):
        splits_data = validated_data.pop('splits')
        expense = Expense.objects.create(**validated_data)
        splits = self._normalize_splits(expense, splits_data)
        ExpenseSplit.objects.bulk_create([ExpenseSplit(expense=expense, user_id=item['user_id'], share=item['share']) for item in splits])
        return expense

    @transaction.atomic
    def update(self, instance, validated_data):
        splits_data = validated_data.pop('splits', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if splits_data is not None:
            instance.splits.all().delete()
            splits = self._normalize_splits(instance, splits_data)
            ExpenseSplit.objects.bulk_create([ExpenseSplit(expense=instance, user_id=item['user_id'], share=item['share']) for item in splits])
        return instance

    def _normalize_splits(self, expense, splits_data):
        if expense.split_type == 'equal':
            share = (expense.amount / Decimal(len(splits_data))).quantize(Decimal('0.01'))
            return [{'user_id': split['user_id'], 'share': share} for split in splits_data]
        if expense.split_type == 'percent':
            return [
                {'user_id': split['user_id'], 'share': (expense.amount * split['share'] / Decimal('100')).quantize(Decimal('0.01'))}
                for split in splits_data
            ]
        return splits_data


class BalanceSerializer(serializers.Serializer):
    user = UserSerializer()
    balance = serializers.DecimalField(max_digits=15, decimal_places=2)
