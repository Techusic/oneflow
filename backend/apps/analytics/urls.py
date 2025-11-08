from django.urls import path, include
from django.conf import settings
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

_enabled = getattr(settings, "ANALYTICS_MODULES", None)
_enabled_set = set(_enabled) if _enabled is not None else None

def _register(key, prefix, viewset, basename=None):
    if _enabled_set is None or key in _enabled_set:
        router.register(prefix, viewset, basename=basename or prefix)

# Projects / tasks / time
_register("projects", r"projects", views.ProjectViewSet, "project")
_register("tasks", r"tasks", views.TaskViewSet, "task")
_register("time", r"time-entries", views.TimeEntryViewSet, "timeentry")

# Catalog
_register("products", r"products", views.ProductViewSet, "product")
_register("customers", r"customers", views.CustomerViewSet, "customer")
_register("vendors", r"vendors", views.VendorViewSet, "vendor")

# Sales / purchase
_register("sales", r"sales-orders", views.SalesOrderViewSet, "salesorder")
_register("sales_lines", r"sales-order-lines", views.SalesOrderLineViewSet, "salesorderline")
_register("purchases", r"purchase-orders", views.PurchaseOrderViewSet, "purchaseorder")
_register("purchase_lines", r"purchase-order-lines", views.PurchaseOrderLineViewSet, "purchaseorderline")

# Invoices / bills
_register("invoices", r"invoices", views.InvoiceViewSet, "invoice")
_register("invoice_lines", r"invoice-lines", views.InvoiceLineViewSet, "invoiceline")

# Expenses & analytics
_register("expenses", r"expenses", views.ExpenseViewSet, "expense")
_register("analytics", r"events", views.AnalyticsEventViewSet, "analyticsevent")
_register("aggregated_metrics", r"aggregated-metrics", views.AggregatedMetricViewSet, "aggregatedmetric")

urlpatterns = [
    path("api/", include(router.urls)),
]

# Note: include this module in your project urls.py:
# path("analytics/", include("apps.analytics.urls"))
# To strictly enable only required modules set ANALYTICS_MODULES in settings.py to a list of keys.
