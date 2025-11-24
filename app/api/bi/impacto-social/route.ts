import { NextResponse } from 'next/server'
import { analisarImpactoSocial } from '@/lib/bi/analysis'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        totalAlunosImpactados: 0,
        totalCertificados: 0,
        totalEmpresasAtendidas: 0,
        totalMunicipiosAtendidos: 0,
        taxaEmpregabilidade: 0,
        distribuicaoPorGenero: {
          masculino: 0,
          feminino: 0,
          outro: 0,
          naoInformado: 0,
        },
        distribuicaoPorFaixaEtaria: [],
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const impacto = await analisarImpactoSocial()
    
    return NextResponse.json({
      data: impacto,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing social impact:', error)
    return NextResponse.json({
      data: {
        totalAlunosImpactados: 0,
        totalCertificados: 0,
        totalEmpresasAtendidas: 0,
        totalMunicipiosAtendidos: 0,
        taxaEmpregabilidade: 0,
        distribuicaoPorGenero: {
          masculino: 0,
          feminino: 0,
          outro: 0,
          naoInformado: 0,
        },
        distribuicaoPorFaixaEtaria: [],
      },
      error: error instanceof Error ? error.message : 'Erro ao analisar impacto social',
    }, { status: 200 })
  }
}

