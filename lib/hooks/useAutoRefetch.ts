'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useAutoRefetch(interval: number = 60000) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries()
    }, interval)

    return () => clearInterval(intervalId)
  }, [interval, queryClient])
}

