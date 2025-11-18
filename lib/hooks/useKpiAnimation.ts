'use client'

import { useEffect, useState } from 'react'

interface UseKpiAnimationProps {
  initialValue: number
  finalValue: number
  duration?: number
}

export function useKpiAnimation({
  initialValue,
  finalValue,
  duration = 1000,
}: UseKpiAnimationProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (initialValue === finalValue) {
      setValue(finalValue)
      return
    }

    const startTime = Date.now()
    const difference = finalValue - initialValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3)

      setValue(initialValue + difference * eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setValue(finalValue)
      }
    }

    animate()
  }, [initialValue, finalValue, duration])

  return value
}

