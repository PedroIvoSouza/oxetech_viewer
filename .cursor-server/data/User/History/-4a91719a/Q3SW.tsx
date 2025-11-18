/**
 * Bento Grid Skeleton Loading
 * Esqueletos pulsantes que imitam o formato do Bento Grid
 */

import { cn } from '@/lib/utils'

interface BentoSkeletonProps {
  span?: 1 | 2 | 3 | 4
  height?: 'auto' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function BentoSkeleton({ span = 1, height = 'auto', className }: BentoSkeletonProps) {
  const heightClasses = {
    auto: 'min-h-[200px]',
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
    xl: 'h-96',
  }

  return (
    <div
      className={cn(
        'skeleton-bento animate-skeleton',
        span === 2 && 'md:col-span-2',
        span === 3 && 'md:col-span-3 lg:col-span-3',
        span === 4 && 'md:col-span-2 lg:col-span-4',
        heightClasses[height],
        className
      )}
    />
  )
}

export function BentoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="bento-grid">
      {Array.from({ length: count }).map((_, i) => (
        <BentoSkeleton key={i} span={i % 3 === 0 ? 2 : 1} height="auto" />
      ))}
    </div>
  )
}

