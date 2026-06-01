from rest_framework.permissions import BasePermission


class IsObjectOwner(BasePermission):
    """Allow access only when an object has a matching created_by field."""

    def has_object_permission(self, request, view, obj):
        return getattr(obj, 'created_by_id', None) == request.user.id
