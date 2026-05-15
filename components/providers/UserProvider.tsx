'use client'

import { createContext, useContext } from 'react'

export interface UserInfo {
  id: string
  email: string
  full_name: string
  role?: string
  member_code?: string
}

const UserContext = createContext<UserInfo | null>(null)

export function UserProvider({ user, children }: { user: UserInfo | null; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser() {
  return useContext(UserContext)
}
