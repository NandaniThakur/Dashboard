"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Manpower {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  designation: string;
  assignedClient?: {
    _id: string;
    companyName: string;
  };
  salary: number;
  status: string;
  joiningDate: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
  terminated: number;
}

export default function ManpowerPage() {
  const [manpower, setManpower] = useState<Manpower[]>([]);
  const [filteredManpower, setFilteredManpower] = useState<Manpower[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    onLeave: 0,
    terminated: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchManpower();
  }, []);

  useEffect(() => {
    filterManpower();
  }, [activeFilter, searchQuery, manpower]);

  const fetchManpower = async () => {
    try {
      const response = await api.get("/manpower");
      setManpower(response.data.data || []);
      setFilteredManpower(response.data.data || []);
      setStats(response.data.stats);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching manpower:", error);
      setError(error.response?.data?.message || "Failed to fetch manpower");
      setLoading(false);
    }
  };

  const filterManpower = () => {
    let filtered = manpower;

    // Filter by status
    if (activeFilter !== "all") {
      filtered = filtered.filter(emp => emp.status === activeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(emp =>
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.includes(searchQuery) ||
        (emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      );
    }

    setFilteredManpower(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      await api.delete(`/manpower/${id}`);
      fetchManpower();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete employee");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Terminated":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
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
              Manpower Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your workforce and employees
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/manpower/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <span>+</span>
            Add Employee
          </button>
        </div>

        {/* Overview Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Employees</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.active}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">On Leave</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.onLeave}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Inactive</p>
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                {stats.inactive}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Terminated</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.terminated}
              </p>
            </div>
          </div>
        </div>

        {/* Manpower Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                  Employees
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your workforce list
                </p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeFilter === "all"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter("Active")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeFilter === "Active"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveFilter("On Leave")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeFilter === "On Leave"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  On Leave
                </button>
                <button
                  onClick={() => setActiveFilter("Inactive")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeFilter === "Inactive"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Inactive
                </button>
              </div>

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
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Assigned Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Salary
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
                  {filteredManpower.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    filteredManpower.map((emp) => (
                      <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {emp.employeeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {emp.designation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {emp.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {emp.assignedClient?.companyName || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                          {formatCurrency(emp.salary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              emp.status
                            )}`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/dashboard/manpower/edit/${emp._id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(emp._id)}
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
