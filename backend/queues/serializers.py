from rest_framework import serializers
from .models import Queue, Token
from django.contrib.auth.models import User

# User Serializer for Login & Auth (Requirement 1)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


# Token Serializer (Requirements 3, 4, 5, 6, 7)
class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = [
            'id',
            'queue',
            'token_number',
            'patient_name',
            'age',
            'gender',
            'notes',
            'position',
            'status',
            'created_at',
            'served_at',
            'completed_at',
            'cancelled_at'
        ]
        read_only_fields = ['id', 'token_number', 'created_at', 'served_at', 'completed_at', 'cancelled_at']


# Queue Serializer (Requirements 1 & 2)
class QueueSerializer(serializers.ModelSerializer):
    # Live counts computed for the Clinics Hub cards
    waiting_count = serializers.SerializerMethodField()
    currently_serving = serializers.SerializerMethodField()

    class Meta:
        model = Queue
        fields = [
            'id',
            'name',
            'doctor_name',
            'department',
            'room',
            'is_active',
            'created_at',
            'waiting_count',
            'currently_serving'
        ]

    def get_waiting_count(self, obj):
        return obj.tokens.filter(status='WAITING').count()

    def get_currently_serving(self, obj):
        token = obj.tokens.filter(status='IN_SERVICE').first()
        if token:
            return {
                'id': token.id,
                'token_number': token.token_number,
                'patient_name': token.patient_name,
                'age': token.age,
                'gender': token.gender,
            }
        return None