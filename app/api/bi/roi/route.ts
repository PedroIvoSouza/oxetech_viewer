import { NextResponse } from 'next/server'
import { analisarROIEficiencia } from '@/lib/bi/analysis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const roi = await analisarROIEficiencia()
    
    return NextResponse.json({
      data: roi,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing ROI:', error)
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao analisar ROI',
      },
      { status: 500 }
    )
  }
}

