import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CLOS - Customer Lifecycle OS",
  description: "Next-gen OS for Dealerships",
};

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const user = await prisma.user.findFirst()
  const today = new Date()
  
  // Fetch today's pending tasks to show in the sidebar
  const pendingTasks = await prisma.task.findMany({
    where: { userId: user?.id, status: 'Pending', dueDate: { lte: today } },
    include: { customer: true },
    orderBy: { dueDate: 'asc' },
    take: 10 // Limit for sidebar
  })

  // Fetch count of Open Complaints
  const openComplaintsCount = await prisma.complaint.count({
    where: { status: 'Open' }
  })

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-screen overflow-hidden bg-gray-50">
        
        {/* Sidebar */}
        <aside className="w-72 bg-[#0A0A0A] text-gray-300 flex flex-col border-r border-white/10 shrink-0">
          <div className="p-6 pb-2">
            <h1 className="text-xl font-bold text-white tracking-tight">CLOS</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1 font-semibold">Dealership OS</p>
          </div>
          
          <nav className="px-4 space-y-2 mt-4">
            <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
              <span className="text-xl">📊</span>
              <span className="font-medium text-sm">Owner Dashboard</span>
            </a>
            <a href="/queue" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
              <span className="text-xl">📞</span>
              <span className="font-medium text-sm">Today's Queue</span>
              {pendingTasks.length > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{pendingTasks.length}</span>
              )}
            </a>
            <a href="/customers" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
              <span className="text-xl">👥</span>
              <span className="font-medium text-sm">All Customers</span>
            </a>
            <a href="/fast-entry" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
              <span className="text-xl">⚡</span>
              <span className="font-medium text-sm">Fast Data Entry</span>
            </a>
            <a href="/complaints" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
              <span className="text-xl">⚠️</span>
              <span className="font-medium text-sm">Complaints</span>
              {openComplaintsCount > 0 && (
                <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{openComplaintsCount}</span>
              )}
            </a>
            <a href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
              <span className="text-xl">📊</span>
              <span className="font-medium text-sm">Reports</span>
            </a>
          </nav>

          {/* Today's Call List */}
          <div className="flex-1 overflow-y-auto px-4 mt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-4">Who to Call Today</h3>
            <div className="space-y-1">
              {pendingTasks.length === 0 ? (
                <p className="text-xs text-gray-500 px-4 italic">No calls left today!</p>
              ) : (
                pendingTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between px-4 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-gray-200">{task.customer.name}</p>
                      <p className="text-xs text-gray-500">{task.customer.phone}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* User Profile */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.name || 'Unknown User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Role'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          {children}
        </main>
        
      </body>
    </html>
  );
}
