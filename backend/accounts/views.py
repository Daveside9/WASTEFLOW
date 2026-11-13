from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import RegisterSerializer, UserSerializer, WasteFlowTokenSerializer


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ — returns access + refresh tokens plus user data."""
    serializer_class = WasteFlowTokenSerializer
    permission_classes = [permissions.AllowAny]


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'detail': 'Account created. You can now sign in.'},
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    """GET /api/auth/me/ — return the currently authenticated user's profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
