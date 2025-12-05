"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface InvoiceItem {
  description: string;
  hsnCode: string;
  rate: number;
  workingDays: number;
  persons: number;
  quantity: number;
  amount: number;
}

interface Client {
  _id: string;
  companyName: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  gstin?: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Client selection
  const [selectedClient, setSelectedClient] = useState("");
  
  // Invoice details
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [workOrder, setWorkOrder] = useState("");
  const [billingPeriodFrom, setBillingPeriodFrom] = useState("");
  const [billingPeriodTo, setBillingPeriodTo] = useState("");
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState("");
  
  // Invoice items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "Housekeeper",
      hsnCode: "9985",
      rate: 19000,
      workingDays: 0,
      persons: 1,
      quantity: 1,
      amount: 0,
    },
  ]);
  
  // Financial calculations
  const [materialCharges, setMaterialCharges] = useState(0);
  const [managementChargesPercentage, setManagementChargesPercentage] = useState(10);
  const [cgstPercentage, setCgstPercentage] = useState(9);
  const [sgstPercentage, setSgstPercentage] = useState(9);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get("/clients?isActive=true");
      setClients(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        hsnCode: "9985",
        rate: 0,
        workingDays: 0,
        persons: 1,
        quantity: 1,
        amount: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    
    // Calculate amount based on rate, days, persons, and quantity
    const item = newItems[index];
    if (item.workingDays > 0) {
      item.amount = item.rate * item.workingDays * item.persons;
    } else {
      item.amount = item.rate * item.quantity * item.persons;
    }
    
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
    return itemsTotal;
  };

  const calculateManagementCharges = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * managementChargesPercentage) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const managementCharges = calculateManagementCharges();
    const baseAmount = subtotal + managementCharges + materialCharges;
    
    const cgst = (baseAmount * cgstPercentage) / 100;
    const sgst = (baseAmount * sgstPercentage) / 100;
    
    return baseAmount + cgst + sgst;
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';
    
    const convertHundreds = (n: number): string => {
      let str = '';
      if (n > 99) {
        str += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        str += teens[n - 10] + ' ';
        return str;
      }
      if (n > 0) {
        str += ones[n] + ' ';
      }
      return str;
    };

    let wholePart = Math.floor(num);
    let result = '';
    
    if (wholePart >= 10000000) {
      result += convertHundreds(Math.floor(wholePart / 10000000)) + 'Crore ';
      wholePart %= 10000000;
    }
    if (wholePart >= 100000) {
      result += convertHundreds(Math.floor(wholePart / 100000)) + 'Lakh ';
      wholePart %= 100000;
    }
    if (wholePart >= 1000) {
      result += convertHundreds(Math.floor(wholePart / 1000)) + 'Thousand ';
      wholePart %= 1000;
    }
    if (wholePart > 0) {
      result += convertHundreds(wholePart);
    }
    
    return result.trim() + ' Only';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      alert("Please select a client");
      return;
    }

    setLoading(true);

    const subtotal = calculateSubtotal();
    const managementCharges = calculateManagementCharges();
    const baseAmount = subtotal + managementCharges + materialCharges;
    const cgst = (baseAmount * cgstPercentage) / 100;
    const sgst = (baseAmount * sgstPercentage) / 100;
    const total = calculateTotal();

    const invoiceData = {
      client: selectedClient,
      workOrder,
      billingPeriod: billingPeriodFrom && billingPeriodTo ? {
        from: billingPeriodFrom,
        to: billingPeriodTo
      } : undefined,
      items,
      materialCharges,
      subtotal,
      managementCharges: {
        percentage: managementChargesPercentage,
        amount: managementCharges
      },
      cgst: {
        percentage: cgstPercentage,
        amount: cgst
      },
      sgst: {
        percentage: sgstPercentage,
        amount: sgst
      },
      total,
      amountInWords: numberToWords(total),
      status,
      invoiceDate,
      dueDate,
      notes,
    };

    console.log("Submitting invoice data:", invoiceData);

    try {
      const response = await api.post("/invoices", invoiceData);
      console.log("Invoice created:", response.data);
      alert("Invoice created successfully!");
      router.push("/dashboard/invoices");
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedClientDetails = () => {
    return clients.find(c => c._id === selectedClient);
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Proforma Invoice
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate a new invoice for your client
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Client Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Client <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">-- Select a Client --</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.companyName} - {client.email}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    No active clients found.{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/clients/create")}
                      className="underline hover:text-orange-700"
                    >
                      Create a new client first
                    </button>
                  </p>
                )}
              </div>

              {selectedClient && getSelectedClientDetails() && (
                <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Client Details:
                  </p>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><strong>Company:</strong> {getSelectedClientDetails()?.companyName}</p>
                    <p><strong>Email:</strong> {getSelectedClientDetails()?.email}</p>
                    <p><strong>Phone:</strong> {getSelectedClientDetails()?.phone}</p>
                    {getSelectedClientDetails()?.gstin && (
                      <p><strong>GSTIN:</strong> {getSelectedClientDetails()?.gstin}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Invoice Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Order No.
                </label>
                <input
                  type="text"
                  value={workOrder}
                  onChange={(e) => setWorkOrder(e.target.value)}
                  placeholder="MHTWO50007425-26"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Billing Period From
                </label>
                <input
                  type="date"
                  value={billingPeriodFrom}
                  onChange={(e) => setBillingPeriodFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Billing Period To
                </label>
                <input
                  type="date"
                  value={billingPeriodTo}
                  onChange={(e) => setBillingPeriodTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Service Items
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                + Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                      Description
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                      HSN Code
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                      Rate (₹)
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                      Working Days
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                      Persons
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                      Amount (₹)
                    </th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) =>
                            updateItem(index, "description", e.target.value)
                          }
                          placeholder="Housekeeper"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={(e) =>
                            updateItem(index, "hsnCode", e.target.value)
                          }
                          placeholder="9985"
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(index, "rate", parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={item.workingDays}
                          onChange={(e) =>
                            updateItem(index, "workingDays", parseFloat(e.target.value) || 0)
                          }
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.persons}
                          onChange={(e) =>
                            updateItem(index, "persons", parseInt(e.target.value) || 1)
                          }
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                        ₹{item.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charges and Calculations */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Additional Charges & Taxes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Material Charges (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={materialCharges}
                    onChange={(e) => setMaterialCharges(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Management Charges (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={managementChargesPercentage}
                    onChange={(e) => setManagementChargesPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CGST (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={cgstPercentage}
                      onChange={(e) => setCgstPercentage(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SGST (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={sgstPercentage}
                      onChange={(e) => setSgstPercentage(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Calculation Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Invoice Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sub Total:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Material Charges:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{materialCharges.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Management Charges @ {managementChargesPercentage}%:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{calculateManagementCharges().toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Add CGST @ {cgstPercentage}%:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{((calculateSubtotal() + calculateManagementCharges() + materialCharges) * cgstPercentage / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Add SGST @ {sgstPercentage}%:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{((calculateSubtotal() + calculateManagementCharges() + materialCharges) * sgstPercentage / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t-2 border-gray-400 dark:border-gray-500 pt-2 mt-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-900 dark:text-white">Total Amount:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        ₹{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 italic pt-2 border-t border-gray-300 dark:border-gray-600">
                    {numberToWords(calculateTotal())}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Additional Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Any additional notes or payment terms..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/invoices")}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedClient}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
