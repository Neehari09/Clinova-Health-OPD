import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediqueue_backend.settings')
django.setup()

from queues.models import Queue, Token

def seed():
    Token.objects.all().delete()
    Queue.objects.all().delete()

    q1 = Queue.objects.create(
        name="Dr. Ashwin - Orthopedics (Room 101)",
        doctor_name="Dr. Ashwin",
        department="Orthopedics",
        room="Room 101",
        is_active=True
    )

    q2 = Queue.objects.create(
        name="Dr. Rajesh Verma - Cardiology (Room 205)",
        doctor_name="Dr. Rajesh Verma",
        department="Cardiology",
        room="Room 205",
        is_active=True
    )

    q3 = Queue.objects.create(
        name="Dr. Srikanth - General Physician (Room 201)",
        doctor_name="Dr. Srikanth",
        department="General Physician",
        room="Room 201",
        is_active=True
    )

    q4 = Queue.objects.create(
        name="Dr. Anita - Pediatrics (Room 104)",
        doctor_name="Dr. Anita",
        department="Pediatrics",
        room="Room 104",
        is_active=True
    )

    q5 = Queue.objects.create(
        name="Dr. Ajay Sharma - Pathology & Lab (Lab 1)",
        doctor_name="Dr. Ajay Sharma",
        department="Diagnostics",
        room="Lab 1",
        is_active=True
    )

    print("Successfully seeded all 5 Doctor queues with Dr. Ajay Sharma for Lab!")

if __name__ == '__main__':
    seed()
