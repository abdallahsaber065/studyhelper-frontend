'use client';

import AuthRefresh from '@/components/auth/AuthRefresh';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Include AuthRefresh to handle token refreshing */}
      <AuthRefresh />
      
      {/* The actual page content */}
      {children}
    </>
  );
} 