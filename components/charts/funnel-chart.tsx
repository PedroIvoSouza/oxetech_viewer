'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ModuleType, getModuleColor } from '@/lib/design-system'
import { cn } from '@/lib/utils'

interface FunnelChartProps {
  data: Array<{
    name: string
    value: number
  }>
  title?: string
  description?: string
  module?: ModuleType
  className?: string
  height?: number
}

export function FunnelChart({
  data,
  title,
  description,
  module,
  className,
  height = 350,
}: FunnelChartProps) {
  const modulePrimary = module ? getModuleColor(module, 'primary') : undefined
  const maxValue = Math.max(...data.map((d) => d.value))

  // Preparar dados para o funil (cada barra tem largura proporcional ao valor)
  const funnelData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    width: (item.value / maxValue) * 100,
  }))

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
              data={funnelData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
            >
              <defs>
                <linearGradient
                  id="funnelGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stopColor={modulePrimary || '#8884d8'}
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="100%"
                    stopColor={modulePrimary || '#8884d8'}
                    stopOpacity={0.5}
                  />
                </linearGradient>
              </defs>
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                }}
                formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Quantidade']}
              />
              <Bar
                dataKey="value"
                fill={modulePrimary || '#8884d8'}
                radius={[0, 12, 12, 0]}
                animationDuration={1000}
              >
                {funnelData.map((entry, index) => {
                  const opacity = 0.9 - (index * 0.15)
                  const color = modulePrimary || '#8884d8'
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={color}
                      fillOpacity={opacity}
                    />
                  )
                })}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}

