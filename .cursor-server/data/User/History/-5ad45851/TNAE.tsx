'use client'

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ModuleType, getModuleColor } from '@/lib/design-system'
import { cn } from '@/lib/utils'

interface AreaChartProps {
  data: Array<Record<string, string | number>>
  xKey: string
  yKeys: Array<{
    key: string
    name: string
    color?: string
  }>
  title?: string
  description?: string
  module?: ModuleType
  className?: string
  height?: number
  curve?: 'linear' | 'monotone' | 'basis' | 'cardinal' | 'catmullRom'
}

const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

export function AreaChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  module,
  className,
  height = 350,
  curve = 'monotone',
}: AreaChartProps) {
  const modulePrimary = module ? getModuleColor(module, 'primary') : undefined
  const moduleSecondary = module ? getModuleColor(module, 'secondary') : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <RechartsAreaChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                {yKeys.map((yKey, index) => {
                  const color = yKey.color || (index === 0 ? modulePrimary : defaultColors[index]) || defaultColors[index]
                  return (
                    <linearGradient
                      key={yKey.key}
                      id={`areaGradient-${yKey.key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                  )
                })}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                opacity={0.3}
              />
              <XAxis
                dataKey={xKey}
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                }}
                cursor={{ stroke: modulePrimary || '#8884d8', strokeWidth: 2 }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="square"
                iconSize={12}
              />
              {yKeys.map((yKey, index) => {
                const color = yKey.color || (index === 0 ? modulePrimary : defaultColors[index]) || defaultColors[index]
                return (
                  <Area
                    key={yKey.key}
                    type={curve === 'cardinal' ? 'monotone' : curve}
                    dataKey={yKey.key}
                    name={yKey.name}
                    stroke={color}
                    strokeWidth={3}
                    fill={`url(#areaGradient-${yKey.key})`}
                    animationDuration={1000}
                    animationBegin={index * 100}
                  />
                )
              })}
            </RechartsAreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
