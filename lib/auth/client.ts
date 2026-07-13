'use client'

import { createAuthClient } from '@neondatabase/auth/next'

// Browser auth client. Talks to the app's own /api/auth route handler
// (same-origin), which proxies to Neon Auth. Takes no arguments.
export const authClient = createAuthClient()
