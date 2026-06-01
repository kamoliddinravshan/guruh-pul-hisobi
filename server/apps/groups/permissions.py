from rest_framework.permissions import BasePermission

from apps.groups.models import Group, Membership


class IsGroupMember(BasePermission):
    """Allow access only to users that belong to the group."""

    def has_object_permission(self, request, view, obj):
        group = obj if isinstance(obj, Group) else getattr(obj, 'group', None)
        return bool(group and Membership.objects.filter(group=group, user=request.user).exists())

    def has_permission(self, request, view):
        group_pk = view.kwargs.get('group_pk')
        if not group_pk:
            return request.user and request.user.is_authenticated
        return Membership.objects.filter(group_id=group_pk, user=request.user).exists()


class IsGroupOwner(BasePermission):
    """Allow access only to the group creator."""

    def has_object_permission(self, request, view, obj):
        group = obj if isinstance(obj, Group) else getattr(obj, 'group', None)
        return bool(group and group.created_by_id == request.user.id)


class IsGroupAdmin(BasePermission):
    """Allow access to admins inside a group."""

    def has_object_permission(self, request, view, obj):
        group = obj if isinstance(obj, Group) else getattr(obj, 'group', None)
        return bool(group and Membership.objects.filter(group=group, user=request.user, role=Membership.ROLE_ADMIN).exists())
