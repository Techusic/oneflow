from django.db import models
from apps.analytics import models as analytics_models

class Product(analytics_models.Product):
    class Meta:
        proxy = True
        app_label = "products"
        verbose_name = "Product"
        verbose_name_plural = "Products"
