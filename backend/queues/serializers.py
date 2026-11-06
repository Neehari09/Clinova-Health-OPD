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
        from django.utils import timezone
        now = timezone.localtime(timezone.now())
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        date_prefix = now.strftime('%y-%m-%d')  # e.g. "26-11-06"

        dept = (obj.department or '').lower()
        name_low = (obj.name or '').lower()
        if 'pediatric' in dept or 'pediatric' in name_low:
            prefix = 'PED'
        elif 'diag' in dept or 'pathology' in name_low or 'lab' in name_low:
            prefix = 'LAB'
        elif 'cardio' in dept or 'cardio' in name_low:
            prefix = 'CARD'
        elif 'ortho' in dept or 'ortho' in name_low:
            prefix = 'ORT'
        else:
            prefix = 'GP'

        # Look up tokens created TODAY for this doctor queue
        today_tokens = obj.tokens.filter(created_at__gte=start_of_today)
        seq_nums = []
        for t in today_tokens:
            num_match = re.search(r'(\d+)$', t.token_number or '')
            if num_match:
                seq_nums.append(int(num_match.group(1)))

        if seq_nums:
            last_num = max(seq_nums)
            next_num = last_num + 1
            last_token = f"{prefix}-{date_prefix}-{last_num:03d}"
        else:
            last_token = None
            next_num = 1

        next_token = f"{prefix}-{date_prefix}-{next_num:03d}"

        return {
            'prefix': prefix,
            'last_token': last_token or f"None (0 for today)",
            'next_token': next_token
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
