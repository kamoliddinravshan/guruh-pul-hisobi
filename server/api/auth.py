import json
from django.core import signing
from django.http import JsonResponse
from .models import User

TOKEN_MAX_AGE = 60 * 60 * 24 * 7


def make_token(user):
    return signing.dumps({"id": user.id, "email": user.email}, salt="api-auth")


def get_user_from_request(request):
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    token = header[7:]
    try:
        payload = signing.loads(token, salt="api-auth", max_age=TOKEN_MAX_AGE)
    except signing.BadSignature:
        return None
    return User.objects.filter(id=payload.get("id")).first()


def require_user(view):
    def wrapped(request, *args, **kwargs):
        user = get_user_from_request(request)
        if not user:
            return JsonResponse({"message": "Avtorizatsiya tokeni topilmadi yoki noto'g'ri"}, status=401)
        request.api_user = user
        return view(request, *args, **kwargs)

    return wrapped


def json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return {}
