from rest_framework import serializers

from apps.accounts.models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    """Public profile serializer."""

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'avatar', 'phone', 'created_at']
        read_only_fields = ['id', 'email', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=4,
        error_messages={
            'min_length': 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak.',
            'blank': 'Parol kiritilishi kerak.',
            'required': 'Parol kiritilishi kerak.',
        },
    )
    password2 = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        error_messages={
            'invalid': 'Email manzil noto\'g\'ri kiritilgan.',
            'blank': 'Email kiritilishi kerak.',
            'required': 'Email kiritilishi kerak.',
        },
    )
    full_name = serializers.CharField(
        min_length=2,
        error_messages={
            'min_length': 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak.',
            'blank': 'Ism kiritilishi kerak.',
            'required': 'Ism kiritilishi kerak.',
        },
    )

    class Meta:
        model = CustomUser
        fields = ['id', 'full_name', 'email', 'password', 'password2']
        read_only_fields = ['id']

    def validate(self, attrs):
        email = attrs['email'].strip().lower()
        attrs['email'] = email
        attrs['full_name'] = ' '.join(attrs['full_name'].strip().split())

        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'Bu email bilan hisob allaqachon mavjud.'})

        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password2': 'Parollar bir xil emas.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        return CustomUser.objects.create_user(password=password, **validated_data)
