
from datetime import datetime
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Sum
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Revenu, Depense, Dette
from .serializers import RevenuSerializer, DepenseSerializer, DetteSerializer


def compute_total(queryset):
    return sum(item.montant * item.quantite for item in queryset)


def build_stock_for_user(user):
    stock = {}

    for revenu in Revenu.objects.filter(user=user):
        cat = revenu.categorie
        if cat not in stock:
            stock[cat] = {'quantite': 0, 'dernier_mouvement': revenu.date}
        stock[cat]['quantite'] += revenu.quantite
        if revenu.date > stock[cat]['dernier_mouvement']:
            stock[cat]['dernier_mouvement'] = revenu.date

    for depense in Depense.objects.filter(user=user):
        cat = depense.categorie
        if cat not in stock:
            stock[cat] = {'quantite': 0, 'dernier_mouvement': depense.date}
        stock[cat]['quantite'] -= depense.quantite
        if depense.date > stock[cat]['dernier_mouvement']:
            stock[cat]['dernier_mouvement'] = depense.date

    stock_list = []
    for categorie, data in stock.items():
        stock_list.append({
            'categorie': categorie,
            'quantite_restante': data['quantite'],
            'dernier_mouvement': str(data['dernier_mouvement']),
        })
    return sorted(stock_list, key=lambda item: item['categorie'])


class RevenuViewSet(viewsets.ModelViewSet):
    queryset = Revenu.objects.all()
    serializer_class = RevenuSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Revenu.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DepenseViewSet(viewsets.ModelViewSet):
    queryset = Depense.objects.all()
    serializer_class = DepenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Depense.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DetteViewSet(viewsets.ModelViewSet):
    queryset = Dette.objects.all()
    serializer_class = DetteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Dette.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        if not username or not email or not password:
            return Response({'detail': 'Tous les champs sont requis'}, status=400)
        User = get_user_model()
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Ce nom d utilisateur existe déjà'}, status=400)
        user = User.objects.create_user(username=username, email=email, password=password)
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=201)

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.GET.get("month")
        year = request.GET.get("year")
        revenus = Revenu.objects.filter(user=request.user)
        depenses = Depense.objects.filter(user=request.user)
        if month:
            revenus = revenus.filter(date__month=month)
            depenses = depenses.filter(date__month=month)
        if year:
            revenus = revenus.filter(date__year=year)
            depenses = depenses.filter(date__year=year)

        total_revenus = compute_total(revenus)
        total_depenses = compute_total(depenses)

        return Response({
            "revenus": total_revenus,
            "depenses": total_depenses,
            "solde": total_revenus - total_depenses,
        })

class DailySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today_param = request.GET.get("date")
        if today_param:
            try:
                selected_date = datetime.strptime(today_param, "%Y-%m-%d").date()
            except ValueError:
                selected_date = timezone.localdate()
        else:
            selected_date = timezone.localdate()

        revenus = Revenu.objects.filter(user=request.user, date=selected_date)
        depenses = Depense.objects.filter(user=request.user, date=selected_date)

        total_revenus = compute_total(revenus)
        total_depenses = compute_total(depenses)

        return Response({
            "date": selected_date,
            "revenus": total_revenus,
            "depenses": total_depenses,
            "solde": total_revenus - total_depenses,
        })

class MonthlyStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = [0] * 12
        revenus = Revenu.objects.filter(user=request.user)
        for revenu in revenus:
            data[revenu.date.month - 1] += revenu.montant * revenu.quantite
        return Response({"months": data})

class AlertView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        revenus = Revenu.objects.filter(user=request.user)
        depenses = Depense.objects.filter(user=request.user)
        dettes = Dette.objects.filter(user=request.user)
        total_revenus = compute_total(revenus)
        total_depenses = compute_total(depenses)
        total_dettes = compute_total(dettes)
        stock_items = build_stock_for_user(request.user)
        total_stock = sum(item['quantite_restante'] for item in stock_items)

        alerts = []
        suggestions = []

        if total_stock <= 0:
            alerts.append("🚨 Stock épuisé — plus aucune marchandise disponible")
            suggestions.append("Réapprovisionnez immédiatement les catégories en rupture.")
        elif total_stock < 20:
            alerts.append("⚠ Stock global bas")
            suggestions.append("Suivez les catégories critiques et passez commande avant rupture.")

        low_stock = [item for item in stock_items if item['quantite_restante'] <= 5]
        for item in low_stock:
            alerts.append(f"⚠ Stock faible pour {item['categorie']} ({item['quantite_restante']} unités restantes)")
            suggestions.append(f"Favorisez la vente ou le réapprovisionnement de {item['categorie']}.")

        if total_dettes > total_revenus * 0.3:
            alerts.append("🚨 Trop de créances par rapport aux achats")
            suggestions.append("Relancez les clients et sécurisez les paiements.")

        if total_depenses > total_revenus:
            alerts.append("⚠ Les ventes sont inférieures aux achats")
            suggestions.append("Ajustez les prix ou réduisez les achats de produits peu vendus.")

        if not alerts:
            alerts.append("✅ Situation entreprise stable pour le moment")
            suggestions.append("Continuez à surveiller le stock et les créances régulièrement.")

        return Response({
            "alerts": alerts,
            "suggestions": suggestions,
            "total_stock": total_stock,
        })

