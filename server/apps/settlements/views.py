from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets

from apps.groups.models import Group
from apps.groups.permissions import IsGroupMember
from apps.settlements.models import Settlement
from apps.settlements.serializers import SettlementSerializer
from core.responses import api_response


class SettlementViewSet(viewsets.ModelViewSet):
    serializer_class = SettlementSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupMember]

    def get_group(self):
        return get_object_or_404(Group, pk=self.kwargs['group_pk'])

    def get_queryset(self):
        return Settlement.objects.filter(group_id=self.kwargs['group_pk']).select_related('paid_by', 'paid_to').order_by('-settled_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['group'] = self.get_group()
        return context

    def list(self, request, *args, **kwargs):
        group = self.get_group()
        self.check_object_permissions(request, group)
        return api_response(self.get_serializer(self.get_queryset(), many=True).data)

    def create(self, request, *args, **kwargs):
        group = self.get_group()
        self.check_object_permissions(request, group)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        settlement = serializer.save(group=group, paid_by=request.user, paid_to_id=serializer.validated_data['paid_to_id'])
        return api_response(self.get_serializer(settlement).data, status=status.HTTP_201_CREATED)
