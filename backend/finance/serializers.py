
from rest_framework import serializers
from .models import *

class RevenuSerializer(serializers.ModelSerializer):
    total = serializers.SerializerMethodField()

    class Meta:
        model = Revenu
        fields = ['id', 'montant', 'categorie', 'quantite', 'date', 'total']

    def get_total(self, obj):
        return obj.montant * obj.quantite

class DepenseSerializer(serializers.ModelSerializer):
    total = serializers.SerializerMethodField()

    class Meta:
        model = Depense
        fields = ['id', 'montant', 'categorie', 'quantite', 'date', 'total']

    def get_total(self, obj):
        return obj.montant * obj.quantite

class DetteSerializer(serializers.ModelSerializer):
    total = serializers.SerializerMethodField()

    class Meta:
        model = Dette
        fields = ['id', 'montant', 'categorie', 'quantite', 'date', 'total']

    def get_total(self, obj):
        return obj.montant * obj.quantite
