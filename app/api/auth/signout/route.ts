import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'

export async function POST() {
  try {
    await auth.signOut()
  } catch {
    // ignore
  }
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
