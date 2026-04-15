
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from finance.views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register('revenus', RevenuViewSet)
router.register('depenses', DepenseViewSet)
router.register('dettes', DetteViewSet)
router.register('credits', DetteViewSet, basename='credits')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/register/', RegisterView.as_view()),
    path('api/dashboard/', DashboardView.as_view()),
    path('api/daily-summary/', DailySummaryView.as_view()),
    path('api/monthly/', MonthlyStatsView.as_view()),
    path('api/alerts/', AlertView.as_view()),
    path('api/health/', HealthView.as_view()),
    path('api/stock/', StockView.as_view()),
    path('api/categories/', CategoryListView.as_view()),
    path('api/transactions/', TransactionListView.as_view()),
    path('api/creditors/', CreditorListView.as_view()),
    path('api/report/', PDFReportView.as_view()),
    path('api/report/transactions/', TransactionPDFView.as_view()),
    path('api/report/creditors/', CreditorPDFView.as_view()),
    path('api/', include(router.urls)),
]

