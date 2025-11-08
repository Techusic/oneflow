from rest_framework import serializers
from . import models

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Project
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Task
        fields = "__all__"


class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TimeEntry
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Product
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Customer
        fields = "__all__"


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Vendor
        fields = "__all__"


class SalesOrderLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SalesOrderLine
        fields = "__all__"


class SalesOrderSerializer(serializers.ModelSerializer):
    lines = SalesOrderLineSerializer(many=True, read_only=True)

    class Meta:
        model = models.SalesOrder
        fields = "__all__"


class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PurchaseOrderLine
        fields = "__all__"


class PurchaseOrderSerializer(serializers.ModelSerializer):
    lines = PurchaseOrderLineSerializer(many=True, read_only=True)

    class Meta:
        model = models.PurchaseOrder
        fields = "__all__"


class InvoiceLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.InvoiceLine
        fields = "__all__"


class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True)

    class Meta:
        model = models.Invoice
        fields = "__all__"


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Expense
        fields = "__all__"


class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AnalyticsEvent
        fields = "__all__"


class AggregatedMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AggregatedMetric
        fields = "__all__"