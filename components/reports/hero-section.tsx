/**
 * Hero Section - Report Style
 * Full-screen com parallax e título gigante
 */

'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  backgroundVideo?: string
  className?: string
}

export function HeroSection({
  title,
  subtitle,
  backgroundImage,
  backgroundVideo,
  className,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <div
      ref={containerRef}
      className={cn('relative h-screen w-full overflow-hidden', className)}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ scale, y }}
      >
        {backgroundVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: backgroundImage
                ? `url(${backgroundImage})`
                : undefined,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex h-full items-center justify-center px-6 md:px-12 lg:px-24"
        style={{ opacity }}
      >
        <div className="max-w-5xl text-center">
          <motion.h1
            className="mb-6 text-6xl font-bold font-display leading-tight text-white drop-shadow-lg md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="text-xl font-body leading-relaxed text-white/90 drop-shadow-md md:text-2xl lg:text-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

