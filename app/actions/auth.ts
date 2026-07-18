'use server'

import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Username and password are required' }
  }

  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (!user || user.password !== password) {
    return { error: 'Invalid username or password' }
  }

  // Set auth cookie (in a real app, use iron-session or JWT)
  const cookieStore = await cookies()
  cookieStore.set('auth_user_id', user.id, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })

  return { success: true, role: user.role }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_user_id')
  redirect('/login')
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('auth_user_id')?.value

  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  return user
}
