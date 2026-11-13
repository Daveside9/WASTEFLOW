from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    avatar_initials = serializers.ReadOnlyField()

    class Meta:
        model  = User
        fields = [
            'id', 'email', 'full_name', 'role', 'region',
            'approved', 'avatar_initials',
            'is_company', 'company_name', 'registration_number', 'processing_capacity',
        ]
        read_only_fields = ['id', 'approved', 'avatar_initials']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = User
        fields = [
            'email', 'password', 'full_name', 'role', 'region',
            'is_company', 'company_name', 'registration_number', 'processing_capacity',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Auto-approve sellers/weighers; buyers need review
        validated_data['approved'] = validated_data.get('role') != 'buyer'
        user = User.objects.create_user(password=password, **validated_data)
        return user


class WasteFlowTokenSerializer(TokenObtainPairSerializer):
    """Adds user data to the JWT response so the frontend can read it immediately."""
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
