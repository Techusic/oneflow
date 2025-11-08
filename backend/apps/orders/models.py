from apps.analytics import models as analytics_models

# Proxy classes reusing analytics models (no new DB tables)
class SalesOrder(analytics_models.SalesOrder):
    class Meta:
        proxy = True
        app_label = "orders"
        verbose_name = "Sales Order"
        verbose_name_plural = "Sales Orders"

class SalesOrderLine(analytics_models.SalesOrderLine):
    class Meta:
        proxy = True
        app_label = "orders"
        verbose_name = "Sales Order Line"
        verbose_name_plural = "Sales Order Lines"

class PurchaseOrder(analytics_models.PurchaseOrder):
    class Meta:
        proxy = True
        app_label = "orders"
        verbose_name = "Purchase Order"
        verbose_name_plural = "Purchase Orders"

class PurchaseOrderLine(analytics_models.PurchaseOrderLine):
    class Meta:
        proxy = True
        app_label = "orders"
        verbose_name = "Purchase Order Line"
        verbose_name_plural = "Purchase Order Lines"
