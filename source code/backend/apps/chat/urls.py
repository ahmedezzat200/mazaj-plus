from django.urls import path
from .views import (
    ChatMessageView, ChatSessionListView, ChatSessionDetailView,
    ChatFoodImageUploadView, ChatInBodyUploadView
)

urlpatterns = [
    path('message/', ChatMessageView.as_view(), name='chat_message'),
    path('sessions/', ChatSessionListView.as_view(), name='chat_sessions'),
    path('sessions/<int:id>/', ChatSessionDetailView.as_view(), name='chat_session_detail'),
    path('upload-food-image/', ChatFoodImageUploadView.as_view(), name='chat_upload_food_image'),
    path('upload-inbody/', ChatInBodyUploadView.as_view(), name='chat_upload_inbody'),
]
