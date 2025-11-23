"use client";
import React from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function SupervisorDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/auth/signin");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Supervisor Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Welcome
              </h3>
              <p className="text-blue-600 dark:text-blue-300">
                You are logged in as a Supervisor.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Tasks
              </h3>
              <p className="text-green-600 dark:text-green-300">
                View and manage your tasks here.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                Reports
              </h3>
              <p className="text-purple-600 dark:text-purple-300">
                Access your reports and analytics.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Recent Activity
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              No recent activity to display.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
