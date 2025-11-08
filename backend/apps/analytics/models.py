from django.db import models
from django.conf import settings
from django.utils import timezone

# Core project / task / time tracking
class Project(models.Model):
	STATUS_CHOICES = [
		("draft", "Draft"),
		("active", "Active"),
		("completed", "Completed"),
		("archived", "Archived"),
	]

	name = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	customer = models.ForeignKey("Customer", null=True, blank=True, on_delete=models.SET_NULL, related_name="projects")
	owner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="owned_projects")
	start_date = models.DateField(null=True, blank=True)
	end_date = models.DateField(null=True, blank=True)
	status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="draft", db_index=True)
	thumbnail = models.ImageField(upload_to="projects/thumbnails/", null=True, blank=True)
	budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]
		indexes = [models.Index(fields=["status"]), models.Index(fields=["owner"])]

	def __str__(self):
		return self.name


class Task(models.Model):
	STATUS_CHOICES = [
		("new", "New"),
		("in_progress", "In Progress"),
		("done", "Done"),
		("blocked", "Blocked"),
	]

	project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
	name = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	assignee = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="tasks")
	parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="subtasks")
	status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="new", db_index=True)
	priority = models.PositiveSmallIntegerField(default=3)  # 1-high .. 5-low
	due_date = models.DateField(null=True, blank=True)
	estimate_hours = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		indexes = [models.Index(fields=["project", "status"]), models.Index(fields=["assignee"])]
		ordering = ["-created_at"]

	def __str__(self):
		return f"{self.name} ({self.project_id})"


class TimeEntry(models.Model):
	"""Timesheet entry connected to a task and user."""
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="time_entries")
	task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="time_entries")
	date = models.DateField(default=timezone.localdate)
	duration_minutes = models.PositiveIntegerField()  # store minutes for precision
	description = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		indexes = [models.Index(fields=["user", "task", "date"])]
		ordering = ["-date"]

	def __str__(self):
		return f"{self.user_id} - {self.task_id} - {self.duration_minutes}m"


# Catalog: products, customers, vendors
class Product(models.Model):
	PRODUCT_TYPE_CHOICES = [
		("service", "Service"),
		("goods", "Goods"),
		("expense", "Expense"),
	]

	name = models.CharField(max_length=255)
	sku = models.CharField(max_length=64, null=True, blank=True, db_index=True)
	product_type = models.CharField(max_length=16, choices=PRODUCT_TYPE_CHOICES, default="service", db_index=True)
	sales_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
	cost_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
	unit = models.CharField(max_length=32, default="unit")
	is_active = models.BooleanField(default=True)
	notes = models.TextField(blank=True)

	class Meta:
		indexes = [models.Index(fields=["sku"]), models.Index(fields=["product_type"])]
		ordering = ["name"]

	def __str__(self):
		return self.name


class Customer(models.Model):
	name = models.CharField(max_length=255)
	company = models.CharField(max_length=255, blank=True)
	email = models.EmailField(null=True, blank=True)
	phone = models.CharField(max_length=64, blank=True)
	address = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["name"]

	def __str__(self):
		return self.name


class Vendor(models.Model):
	name = models.CharField(max_length=255)
	contact = models.CharField(max_length=255, blank=True)
	email = models.EmailField(null=True, blank=True)
	phone = models.CharField(max_length=64, blank=True)
	address = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["name"]

	def __str__(self):
		return self.name


# Sales / Purchase orders and lines
class SalesOrder(models.Model):
	STATUS_CHOICES = [
		("draft", "Draft"),
		("confirmed", "Confirmed"),
		("invoiced", "Invoiced"),
		("cancelled", "Cancelled"),
	]

	number = models.CharField(max_length=64, unique=True)
	customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="sales_orders")
	project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL, related_name="sales_orders")
	date = models.DateField(default=timezone.localdate)
	status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="draft", db_index=True)
	total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		indexes = [models.Index(fields=["number"]), models.Index(fields=["status"])]
		ordering = ["-date"]

	def __str__(self):
		return f"SO {self.number} - {self.customer}"


class SalesOrderLine(models.Model):
	order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name="lines")
	product = models.ForeignKey(Product, on_delete=models.PROTECT)
	description = models.CharField(max_length=512, blank=True)
	quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
	unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
	line_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)

	class Meta:
		indexes = [models.Index(fields=["product"])]
		ordering = ["id"]

	def __str__(self):
		return f"{self.product_id} x {self.quantity}"


