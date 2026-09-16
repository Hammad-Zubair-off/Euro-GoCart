'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import { AuthProvider } from '@/components/AuthProvider'
import AppBootstrap from '@/components/AppBootstrap'

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <Provider store={storeRef.current}>
      <AuthProvider>
        <AppBootstrap>{children}</AppBootstrap>
      </AuthProvider>
    </Provider>
  )
}
