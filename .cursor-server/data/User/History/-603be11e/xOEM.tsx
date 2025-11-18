'use client'

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ModuleType, getModuleColor } from '@/lib/design-system'
import { cn } from '@/lib/utils'

interface PieChartProps {
  data: Array<{
    name: string
    value: number
  }>
  title?: string
  description?: string
  colors?: string[]
  module?: ModuleType
  className?: string
  height?: number
}

const generateColors = (module?: ModuleType, count: number = 5): string[] => {
  if (module) {
    const primary = getModuleColor(module, 'primary')
    const secondary = getModuleColor(module, 'secondary')
    const light = getModuleColor(module, 'light')
    const dark = getModuleColor(module, 'dark')

    const baseColors = [primary, secondary, light, dark]
    const colors: string[] = []

    for (let i = 0; i < count; i++) {
      const baseColor = baseColors[i % baseColors.length]
      const opacity = 0.6 + (i % 2) * 0.3
      colors.push(baseColor + Math.floor(opacity * 255).toString(16).padStart(2, '0'))
    }

    return colors
  }

  return ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']
}

export function PieChart({
  data,
  title,
  description,
  colors,
  module,
  className,
  height = 350,
}: PieChartProps) {
  const chartColors = colors || generateColors(module, data.length)
  const modulePrimary = module ? getModuleColor(module, 'primary') : undefined

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={cn(
          'border-0 shadow-soft overflow-hidden transition-all duration-300 hover:shadow-medium',
          className
        )}
        style={{ borderRadius: '22px' }}
      >
        {(title || description) && (
          <CardHeader className="pb-4">
            {title && (
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
            )}
            {description && (
              <CardDescription className="text-sm mt-1">
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent className="pb-6">
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={height / 3.5}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1000}
                animationBegin={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColors[index % chartColors.length]}
                    stroke={chartColors[index % chartColors.length]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                }}
                formatter={(value: number) => [value, 'Valor']}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                iconSize={10}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
