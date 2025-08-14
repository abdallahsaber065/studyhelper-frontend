import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ className }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      <Header onMenuToggle={handleMenuToggle} />

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-[calc(100vh-8rem)] px-4 py-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};
