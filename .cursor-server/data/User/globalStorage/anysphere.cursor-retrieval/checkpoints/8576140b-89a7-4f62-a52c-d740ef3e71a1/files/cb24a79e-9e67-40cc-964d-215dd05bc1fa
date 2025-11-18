import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // KPIs Gerais
    const [
      totalAlunos,
      totalEmpresas,
      totalMatriculasEdu,
      totalInscricoesWork,
      totalVagasWork,
      totalCandidaturasWork,
      totalContratacoesWork,
      totalTrilhas,
      totalAtividadesConcluidas,
      totalFrequencias,
      totalInstrutores,
      totalAgentes,
    ] = await Promise.all([
      prisma.alunos.count(),
      prisma.empresas.count(),
      prisma.matriculas_oxetech_edu.count(),
      prisma.oxetechwork_inscricao_alunos.count(),
      prisma.vagas.count(),
      prisma.candidaturas.count(),
      prisma.contratacoes.count(),
      prisma.trilhas_de_conhecimento.count(),
      prisma.modulos_trilhas_alunos.count({
        where: { curso_concluido: true },
      }),
      prisma.frequencias.count(),
      prisma.instrutores.count(),
      prisma.agentes.count(),
    ])

    // Evolução mensal de alunos
    const alunos = await prisma.alunos.findMany({
      select: {
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    })

    const evolucaoAlunos = alunos.reduce((acc, aluno) => {
      const month = new Date(aluno.created_at).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const evolucaoAlunosArray = Object.entries(evolucaoAlunos).map(
      ([mes, total]) => ({
        mes,
        total,
      })
    )

    // Evolução Work
    const inscricoesWork = await prisma.oxetechwork_inscricao_alunos.findMany({
      select: {
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    })

    const evolucaoWork = inscricoesWork.reduce((acc, inscricao) => {
      const month = new Date(inscricao.created_at).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const evolucaoWorkArray = Object.entries(evolucaoWork).map(([mes, total]) => ({
      mes,
      inscricoes: total,
    }))

    // Funil Work
    const funilWork = {
      inscricoes: totalInscricoesWork,
      candidaturas: totalCandidaturasWork,
      contratacoes: totalContratacoesWork,
    }

    // Conclusão de trilhas
    const trilhasConcluidas = await prisma.inscricoes_trilhas_alunos.findMany({
      where: {
        concluido: true,
      },
      select: {
        trilha_id: true,
        trilhas_de_conhecimento: {
          select: {
            titulo: true,
          },
        },
      },
    })

    const conclusaoTrilhas = trilhasConcluidas.reduce((acc, item) => {
      const titulo = item.trilhas_de_conhecimento?.titulo || 'Sem título'
      acc[titulo] = (acc[titulo] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const conclusaoTrilhasArray = Object.entries(conclusaoTrilhas).map(
      ([trilha, total]) => ({
        trilha,
        total,
      })
    )

    return NextResponse.json({
      kpis: {
        totalAlunos,
        totalEmpresas,
        totalMatriculasEdu,
        totalInscricoesWork,
        totalVagasWork,
        totalCandidaturasWork,
        totalContratacoesWork,
        totalTrilhas,
        totalAtividadesConcluidas,
        totalFrequencias,
        totalInstrutores,
        totalAgentes,
      },
      evolucaoAlunos: evolucaoAlunosArray,
      evolucaoWork: evolucaoWorkArray,
      funilWork,
      conclusaoTrilhas: conclusaoTrilhasArray,
    })
  } catch (error) {
    console.error('Error fetching home data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    )
  }
}

