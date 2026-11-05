from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Queue(models.Model):
    """
    Requirements 1 & 2: Queue Manager creates Queues. Each Queue has a Name.
    """
    manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name='queues', null=True, blank=True)
    name = models.CharField(max_length=150)  # e.g. "Dr. Sharma - General Medicine (Room 101)"
    doctor_name = models.CharField(max_length=100, default='Dr. Sharma')
    department = models.CharField(max_length=100, default='General Medicine')
    room = models.CharField(max_length=50, default='Room 101')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Doctors'

    def __str__(self):
        return self.name


class Token(models.Model):
    """
    Requirements 3 to 8: Token lifecycle, ordering, and timestamps for analytics.
    """
    STATUS_CHOICES = [
        ('WAITING', 'Waiting'),
        ('IN_SERVICE', 'In Consultation'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    queue = models.ForeignKey(Queue, on_delete=models.CASCADE, related_name='tokens')
    token_number = models.CharField(max_length=20)  # e.g. "#MED-101"
    patient_name = models.CharField(max_length=120)  # Person's name
    age = models.IntegerField(default=30)
    gender = models.CharField(max_length=10, default='M')
    notes = models.CharField(max_length=255, blank=True, null=True)  # e.g. "Senior Citizen / Urgent"
    
    # Requirement 5: Sequential position for Move Up / Down
    position = models.IntegerField(default=1)
    
    # Requirements 6 & 7: Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='WAITING')
    
    # Requirement 8: Exact timestamps for Wait-Time calculation
    created_at = models.DateTimeField(auto_now_add=True)       # When token created
    served_at = models.DateTimeField(null=True, blank=True)      # When doctor calls them
    completed_at = models.DateTimeField(null=True, blank=True)   # When consultation finishes
    cancelled_at = models.DateTimeField(null=True, blank=True)   # If cancelled

    class Meta:
        db_table = 'Patients'
        ordering = ['position']  # Always order by position

    def __str__(self):
        return f"{self.token_number} - {self.patient_name} ({self.status})"