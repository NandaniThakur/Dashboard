"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import jsPDF from "jspdf";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientDetails?: {
    companyName: string;
    email: string;
    phone: string;
    gstin?: string;
  };
  total: number;
  status: string;
  invoiceDate: string;
  dueDate: string;
}

interface Stats {
  overdue: number;
  dueWithin30Days: number;
  upcomingPayout: number;
  avgTimeToGetPaid: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats>({
    overdue: 0,
    dueWithin30Days: 0,
    upcomingPayout: 0,
    avgTimeToGetPaid: 24
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [activeFilter, searchQuery, invoices]);

  const fetchInvoices = async () => {
    try {
      const response = await api.get("/invoices");
      setInvoices(response.data.invoices);
      setFilteredInvoices(response.data.invoices);
      setStats(response.data.stats);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      setError(error.response?.data?.message || "Failed to fetch invoices");
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    // Filter by status
    if (activeFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.status === activeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invoice.clientDetails?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      );
    }

    setFilteredInvoices(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      await api.delete(`/invoices/${id}`);
      fetchInvoices();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete invoice");
    }
  };

  const handleDownload = (invoice: Invoice) => {
    const doc = new jsPDF();
    
    // Set font sizes
    const titleSize = 20;
    const headingSize = 14;
    const normalSize = 11;
    const smallSize = 9;
    
    // Colors
    const primaryColor: [number, number, number] = [41, 128, 185];
    const darkGray: [number, number, number] = [50, 50, 50];
    const lightGray: [number, number, number] = [150, 150, 150];
    
    let yPosition = 20;
    
    // Header - Invoice Title
    doc.setFontSize(titleSize);
    doc.setTextColor(...primaryColor);
    doc.text("INVOICE", 105, yPosition, { align: "center" });
    
    yPosition += 10;
    
    // Invoice Number and Date
    doc.setFontSize(normalSize);
    doc.setTextColor(...darkGray);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, yPosition);
    doc.text(`Date: ${formatDate(invoice.invoiceDate)}`, 150, yPosition);
    
    yPosition += 5;
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 150, yPosition);
    
    yPosition += 15;
    
    // Divider line
    doc.setDrawColor(...lightGray);
    doc.line(20, yPosition, 190, yPosition);
    
    yPosition += 10;
    
    // Customer Details
    doc.setFontSize(headingSize);
    doc.setTextColor(...primaryColor);
    doc.text("Bill To:", 20, yPosition);
    
    yPosition += 7;
    doc.setFontSize(normalSize);
    doc.setTextColor(...darkGray);
    doc.text(invoice.clientDetails?.companyName || 'N/A', 20, yPosition);
    
    yPosition += 5;
    doc.setFontSize(smallSize);
    doc.setTextColor(...lightGray);
    doc.text(invoice.clientDetails?.email || 'N/A', 20, yPosition);
    
    yPosition += 15;
    
    // Total Amount Section
    doc.setFontSize(headingSize);
    doc.setTextColor(...primaryColor);
    doc.text("Total Amount:", 20, yPosition);
    
    yPosition += 8;
    doc.setFontSize(titleSize);
    doc.setTextColor(...darkGray);
    doc.text(formatCurrency(invoice.total), 20, yPosition);
    
    yPosition += 15;
    
    // Status
    const statusColor: { [key: string]: [number, number, number] } = {
      paid: [46, 204, 113],
      unpaid: [231, 76, 60],
      draft: [149, 165, 166],
      overdue: [241, 196, 15]
    };
    
    doc.setFillColor(...(statusColor[invoice.status] || [150, 150, 150]));
    doc.roundedRect(20, yPosition, 40, 8, 2, 2, "F");
    doc.setFontSize(normalSize);
    doc.setTextColor(255, 255, 255);
    doc.text(invoice.status.toUpperCase(), 40, yPosition + 5.5, { align: "center" });
    
    // Footer
    doc.setFontSize(smallSize);
    doc.setTextColor(...lightGray);
    doc.text("Thank you for your business!", 105, 280, { align: "center" });
    
    // Save the PDF
    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "unpaid":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "overdue":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Invoices
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all your invoices
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/invoices/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <span>+</span>
            Create an Invoice
          </button>
        </div>

        {/* Overview Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Overdue</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(stats.overdue)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Due within next 30 days
              </p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(stats.dueWithin30Days)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Average time to get paid
              </p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.avgTimeToGetPaid} days
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Upcoming Payout
              </p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(stats.upcomingPayout)}
              </p>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                  Invoices
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your most recent invoices list
                </p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeFilter === "all"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  All Invoices
                </button>
                <button
                  onClick={() => setActiveFilter("unpaid")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeFilter === "unpaid"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Unpaid
                </button>
                <button
                  onClick={() => setActiveFilter("draft")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeFilter === "draft"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Draft
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Invoice Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Creation Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {invoice.clientDetails?.companyName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(invoice.invoiceDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                          {formatCurrency(invoice.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDownload(invoice)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 mr-4"
                            title="Download Invoice"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/invoices/edit/${invoice._id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(invoice._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
