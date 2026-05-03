from rest_framework.response import Response
from rest_framework import status

def success_response(data=None, stat=status.HTTP_200_OK):
    return Response({
        "success": True,
        "data": data or {}
    }, status=stat)

def error_response(code, message, details=None, stat=status.HTTP_400_BAD_REQUEST):
    return Response({
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or {}
        }
    }, status=stat)
