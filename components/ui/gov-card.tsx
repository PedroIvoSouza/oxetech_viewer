/**
 * Gov Card - Bento Grid Style
 * Inspirado em USAspending.gov cards
 */

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface GovCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  span?: 1 | 2 | 3 | 4 // Grid span for Bento Grid
  hover?: boolean
}

export function GovCard({ title, children, className, span = 1, hover = true }: GovCardProps) {
  return (
    <div
      className={cn(
        'bento-card',
        span === 2 && 'md:col-span-2',
        span === 3 && 'md:col-span-3 lg:col-span-3',
        span === 4 && 'md:col-span-2 lg:col-span-4',
        !hover && 'hover:transform-none hover:shadow-bento',
        className
      )}
    >
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="card-title">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(!title && 'pt-6')}>{children}</CardContent>
    </div>
  )
}

