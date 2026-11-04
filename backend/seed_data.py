import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediqueue_backend.settings')
django.setup()

from queues.models import Queue, Token
from django.utils import timezone
from datetime import timedelta

def seed():
    # Clear existing
    Queue.objects.all().delete()
    Token.objects.all().delete()

    # Create 3 Doctor Queues (Requirements 1 & 2)
    q1 = Queue.objects.create(
        name="Dr. Sharma - General Medicine (Room 101)",
        doctor_name="Dr. Sharma",
        department="General Medicine",
        room="Room 101",
        is_active=True
    )

    q2 = Queue.objects.create(
        name="Dr. Anita Roy - Pediatrics (Room 104)",
        doctor_name="Dr. Anita Roy",
        department="Pediatrics",
        room="Room 104",
        is_active=True
    )

    q3 = Queue.objects.create(
        name="Pathology & Blood Sample Collection",
        doctor_name="Lab Tech Ajay",
        department="Diagnostics",
        room="Lab 1",
        is_active=True
    )

    # Add sample patients into Dr. Sharma's queue
    Token.objects.create(
        queue=q1,
        token_number="#MED-101",
        patient_name="Rahul Verma",
        age=28,
        gender="M",
        status="IN_SERVICE",
        position=0,
        served_at=timezone.now() - timedelta(minutes=6)
    )

    Token.objects.create(
        queue=q1,
        token_number="#MED-102",
        patient_name="Anita Roy",
        age=32,
        gender="F",
        notes="Headache & Mild Fever",
        status="WAITING",
        position=1
    )

    Token.objects.create(
        queue=q1,
        token_number="#MED-103",
        patient_name="Sunita Devi",
        age=74,
        gender="F",
        notes="Senior Citizen (High BP / Dizziness)",
        status="WAITING",
        position=2
    )

    Token.objects.create(
        queue=q1,
        token_number="#MED-104",
        patient_name="David Miller",
        age=45,
        gender="M",
        notes="Stomach Pain",
        status="WAITING",
        position=3
    )

    print("✅ Successfully seeded MediQueue database with initial doctor queues and patients!")

if __name__ == '__main__':
    seed()