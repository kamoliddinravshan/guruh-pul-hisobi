import secrets
import string


def format_currency(amount) -> str:
    """Format an amount as Uzbek so'm."""
    return f"{round(amount):,}".replace(',', ' ') + " so'm"


def generate_invite_code(length: int = 8) -> str:
    """Generate a human-readable invite code."""
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))
