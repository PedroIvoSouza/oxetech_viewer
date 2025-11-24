import { NextResponse } from 'next/server'
import { gerarAnaliseCompletaBI } from '@/lib/bi/analysis'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Verificar se Prisma está disponível
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        resumo: {
          totalAlunos: 0,
          totalCertificados: 0,
          totalEmpresas: 0,
          totalMunicipios: 0,
        },
        eficacia: {
          taxaConclusao: 0,
          taxaContratacao: 0,
          satisfacao: 0,
        },
        impacto: {
          empregabilidade: 0,
          renda: 0,
          inclusao: 0,
        },
        tendencias: [],
        oportunidades: [],
        roi: {
          investimento: 0,
          retorno: 0,
          multiplicador: 0,
        },
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const analise = await gerarAnaliseCompletaBI()
    
    return NextResponse.json({
      data: analise,
      error: null,
    })
  } catch (error) {
    console.error('Error generating BI analysis:', error)
    return NextResponse.json({
      data: {
        resumo: {
          totalAlunos: 0,
          totalCertificados: 0,
          totalEmpresas: 0,
          totalMunicipios: 0,
        },
        eficacia: {
          taxaConclusao: 0,
          taxaContratacao: 0,
          satisfacao: 0,
        },
        impacto: {
          empregabilidade: 0,
          renda: 0,
          inclusao: 0,
        },
        tendencias: [],
        oportunidades: [],
        roi: {
          investimento: 0,
          retorno: 0,
          multiplicador: 0,
        },
      },
      error: error instanceof Error ? error.message : 'Erro ao gerar análise de BI',
    }, { status: 200 })
  }
}

