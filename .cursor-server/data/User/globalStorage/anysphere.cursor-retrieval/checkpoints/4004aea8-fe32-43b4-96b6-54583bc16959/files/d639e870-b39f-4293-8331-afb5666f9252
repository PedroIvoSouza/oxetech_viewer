import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Inscrições Lab
    const inscricoes = await prisma.oxetechlab_inscricoes.findMany({
      select: {
        id: true,
        status: true,
        created_at: true,
        aluno_id: true,
        turma_id: true,
        turmas: {
          select: {
            id: true,
            titulo: true,
            laboratorios: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Distribuição por curso (via turma)
    const distribuicaoPorCurso = inscricoes.reduce((acc, inscricao) => {
      const curso = inscricao.turmas?.titulo || 'Sem curso'
      acc[curso] = (acc[curso] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const distribuicaoPorCursoArray = Object.entries(distribuicaoPorCurso).map(
      ([curso, total]) => ({
        curso,
        total,
      })
    )

    // Evolução temporal
    const evolucaoTemporal = inscricoes.reduce((acc, inscricao) => {
      const month = new Date(inscricao.created_at).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const evolucaoTemporalArray = Object.entries(evolucaoTemporal).map(
      ([mes, total]) => ({
        mes,
        inscricoes: total,
      })
    )

    // Estatísticas gerais
    const [totalInscricoes, totalInscricoesPorStatus] = await Promise.all([
      prisma.oxetechlab_inscricoes.count(),
      prisma.oxetechlab_inscricoes.groupBy({
        by: ['status'],
        _count: true,
      }),
    ])

    // Inscrições por laboratório
    const turmas = await prisma.turmas.findMany({
      select: {
        id: true,
        titulo: true,
        laboratorios: {
          select: {
            nome: true,
          },
        },
        oxetechlab_inscricoes: {
          select: {
            id: true,
          },
        },
      },
    })

    const inscricoesPorLaboratorio = turmas.reduce((acc, turma) => {
      const lab = turma.laboratorios?.nome || 'Sem laboratório'
      acc[lab] = (acc[lab] || 0) + turma.oxetechlab_inscricoes.length
      return acc
    }, {} as Record<string, number>)

    const inscricoesPorLaboratorioArray = Object.entries(
      inscricoesPorLaboratorio
    ).map(([laboratorio, total]) => ({
      laboratorio,
      total,
    }))

    return NextResponse.json({
      stats: {
        totalInscricoes,
        inscricoesPorStatus: totalInscricoesPorStatus.map((item) => ({
          status: item.status,
          total: item._count,
        })),
      },
      distribuicaoPorCurso: distribuicaoPorCursoArray,
      evolucaoTemporal: evolucaoTemporalArray,
      inscricoesPorLaboratorio: inscricoesPorLaboratorioArray,
    })
  } catch (error) {
    console.error('Error fetching lab data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lab data' },
      { status: 500 }
    )
  }
}

