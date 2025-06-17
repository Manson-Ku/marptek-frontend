'use client'
import { createContext, useContext } from 'react'

export const AuthContext = createContext({
  customerId: null,
  hasAccess: null,
})

export const useAuthContext = () => useContext(AuthContext)
