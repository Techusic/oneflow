from django.db import models
from apps.projects.models import Project
from apps.orders.models import SalesOrder, SalesOrderLine
from apps.products.models import Product
from apps.analytics import models as analytics_models
import uuid

class CustomerInvoice(models.Model):
    STATUS = [("draft","Draft"),("posted","Posted"),("paid","Paid")]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=100, unique=True)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name="customer_invoices")
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)

class CustomerInvoiceLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(CustomerInvoice, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    qty = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        self.amount = self.qty * self.unit_price
        super().save(*args, **kwargs)
        total = sum([l.amount for l in self.invoice.lines.all()])
        self.invoice.total_amount = total
        self.invoice.save(update_fields=["total_amount"])

# Proxy classes pointing to analytics' Invoice models (no new DB tables)
class Invoice(analytics_models.Invoice):
	class Meta:
		proxy = True
		app_label = "invoices"
		verbose_name = "Invoice"
		verbose_name_plural = "Invoices"


class InvoiceLine(analytics_models.InvoiceLine):
	class Meta:
		proxy = True
		app_label = "invoices"
		verbose_name = "Invoice Line"
		verbose_name_plural = "Invoice Lines"
