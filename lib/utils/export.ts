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

  try {
    // Usar html2canvas para converter para imagem
    // @ts-ignore - html2canvas é opcional e tipos podem estar incompletos
    const html2canvasModule = await import('html2canvas')
    const html2canvas = html2canvasModule.default || html2canvasModule
    // @ts-ignore - scale e background são propriedades válidas do html2canvas
    const canvas = await html2canvas(chartElement, {
      background: '#ffffff',
      scale: 2, // Alta resolução
    } as any)

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
  } catch (error) {
    throw new Error(
      'html2canvas não está instalado. Execute: npm install html2canvas'
    )
  }
}

/**
 * Exportar múltiplos gráficos para PNG
 */
export async function exportMultipleChartsToPNG(
  chartIds: string[],
  filename: string = 'dashboard'
): Promise<void> {
  try {
    // @ts-ignore - html2canvas é opcional
    const html2canvasModule = await import('html2canvas')
    const html2canvas = html2canvasModule.default || html2canvasModule
    // @ts-ignore - jspdf é opcional
    const jspdfModule = await import('jspdf')
    const jsPDF = (jspdfModule as any).jsPDF || jspdfModule.default || jspdfModule

    const charts: HTMLCanvasElement[] = []

    // Converter cada gráfico
    for (const chartId of chartIds) {
      const chartElement = document.getElementById(chartId)
      if (chartElement) {
        // @ts-ignore - scale e background são propriedades válidas do html2canvas
        const canvas = await html2canvas(chartElement, {
          background: '#ffffff',
          scale: 2,
        } as any)
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
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      throw new Error(
        'html2canvas ou jspdf não estão instalados. Execute: npm install html2canvas jspdf'
      )
    }
    throw error
  }
}

