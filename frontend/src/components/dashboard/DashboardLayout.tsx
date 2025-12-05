"use client";
import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: string;
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar userRole={userRole} />
      
      {/* Main content */}
      <div className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
