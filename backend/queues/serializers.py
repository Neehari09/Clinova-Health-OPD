from rest_framework import serializers
from .models import Queue, Token
from django.contrib.auth.models import User
import re

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
    waiting_tokens = serializers.SerializerMethodField()
    next_token_preview = serializers.SerializerMethodField()

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
            'currently_serving',
            'waiting_tokens',
            'next_token_preview'
        ]

    def get_waiting_count(self, obj):
        return obj.tokens.filter(status='WAITING').count()

    def get_waiting_tokens(self, obj):
        qs = obj.tokens.filter(status='WAITING').order_by('position')[:3]
        return [{'id': t.id, 'patientName': t.patient_name, 'gender': t.gender, 'tokenNumber': t.token_number} for t in qs]

    def get_next_token_preview(self, obj):
        dept = (obj.department or '').lower()
        name_low = (obj.name or '').lower()
        if 'pediatric' in dept or 'pediatric' in name_low:
            prefix = 'PED'
            base_completed_max = 27
        elif 'diag' in dept or 'pathology' in name_low or 'lab' in name_low:
            prefix = 'LAB'
            base_completed_max = 26
        elif 'cardio' in dept or 'cardio' in name_low:
            prefix = 'CARD'
            base_completed_max = 26
        elif 'ortho' in dept or 'ortho' in name_low:
            prefix = 'ORT'
            base_completed_max = 26
        else:
            prefix = 'GP'
            base_completed_max = 26

        existing_nums = [base_completed_max]
        for t in obj.tokens.all():
            m = re.search(r'\d+', t.token_number or '')
            if m:
                existing_nums.append(int(m.group()))

        last_num = max(existing_nums)
        next_num = last_num + 1

        last_fmt = f"{last_num:02d}"
        next_fmt = f"{next_num:02d}"

        return {
            'prefix': prefix,
            'last_token': f"{prefix}{last_fmt}",
            'next_token': f"{prefix}{next_fmt}"
        }

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
