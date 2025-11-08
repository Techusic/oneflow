from django.contrib import admin
from django.conf import settings
from . import models

_enabled = getattr(settings, "ANALYTICS_MODULES", None)
_enabled_set = set(_enabled) if _enabled is not None else None

def _register(key, model):
    if _enabled_set is None or key in _enabled_set:
        admin.site.register(model)

# core
_register("projects", models.Project)
_register("tasks", models.Task)
_register("time", models.TimeEntry)

# catalog
_register("products", models.Product)
_register("customers", models.Customer)
_register("vendors", models.Vendor)

# sales / purchase
_register("sales", models.SalesOrder)
_register("sales_lines", models.SalesOrderLine)
_register("purchases", models.PurchaseOrder)
_register("purchase_lines", models.PurchaseOrderLine)

# invoices / bills
_register("invoices", models.Invoice)
_register("invoice_lines", models.InvoiceLine)

# expenses & analytics
_register("expenses", models.Expense)
_register("analytics", models.AnalyticsEvent)
_register("aggregated_metrics", models.AggregatedMetric)
