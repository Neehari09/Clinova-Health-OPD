from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QueueViewSet, TokenViewSet

router = DefaultRouter()
router.register(r'queues', QueueViewSet, basename='queue')
router.register(r'tokens', TokenViewSet, basename='token')

urlpatterns = [
    path('', include(router.urls)),
]