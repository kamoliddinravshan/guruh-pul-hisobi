from rest_framework.response import Response


def api_response(data=None, error=None, status=200):
    """Wrap successful and failed responses in one API shape."""
    return Response({
        'success': error is None,
        'data': data if error is None else None,
        'error': error,
    }, status=status)