class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = list(Revenu.objects.filter(user=request.user).values_list('categorie', flat=True).distinct())
        return Response({"categories": categories})

class StockView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stock_items = build_stock_for_user(request.user)
        total_stock = sum(item['quantite_restante'] for item in stock_items)
        return Response({"stock": stock_items, "total_stock": total_stock})

class HealthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        revenus = Revenu.objects.filter(user=request.user)
        depenses = Depense.objects.filter(user=request.user)
        dettes = Dette.objects.filter(user=request.user)
        total_revenus = compute_total(revenus)
        total_depenses = compute_total(depenses)
        total_dettes = compute_total(dettes)
        cashflow = total_revenus - total_depenses
        score = 50
        advice = []
        status = "Moyenne"

        if total_revenus == 0:
            score = 10
            status = "Critique"
            advice.append("📌 Enregistrez rapidement des revenus pour relancer l'activité.")
        else:
            ratio = total_dettes / total_revenus if total_revenus else 0
            if cashflow < 0:
                score = 20
                status = "Inquiétante"
                advice.append("📌 Vos charges sont supérieures aux revenus; réduisez les dépenses urgemment.")
            elif ratio > 0.5:
                score = 35
                status = "Fragile"
                advice.append("📌 Les dettes représentent plus de la moitié des entrées. Mettez en place un plan de recouvrement.")
            else:
                score = 75
                status = "Satisfaisante"
                advice.append("📌 Continuez à renforcer vos ventes et à maîtriser vos dépenses.")

        if cashflow > 0 and total_dettes < total_revenus * 0.3:
            status = "Bonne"
            score = max(score, 85)
            advice.append("✅ Revenus positifs et dette maîtrisée. Maintenez ce rythme.")

        return Response({
            "revenus": total_revenus,
            "depenses": total_depenses,
            "dettes": total_dettes,
            "cashflow": cashflow,
            "status": status,
            "score": score,
            "advice": advice,
        })

class TransactionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        revenus = Revenu.objects.filter(user=request.user).values('id', 'montant', 'quantite', 'categorie', 'date')
        depenses = Depense.objects.filter(user=request.user).values('id', 'montant', 'quantite', 'categorie', 'date')
        transactions = []
        for revenu in revenus:
            total = revenu['montant'] * revenu['quantite']
            transactions.append({
                "type": "Entrée",
                "montant": revenu['montant'],
                "quantite": revenu['quantite'],
                "total": total,
                "categorie": revenu['categorie'],
                "date": revenu['date'],
            })
        for depense in depenses:
            total = depense['montant'] * depense['quantite']
            transactions.append({
                "type": "Sortie",
                "montant": depense['montant'],
                "quantite": depense['quantite'],
                "total": total,
                "categorie": depense['categorie'],
                "date": depense['date'],
            })
        transactions.sort(key=lambda item: item['date'], reverse=True)
        return Response({"transactions": transactions})

class CreditorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dettes = Dette.objects.filter(user=request.user).order_by('-date')
        serializer = DetteSerializer(dettes, many=True)
        return Response({"creditors": serializer.data})

class PDFReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        r = compute_total(Revenu.objects.filter(user=request.user))
        d = compute_total(Depense.objects.filter(user=request.user))
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="rapport_financier.pdf"'
        p = canvas.Canvas(response)
        p.drawString(100, 750, "Rapport Financier")
        p.drawString(100, 700, f"Revenus totaux: {r} €")
        p.drawString(100, 680, f"Dépenses totales: {d} €")
        p.drawString(100, 660, f"Solde: {r-d} €")
        p.showPage()
        p.save()
        return response

class TransactionPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="transactions.pdf"'
        p = canvas.Canvas(response)
        p.drawString(100, 750, "Liste des transactions")
        y = 720
        revenus = Revenu.objects.filter(user=request.user).order_by('-date')
        depenses = Depense.objects.filter(user=request.user).order_by('-date')
        transactions = []
        for revenu in revenus:
            transactions.append((revenu.date, "Entrée", revenu.montant, revenu.quantite, revenu.categorie, revenu.total))
        for depense in depenses:
            transactions.append((depense.date, "Sortie", depense.montant, depense.quantite, depense.categorie, depense.total))
        transactions.sort(key=lambda item: item[0], reverse=True)
        for date, typ, montant, quantite, categorie, total in transactions:
            p.drawString(100, y, f"{date} - {typ} - {categorie} - {quantite}u - {total}€")
            y -= 20
            if y < 100:
                p.showPage()
                y = 750
        p.showPage()
        p.save()
        return response

class CreditorPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="creanciers.pdf"'
        p = canvas.Canvas(response)
        p.drawString(100, 750, "Liste des créanciers")
        y = 720
        dettes = Dette.objects.filter(user=request.user).order_by('-date')
        for dette in dettes:
            p.drawString(100, y, f"{dette.date} - {dette.categorie} - {dette.quantite}u - Total: {dette.total}€")
            y -= 20
            if y < 100:
                p.showPage()
                y = 750
        p.showPage()
        p.save()
        return response
