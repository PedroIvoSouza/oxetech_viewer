/**
 * ScrollyTelling Section
 * Layout Sticky Side - 50% texto (esquerda) + 50% visual (direita fixo)
 * Inspirado em: https://www.gatesfoundation.org/goalkeepers/report/2024-report/
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { useScroll, useTransform, motion, useInView, MotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TextBlockData {
  id: string
  title?: string
  content: string | React.ReactNode
  className?: string
}

// Componente separado para TextBlock (hooks devem estar no topo)
function TextBlock({
  block,
  index,
  scrollYProgress,
  startProgress,
  endProgress,
  themeColor,
}: {
  block: TextBlockData
  index: number
  scrollYProgress: MotionValue<number>
  startProgress: number
  endProgress: number
  themeColor: string
}) {
  const blockProgress = useTransform(
    scrollYProgress,
    [startProgress, endProgress],
    [0, 1]
  )

  const opacity = useTransform(
    blockProgress,
    [0, 0.2, 0.8, 1],
    [0.3, 1, 1, 0.3]
  )

  const y = useTransform(
    blockProgress,
    [0, 0.5, 1],
    [50, 0, -50]
  )

  return (
    <motion.div
      className={cn('space-y-6', block.className)}
      style={{
        opacity,
        y,
      }}
    >
      {block.title && (
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight"
          style={{
            color: themeColor,
          }}
        >
          {block.title}
        </motion.h2>
      )}
      <motion.div className="text-xl md:text-2xl leading-relaxed font-body text-foreground/90">
        {block.content}
      </motion.div>
    </motion.div>
  )
}

interface VisualComponent {
  id: string
  component: React.ReactNode
  className?: string
}

interface ScrollyTellingSectionProps {
  textBlocks: TextBlock[]
  visualComponents: VisualComponent[]
  className?: string
  themeColor?: string // Cor da vertente (ODS)
}

export function ScrollyTellingSection({
  textBlocks,
  visualComponents,
  className,
  themeColor = '#C5192D', // Default: Educação
}: ScrollyTellingSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Calcular qual bloco está ativo baseado no scroll
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress) => {
      const index = Math.min(
        Math.floor(progress * textBlocks.length),
        textBlocks.length - 1
      )
      setActiveIndex(index)
    })

    return () => unsubscribe()
  }, [scrollYProgress, textBlocks.length])

  return (
    <div
      ref={containerRef}
      className={cn('relative min-h-[200vh] w-full', className)}
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      {/* Container Principal */}
      <div className="sticky top-0 flex h-screen w-full overflow-hidden">
        {/* Lado Esquerdo - Texto Narrativo (50%) */}
        <div className="flex w-1/2 flex-col justify-center px-12 md:px-16 lg:px-24">
          <div className="max-w-2xl space-y-16">
            {textBlocks.map((block, index) => {
              const startProgress = index / textBlocks.length
              const endProgress = (index + 1) / textBlocks.length

              return (
                <TextBlock
                  key={block.id}
                  block={block}
                  index={index}
                  scrollYProgress={scrollYProgress}
                  startProgress={startProgress}
                  endProgress={endProgress}
                  themeColor={themeColor}
                />
              )
            })}
          </div>
        </div>

        {/* Lado Direito - Visual Sticky (50%) */}
        <div className="sticky top-0 flex h-screen w-1/2 items-center justify-center bg-off-white p-12 md:p-16 lg:p-24">
          <div className="relative h-full w-full">
            {visualComponents.map((visual, index) => {
              const isActive = activeIndex === index

              return (
                <motion.div
                  key={visual.id}
                  className={cn(
                    'absolute inset-0 flex items-center justify-center',
                    visual.className
                  )}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.9,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
                  }}
                  style={{
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  {visual.component}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

