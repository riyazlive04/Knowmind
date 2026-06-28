'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession()
      if (session) {
        router.push('/console')
      } else {
        router.push('/console/login')
      }
    }
    checkAuth()
  }, [router])

  return null
}
