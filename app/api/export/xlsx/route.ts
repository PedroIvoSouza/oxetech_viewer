import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { data, filename } = await request.json()

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Dados inválidos. Esperado um array de objetos.' },
        { status: 400 }
      )
    }

    // Converter dados para worksheet
    const ws = XLSX.utils.json_to_sheet(data)

    // Ajustar largura das colunas
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }))
    ws['!cols'] = colWidths

    // Criar workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Dados')

    // Converter para buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Retornar arquivo (converter Buffer para Uint8Array)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename || 'export'}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Error exporting to XLSX:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar dados' },
      { status: 500 }
    )
  }
}

