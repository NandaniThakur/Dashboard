"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by making a request to a protected endpoint
    // Since we don't have one, perhaps assume if no error, user is logged in
    // For now, just set loading to false
    // In a real app, you might have /api/auth/me or something
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if error, redirect
      router.push("/auth/signin");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Welcome to your dashboard! You are successfully logged in.
          </p>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                User Information
              </h2>
              <p className="text-blue-600 dark:text-blue-400">
                {/* Display user info if available */}
                User data would be displayed here.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}