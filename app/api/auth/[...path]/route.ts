import { auth } from '@/lib/auth/server'

// Proxies all client auth requests (/api/auth/*) to Neon Auth.
export const { GET, POST } = auth.handler()