class PurchaseOrder(models.Model):
	STATUS_CHOICES = [
		("draft", "Draft"),
		("ordered", "Ordered"),
		("received", "Received"),
		("billed", "Billed"),
		("cancelled", "Cancelled"),
	]

	number = models.CharField(max_length=64, unique=True)
	vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, related_name="purchase_orders")
	project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL, related_name="purchase_orders")
	date = models.DateField(default=timezone.localdate)
	status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="draft", db_index=True)
	total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		indexes = [models.Index(fields=["number"]), models.Index(fields=["status"])]
		ordering = ["-date"]

	def __str__(self):
		return f"PO {self.number} - {self.vendor}"


class PurchaseOrderLine(models.Model):
	order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="lines")
	product = models.ForeignKey(Product, on_delete=models.PROTECT)
	description = models.CharField(max_length=512, blank=True)
	quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
	unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
	line_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)

	class Meta:
		ordering = ["id"]

	def __str__(self):
		return f"{self.product_id} x {self.quantity}"


# Invoices and Bills
class Invoice(models.Model):
	INVOICE_TYPE_CHOICES = [("customer", "Customer"), ("vendor", "Vendor")]
	STATUS_CHOICES = [
		("draft", "Draft"),
		("sent", "Sent"),
		("paid", "Paid"),
		("overdue", "Overdue"),
		("cancelled", "Cancelled"),
	]

	number = models.CharField(max_length=64, unique=True)
	invoice_type = models.CharField(max_length=16, choices=INVOICE_TYPE_CHOICES, default="customer")
	customer = models.ForeignKey(Customer, null=True, blank=True, on_delete=models.PROTECT, related_name="invoices")
	vendor = models.ForeignKey(Vendor, null=True, blank=True, on_delete=models.PROTECT, related_name="bills")
	project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL, related_name="invoices")
	date = models.DateField(default=timezone.localdate)
	due_date = models.DateField(null=True, blank=True)
	status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="draft", db_index=True)
	total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		indexes = [models.Index(fields=["number"]), models.Index(fields=["status"])]
		ordering = ["-date"]

	def __str__(self):
		return f"Invoice {self.number}"


class InvoiceLine(models.Model):
	"""Line items for invoices/bills."""
	invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="lines")
	product = models.ForeignKey("Product", null=True, blank=True, on_delete=models.PROTECT)
	description = models.CharField(max_length=512, blank=True)
	quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
	unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
	line_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)

	class Meta:
		ordering = ["id"]

	def __str__(self):
		return f"{self.product_id} x {self.quantity}"


# Expenses
class Expense(models.Model):
	project = models.ForeignKey(Project, null=True, blank=True,
							  on_delete=models.SET_NULL,
							  related_name="expenses")  # Changed from "analytics_expenses"
	vendor = models.ForeignKey(Vendor, null=True, blank=True, on_delete=models.SET_NULL, related_name="expenses")
	user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="expenses")
	name = models.CharField(max_length=255)
	date = models.DateField(default=timezone.localdate)
	amount = models.DecimalField(max_digits=12, decimal_places=2)
	description = models.TextField(blank=True)
	receipt = models.FileField(upload_to="expenses/receipts/", null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		indexes = [models.Index(fields=["project"]), models.Index(fields=["date"])]
		ordering = ["-date"]

	def __str__(self):
		return f"{self.name} - {self.amount}"


# Analytics & Aggregated metrics
class AnalyticsEvent(models.Model):
	event_name = models.CharField(max_length=128, db_index=True)
	user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
	project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL, related_name="analytics_events")
	timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
	path = models.CharField(max_length=1024, null=True, blank=True)
	properties = models.JSONField(default=dict, blank=True)

	class Meta:
		indexes = [models.Index(fields=["timestamp", "event_name"]), models.Index(fields=["project"])]
		ordering = ["-timestamp"]

	def __str__(self):
		return f"{self.event_name} @ {self.timestamp.isoformat()}"


class AggregatedMetric(models.Model):
	GRANULARITY_CHOICES = [("hour", "Hourly"), ("day", "Daily")]
	metric_name = models.CharField(max_length=128, db_index=True)
	period_start = models.DateTimeField(db_index=True)
	granularity = models.CharField(max_length=8, choices=GRANULARITY_CHOICES, default="day")
	value = models.BigIntegerField(default=0)

	class Meta:
		unique_together = ("metric_name", "period_start", "granularity")
		indexes = [models.Index(fields=["metric_name", "period_start", "granularity"])]
		ordering = ["-period_start"]

	def __str__(self):
		return f"{self.metric_name} {self.granularity} @ {self.period_start.isoformat()}"