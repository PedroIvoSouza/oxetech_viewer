'use client'

import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, FileImage, FileText } from 'lucide-react'
import { exportToXLSX, exportChartToPNG, exportMultipleChartsToPNG } from '@/lib/utils/export'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ExportButtonProps {
  type: 'xlsx' | 'png' | 'pdf'
  data?: Array<Record<string, any>>
  chartIds?: string[]
  filename?: string
  className?: string
  disabled?: boolean
}

export function ExportButton({
  type,
  data,
  chartIds,
  filename = 'export',
  className,
  disabled = false,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const icons = {
    xlsx: FileSpreadsheet,
    png: FileImage,
    pdf: FileText,
  }

  const Icon = icons[type] || Download

  const handleExport = async () => {
    setIsExporting(true)
    try {
      if (type === 'xlsx' && data) {
        exportToXLSX(data, filename)
      } else if (type === 'png' && chartIds && chartIds.length === 1) {
        await exportChartToPNG(chartIds[0], filename)
      } else if (type === 'pdf' && chartIds && chartIds.length > 0) {
        await exportMultipleChartsToPNG(chartIds, filename)
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao exportar dados. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting}
      variant="outline"
      size="sm"
      className={cn('gap-2', className)}
    >
      <Icon className="h-4 w-4" />
      {isExporting ? 'Exportando...' : `Exportar ${type.toUpperCase()}`}
    </Button>
  )
}

