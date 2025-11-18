/**
 * Chapter Section - Introdução com fundo colorido
 */

'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ChapterSectionProps {
  number?: string
  title: string
  content: string | React.ReactNode
  themeColor?: string
  className?: string
}

export function ChapterSection({
  number,
  title,
  content,
  themeColor = '#C5192D',
  className,
}: ChapterSectionProps) {
  return (
    <section
      className={cn('relative py-24 md:py-32 lg:py-40', className)}
      style={{
        backgroundColor: themeColor,
      }}
    >
      <div className="mx-auto max-w-4xl px-6 text-center md:px-12 lg:px-24">
        {number && (
          <motion.span
            className="mb-4 block text-6xl font-bold font-display text-white/20 md:text-8xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {number}
          </motion.span>
        )}
        <motion.h2
          className="mb-8 text-4xl font-bold font-display leading-tight text-white md:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {title}
        </motion.h2>
        <motion.div
          className="text-xl font-body leading-relaxed text-white/90 md:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {content}
        </motion.div>
      </div>
    </section>
  )
}

