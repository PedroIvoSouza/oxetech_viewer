'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
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

interface BarChartProps {
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
}

const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

export function BarChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  module,
  className,
  height = 350,
}: BarChartProps) {
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
            <RechartsBarChart
              data={data}
              margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
              barCategoryGap="20%"
            >
              <defs>
                {yKeys.map((yKey, index) => {
                  const color = yKey.color || (index === 0 ? modulePrimary : defaultColors[index]) || defaultColors[index]
                  return (
                    <linearGradient
                      key={yKey.key}
                      id={`barGradient-${yKey.key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                    </linearGradient>
                  )
                })}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                opacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey={xKey}
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="square"
                iconSize={12}
              />
              {yKeys.map((yKey, index) => {
                const color = yKey.color || (index === 0 ? modulePrimary : defaultColors[index]) || defaultColors[index]
                return (
                  <Bar
                    key={yKey.key}
                    dataKey={yKey.key}
                    name={yKey.name}
                    fill={`url(#barGradient-${yKey.key})`}
                    radius={[12, 12, 0, 0]}
                    animationDuration={1000}
                    animationBegin={index * 100}
                  />
                )
              })}
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
