/**
 * Utilitários para exportação de dados
 */

import * as XLSX from 'xlsx'

/**
 * Exportar tabela para XLSX
 */
export function exportToXLSX(
  data: Array<Record<string, any>>,
  filename: string = 'export'
): void {
  // Converter dados para worksheet
  const ws = XLSX.utils.json_to_sheet(data)

  // Criar workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dados')

  // Ajustar largura das colunas
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }))
  ws['!cols'] = colWidths

  // Baixar arquivo
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Exportar gráfico para PNG (via canvas)
 */
export async function exportChartToPNG(
  chartId: string,
  filename: string = 'chart'
): Promise<void> {
  const chartElement = document.getElementById(chartId)
  if (!chartElement) {
    throw new Error(`Elemento do gráfico não encontrado: ${chartId}`)
  }

  // Usar html2canvas para converter para imagem
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(chartElement, {
    backgroundColor: '#ffffff',
    scale: 2, // Alta resolução
  })

  // Converter canvas para blob
  canvas.toBlob((blob) => {
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  })
}

/**
 * Exportar múltiplos gráficos para PNG
 */
export async function exportMultipleChartsToPNG(
  chartIds: string[],
  filename: string = 'dashboard'
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  const charts: HTMLCanvasElement[] = []

  // Converter cada gráfico
  for (const chartId of chartIds) {
    const chartElement = document.getElementById(chartId)
    if (chartElement) {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      })
      charts.push(canvas)
    }
  }

  if (charts.length === 0) {
    throw new Error('Nenhum gráfico encontrado')
  }

  // Criar PDF
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth - 20
  const imgHeight = (charts[0].height * imgWidth) / charts[0].width

  // Adicionar cada gráfico como página
  charts.forEach((canvas, index) => {
    if (index > 0) {
      pdf.addPage()
    }
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
  })

  // Baixar PDF
  pdf.save(`${filename}.pdf`)
}

