from django.urls import path
from .views import ChatMessageView, ChatSessionListView, ChatSessionDetailView

urlpatterns = [
    path('message/', ChatMessageView.as_view(), name='chat_message'),
    path('sessions/', ChatSessionListView.as_view(), name='chat_sessions'),
    path('sessions/<int:id>/', ChatSessionDetailView.as_view(), name='chat_session_detail'),
]
