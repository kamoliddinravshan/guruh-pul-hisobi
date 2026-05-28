import urllib.parse
import urllib.request
from decimal import Decimal
from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .auth import json_body, make_token, require_user
from .models import Expense, Group, Settlement, User
from .settlement import simplify_debts


def user_json(user):
    return {"id": user.id, "name": user.name, "email": user.email, "avatarUrl": user.avatar_url}


def group_json(group):
    total = sum(float(expense.amount) for expense in group.expenses.all())
    return {
        "id": str(group.id),
        "name": group.name,
        "description": group.description,
        "members": group.members,
        "totalExpenses": total,
        "createdAt": group.created_at.isoformat(),
    }


def expense_json(expense):
    return {
        "id": str(expense.id),
        "groupId": str(expense.group_id),
        "title": expense.title,
        "amount": float(expense.amount),
        "payer": expense.payer,
        "participants": expense.participants,
        "category": expense.category,
        "description": expense.description,
        "date": expense.created_at.isoformat(),
    }


def settlement_json(settlement):
    return {
        "id": str(settlement.id),
        "groupId": str(settlement.group_id),
        "from": settlement.from_member,
        "to": settlement.to_member,
        "amount": float(settlement.amount),
        "paidAt": settlement.paid_at.isoformat(),
    }


def auth_response(user):
    return JsonResponse({"token": make_token(user), "user": user_json(user)})


def health(_request):
    return JsonResponse({"ok": True, "service": "guruh-pul-hisobi-django", "database": "postgresql"})


@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)
    data = json_body(request)
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not name or not email or not password:
        return JsonResponse({"message": "Barcha maydonlar to'ldirilishi shart"}, status=400)
    if User.objects.filter(email=email).exists():
        return JsonResponse({"message": "Bu email avval ro'yxatdan o'tgan"}, status=409)
    return auth_response(User.create_password_user(name, email, password))


@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)
    data = json_body(request)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    user = User.objects.filter(email=email).first()
    if not user or not user.password_hash or not check_password(password, user.password_hash):
        return JsonResponse({"message": "Email yoki parol noto'g'ri"}, status=401)
    return auth_response(user)


@csrf_exempt
def google_login(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)
    if not settings.GOOGLE_CLIENT_ID or settings.GOOGLE_CLIENT_ID.startswith("your_"):
        return JsonResponse({"message": "GOOGLE_CLIENT_ID sozlanmagan"}, status=500)

    credential = json_body(request).get("credential")
    if not credential:
        return JsonResponse({"message": "Google token topilmadi"}, status=400)

    url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + urllib.parse.quote(credential)
    try:
        with urllib.request.urlopen(url, timeout=8) as response:
            import json

            profile = json.loads(response.read().decode("utf-8"))
    except Exception:
        return JsonResponse({"message": "Google token tekshirilmadi"}, status=401)

    if profile.get("aud") != settings.GOOGLE_CLIENT_ID or str(profile.get("email_verified")).lower() != "true":
        return JsonResponse({"message": "Google token noto'g'ri"}, status=401)

    google_id = profile.get("sub")
    email = (profile.get("email") or "").lower()
    user = User.objects.filter(google_id=google_id).first() or User.objects.filter(email=email).first()
    if user:
        user.google_id = google_id
        user.email = user.email or email
        user.avatar_url = profile.get("picture") or user.avatar_url
        user.save()
    else:
        user = User.objects.create(name=profile.get("name") or email, email=email, google_id=google_id, avatar_url=profile.get("picture"))
    return auth_response(user)


@csrf_exempt
@require_user
def groups(request):
    if request.method == "GET":
        own_groups = Group.objects.filter(created_by=request.api_user).prefetch_related("expenses")
        return JsonResponse([group_json(group) for group in own_groups], safe=False)
    if request.method == "POST":
        data = json_body(request)
        name = (data.get("name") or "").strip()
        if not name:
            return JsonResponse({"message": "Guruh nomi kiritilishi shart"}, status=400)
        group = Group.objects.create(
            name=name,
            description=(data.get("description") or "").strip(),
            members=data.get("members") or [],
            created_by=request.api_user,
        )
        return JsonResponse(group_json(group), status=201)
    return JsonResponse({"message": "Method not allowed"}, status=405)


@csrf_exempt
@require_user
def group_detail(request, group_id):
    group = Group.objects.filter(id=group_id, created_by=request.api_user).prefetch_related("expenses").first()
    if not group:
        return JsonResponse({"message": "Guruh topilmadi"}, status=404)
    return JsonResponse(group_json(group))


@csrf_exempt
@require_user
def group_expenses(request, group_id):
    group = Group.objects.filter(id=group_id, created_by=request.api_user).first()
    if not group:
        return JsonResponse({"message": "Guruh topilmadi"}, status=404)
    if request.method == "GET":
        return JsonResponse([expense_json(expense) for expense in group.expenses.order_by("-created_at")], safe=False)
    if request.method == "POST":
        data = json_body(request)
        if not data.get("title") or not data.get("amount"):
            return JsonResponse({"message": "Xarajat ma'lumotlari noto'g'ri"}, status=400)
        expense = Expense.objects.create(
            group=group,
            title=data["title"].strip(),
            amount=Decimal(str(data["amount"])),
            payer=data.get("payer") or "",
            participants=data.get("participants") or [],
            category=data.get("category") or "",
            description=data.get("description") or "",
        )
        return JsonResponse(expense_json(expense), status=201)
    return JsonResponse({"message": "Method not allowed"}, status=405)


@require_user
def group_settlements(request, group_id):
    group = Group.objects.filter(id=group_id, created_by=request.api_user).prefetch_related("expenses", "settlements").first()
    if not group:
        return JsonResponse({"message": "Guruh topilmadi"}, status=404)
    rows = simplify_debts(group.members, group.expenses.all(), group.settlements.all())
    return JsonResponse([{**row, "groupId": str(group.id)} for row in rows], safe=False)


@csrf_exempt
@require_user
def settlements(request):
    if request.method == "GET":
        rows = Settlement.objects.filter(group__created_by=request.api_user).order_by("-paid_at")
        return JsonResponse([settlement_json(row) for row in rows], safe=False)
    if request.method == "POST":
        data = json_body(request)
        group = Group.objects.filter(id=data.get("groupId"), created_by=request.api_user).first()
        if not group:
            return JsonResponse({"message": "Guruh topilmadi"}, status=404)
        settlement = Settlement.objects.create(
            group=group,
            from_member=data.get("from") or "",
            to_member=data.get("to") or "",
            amount=Decimal(str(data.get("amount") or 0)),
        )
        return JsonResponse(settlement_json(settlement), status=201)
    return JsonResponse({"message": "Method not allowed"}, status=405)


@require_user
def report_summary(request):
    expenses = Expense.objects.filter(group__created_by=request.api_user).select_related("group")
    by_category = {}
    by_group = {}
    top_payers = {}
    for expense in expenses:
        amount = float(expense.amount)
        by_category[expense.category] = by_category.get(expense.category, 0) + amount
        by_group[expense.group.name] = by_group.get(expense.group.name, 0) + amount
        top_payers[expense.payer] = top_payers.get(expense.payer, 0) + amount
    return JsonResponse({"byCategory": by_category, "byGroup": by_group, "topPayers": top_payers})
