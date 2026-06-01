from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action

from apps.groups.models import Group, Membership
from apps.groups.permissions import IsGroupMember, IsGroupOwner
from apps.groups.serializers import GroupSerializer
from core.responses import api_response


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Group.objects.filter(memberships__user=self.request.user).select_related('created_by').prefetch_related('memberships__user')

    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated(), IsGroupMember()]
        if self.action == 'destroy':
            return [permissions.IsAuthenticated(), IsGroupOwner()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            group = serializer.save(created_by=request.user)
            Membership.objects.create(user=request.user, group=group, role=Membership.ROLE_ADMIN)
        return api_response(self.get_serializer(group).data, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return api_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        group = self.get_object()
        self.check_object_permissions(request, group)
        return api_response(self.get_serializer(group).data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        group = self.get_object()
        self.check_object_permissions(request, group)
        serializer = self.get_serializer(group, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        group = self.get_object()
        self.check_object_permissions(request, group)
        group.delete()
        return api_response({'deleted': True})

    @action(detail=True, methods=['post'], url_path='invite')
    def invite(self, request, pk=None):
        group = self.get_object()
        self.check_object_permissions(request, group)
        return api_response({'invite_code': group.invite_code, 'invite_url': f'/groups/join/{group.invite_code}/'})

    @action(detail=False, methods=['post'], url_path='join/(?P<code>[^/.]+)')
    def join(self, request, code=None):
        group = get_object_or_404(Group, invite_code=code)
        Membership.objects.get_or_create(user=request.user, group=group)
        return api_response(self.get_serializer(group).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='leave')
    def leave(self, request, pk=None):
        group = self.get_object()
        if group.created_by_id == request.user.id:
            return api_response(error='Guruh egasi guruhni tark eta olmaydi.', status=status.HTTP_400_BAD_REQUEST)
        Membership.objects.filter(group=group, user=request.user).delete()
        return api_response({'left': True})
