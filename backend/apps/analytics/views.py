from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from . import models, serializers

# Create your views here.

class IsAuthenticated(permissions.IsAuthenticated):
    pass


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = models.Project.objects.all().select_related("owner", "customer")
    serializer_class = serializers.ProjectSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"])
    def summary(self, request, pk=None):
        proj = self.get_object()
        data = proj.summary()
        return Response(data)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = models.Task.objects.all().select_related("project", "assignee")
    serializer_class = serializers.TaskSerializer
    permission_classes = [IsAuthenticated]


class TimeEntryViewSet(viewsets.ModelViewSet):
    queryset = models.TimeEntry.objects.all().select_related("task", "user")
    serializer_class = serializers.TimeEntrySerializer
    permission_classes = [IsAuthenticated]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = models.Product.objects.all()
    serializer_class = serializers.ProductSerializer
    permission_classes = [IsAuthenticated]


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = models.Customer.objects.all()
    serializer_class = serializers.CustomerSerializer
    permission_classes = [IsAuthenticated]


class VendorViewSet(viewsets.ModelViewSet):
    queryset = models.Vendor.objects.all()
    serializer_class = serializers.VendorSerializer
    permission_classes = [IsAuthenticated]


class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = models.SalesOrder.objects.all().prefetch_related("lines")
    serializer_class = serializers.SalesOrderSerializer
    permission_classes = [IsAuthenticated]


class SalesOrderLineViewSet(viewsets.ModelViewSet):
    queryset = models.SalesOrderLine.objects.all()
    serializer_class = serializers.SalesOrderLineSerializer
    permission_classes = [IsAuthenticated]


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = models.PurchaseOrder.objects.all().prefetch_related("lines")
    serializer_class = serializers.PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]


class PurchaseOrderLineViewSet(viewsets.ModelViewSet):
    queryset = models.PurchaseOrderLine.objects.all()
    serializer_class = serializers.PurchaseOrderLineSerializer
    permission_classes = [IsAuthenticated]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = models.Invoice.objects.all().prefetch_related("lines")
    serializer_class = serializers.InvoiceSerializer
    permission_classes = [IsAuthenticated]


class InvoiceLineViewSet(viewsets.ModelViewSet):
    queryset = models.InvoiceLine.objects.all()
    serializer_class = serializers.InvoiceLineSerializer
    permission_classes = [IsAuthenticated]


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = models.Expense.objects.all()
    serializer_class = serializers.ExpenseSerializer
    permission_classes = [IsAuthenticated]


class AnalyticsEventViewSet(viewsets.ModelViewSet):
    queryset = models.AnalyticsEvent.objects.all()
    serializer_class = serializers.AnalyticsEventSerializer
    permission_classes = [IsAuthenticated]


class AggregatedMetricViewSet(viewsets.ModelViewSet):
    queryset = models.AggregatedMetric.objects.all()
    serializer_class = serializers.AggregatedMetricSerializer
    permission_classes = [IsAuthenticated]
