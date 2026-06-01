from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """Return API errors in a consistent envelope."""
    response = exception_handler(exc, context)
    if response is not None:
        response.data = {
            'success': False,
            'data': None,
            'error': response.data,
        }
    return response
