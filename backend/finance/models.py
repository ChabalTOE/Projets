
from django.db import models
from django.contrib.auth.models import User

class Revenu(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    montant = models.FloatField()
    categorie = models.CharField(max_length=100, default='Divers')
    quantite = models.IntegerField(default=1)
    date = models.DateField()

    @property
    def total(self):
        return self.montant * self.quantite

class Depense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    montant = models.FloatField()
    categorie = models.CharField(max_length=100, default='Divers')
    quantite = models.IntegerField(default=1)
    date = models.DateField()

    @property
    def total(self):
        return self.montant * self.quantite

class Dette(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    montant = models.FloatField()
    categorie = models.CharField(max_length=100, default='Divers')
    quantite = models.IntegerField(default=1)
    date = models.DateField()

    @property
    def total(self):
        return self.montant * self.quantite
