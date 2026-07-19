import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CLOS - Customer Lifecycle OS",
  description: "Next-gen OS for Dealerships",
};

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { LayoutDashboard, Phone, Users, Zap, AlertCircle, BarChart2, LogOut } from 'lucide-react'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const cookieStore = await cookies()
  const userId = cookieStore.get('auth_user_id')?.value
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
  
  if (!user) {
    return (
      <html lang="en" className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
        <body className="bg-gray-50 text-gray-900 h-full selection:bg-black selection:text-white" suppressHydrationWarning>
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
            <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-100/40 blur-[120px]" />
          </div>
          {children}
        </body>
      </html>
    )
  }

  const isOwner = user.role === 'Owner'
  const today = new Date()
  
  const pendingTasksWhere = isOwner 
    ? { status: 'Pending', dueDate: { lte: today } }
    : { userId: user.id, status: 'Pending', dueDate: { lte: today } }

  // Fetch today's pending tasks (first 10) to show in the sidebar list
  const pendingTasks = await prisma.task.findMany({
    where: pendingTasksWhere,
    include: { customer: true },
    orderBy: { dueDate: 'asc' },
    take: 10
  })

  // Fetch actual total count of pending tasks for the badge
  const totalPendingTasksCount = await prisma.task.count({
    where: pendingTasksWhere
  })

  // Fetch count of Open Complaints
  const openComplaintsCount = await prisma.complaint.count({
    where: { status: 'Open' }
  })

  return (
    <html
      lang="en"
      className={`${inter.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex h-[100dvh] w-full overflow-hidden bg-gray-50 text-gray-900 selection:bg-black selection:text-white" suppressHydrationWarning>
        
        {/* Ambient Glassmorphism Background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[120px]" />
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-200/30 blur-[120px]" />
        </div>

        {/* Sidebar (Desktop Only) */}
        <aside className="hidden md:flex w-72 bg-white/60 backdrop-blur-3xl text-gray-700 flex-col border-r border-gray-200 shrink-0 z-10">
          <div className="p-6 pb-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">CLOS</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1 font-bold">Dealership OS</p>
          </div>
          
          <nav className="px-4 space-y-2 mt-4">
            {isOwner && (
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 hover:text-black transition-colors text-gray-600">
                <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]"><LayoutDashboard /></span>
                <span className="font-medium text-sm">Owner Dashboard</span>
              </Link>
            )}
            <Link href="/queue" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 hover:text-black transition-colors text-gray-600">
              <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]"><Phone /></span>
              <span className="font-medium text-sm">Today's Queue</span>
              {totalPendingTasksCount > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">{totalPendingTasksCount}</span>
              )}
            </Link>
            <Link href="/customers" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 hover:text-black transition-colors text-gray-600">
              <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]"><Users /></span>
              <span className="font-medium text-sm">All Customers</span>
            </Link>
            <Link href="/fast-entry" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 hover:text-black transition-colors text-gray-600">
              <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]"><Zap /></span>
              <span className="font-medium text-sm">Fast Data Entry</span>
            </Link>
            {isOwner && (
              <>
                <Link href="/complaints" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 hover:text-black transition-colors text-gray-600">
                  <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]"><AlertCircle /></span>
                  <span className="font-medium text-sm">Complaints</span>
                  {openComplaintsCount > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">{openComplaintsCount}</span>
                  )}
                </Link>
                <Link href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 hover:text-black transition-colors text-gray-600">
                  <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]"><BarChart2 /></span>
                  <span className="font-medium text-sm">Reports</span>
                </Link>
              </>
            )}
          </nav>

          {/* Today's Call List */}
          <div className="flex-1 overflow-y-auto px-4 mt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-4">Who to Call Today</h3>
            <div className="space-y-1">
              {pendingTasks.length === 0 ? (
                <p className="text-xs text-gray-400 px-4 italic">No calls left today!</p>
              ) : (
                pendingTasks.map(task => (
                  <Link 
                    key={task.id} 
                    href={`/queue?task=${task.id}`}
                    className="flex items-center justify-between px-4 py-2 hover:bg-black/5 rounded-lg cursor-pointer block"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{task.customer.name}</p>
                      <p className="text-xs text-gray-500">{task.customer.phone}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                  </Link>
                ))
              )}
            </div>
          </div>
          
          {/* User Profile */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.name.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">{user.role || 'Role'}</p>
                </div>
              </div>
              <form action={async () => {
                'use server'
                const { cookies } = await import('next/headers')
                const cookieStore = await cookies()
                cookieStore.delete('auth_user_id')
              }}>
                <button type="submit" className="text-gray-500 hover:text-black transition-colors flex items-center justify-center p-2 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]" title="Log out">
                  <LogOut />
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative pb-20 md:pb-0 z-10">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation (Mobile Only) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl text-gray-600 border-t border-gray-200 flex justify-around items-center h-16 z-50 px-2 safe-area-pb">
          {isOwner && (
            <Link href="/" className="flex flex-col items-center justify-center w-full h-full hover:text-black transition-colors">
              <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]"><LayoutDashboard /></span>
              <span className="text-[10px] mt-1 font-medium">Home</span>
            </Link>
          )}
          <Link href="/queue" className="flex flex-col items-center justify-center w-full h-full hover:text-black transition-colors relative">
            <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]"><Phone /></span>
            <span className="text-[10px] mt-1 font-medium">Calls</span>
            {totalPendingTasksCount > 0 && (
              <span className="absolute top-1 right-3 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{totalPendingTasksCount}</span>
            )}
          </Link>
          <Link href="/fast-entry" className="flex flex-col items-center justify-center w-full h-full hover:text-black transition-colors">
            <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]"><Zap /></span>
            <span className="text-[10px] mt-1 font-medium">Add</span>
          </Link>
          <Link href="/customers" className="flex flex-col items-center justify-center w-full h-full hover:text-black transition-colors">
            <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]"><Users /></span>
            <span className="text-[10px] mt-1 font-medium">Search</span>
          </Link>
          {isOwner && (
            <Link href="/complaints" className="flex flex-col items-center justify-center w-full h-full hover:text-black transition-colors relative">
              <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]"><AlertCircle /></span>
              <span className="text-[10px] mt-1 font-medium">Fix</span>
              {openComplaintsCount > 0 && (
                <span className="absolute top-1 right-3 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{openComplaintsCount}</span>
              )}
            </Link>
          )}
        </nav>
      </body>
    </html>
  );
}
