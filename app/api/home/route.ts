import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { normalizarNomeMunicipio } from '@/lib/geographic-analytics'
import { cachedQuery, createCacheKey, queryCache } from '@/lib/cache'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'
import { agregarDadosLab } from '@/lib/data-aggregator/lab-aggregator'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Verificar se Prisma está disponível
  if (!isPrismaAvailable()) {
    return NextResponse.json(
      { 
        data: {
          kpis: {
            totalAlunos: 0,
            totalCertificados: 0,
            totalCertificadosWork: 0,
            totalCertificadosEdu: 0,
            totalCertificadosTrilhas: 0,
            totalCertificadosLab: 0,
            totalEmpresas: 0,
            totalMatriculasEdu: 0,
            totalInscricoesWork: 0,
            totalVagasWork: 0,
            totalCandidaturasWork: 0,
            totalContratacoesWork: 0,
            totalTrilhas: 0,
            totalAtividadesConcluidas: 0,
            totalFrequencias: 0,
            totalInstrutores: 0,
            totalAgentes: 0,
            totalMunicipios: 0,
          },
          evolucao12Meses: [],
          evolucaoAlunos: [],
          evolucaoWork: [],
          funilWork: { inscricoes: 0, candidaturas: 0, contratacoes: 0 },
          conclusaoTrilhas: [],
          distribuicaoPrograma: { work: 0, edu: 0, lab: 0, trilhas: 0 },
        },
        error: 'DATABASE_URL não configurada'
      },
      { status: 200 }
    )
  }

  try {
    // KPIs Gerais (com cache)
    const cacheKey = createCacheKey('home:kpis', {})
    const kpis = await cachedQuery(queryCache, cacheKey, async () => {
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

          return {
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
          }
    })

    const {
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
    } = kpis

    // Últimos 12 meses - evolução de alunos
    const dozeMesesAtras = new Date()
    dozeMesesAtras.setMonth(dozeMesesAtras.getMonth() - 12)

    const alunos12Meses = await prisma.alunos.findMany({
      where: {
        created_at: {
          gte: dozeMesesAtras,
        },
      },
      select: {
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    })

    // Agrupar por mês (últimos 12 meses)
    const meses = []
    for (let i = 11; i >= 0; i--) {
      const data = new Date()
      data.setMonth(data.getMonth() - i)
      meses.push(data)
    }

    const evolucao12Meses = meses.map((mes) => {
      const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1)
      const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)

      const total = alunos12Meses.filter((aluno) => {
        const dataAluno = new Date(aluno.created_at)
        return dataAluno >= inicioMes && dataAluno <= fimMes
      }).length

      return {
        mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        alunos: total,
      }
    })

    // Evolução mensal completa de alunos
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

    const evolucaoAlunosArray = Object.entries(evolucaoAlunos)
      .slice(-12)
      .map(([mes, total]) => ({
        mes,
        total,
      }))

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

    const evolucaoWorkArray = Object.entries(evolucaoWork)
      .slice(-12)
      .map(([mes, inscricoes]) => ({
        mes,
        inscricoes,
      }))

    // Funil Work
    const funilWork = {
      inscricoes: totalInscricoesWork,
      candidaturas: totalCandidaturasWork,
      contratacoes: totalContratacoesWork,
    }

    // ALUNOS CERTIFICADOS
    // Work: Contratações
    const totalCertificadosWork = await prisma.contratacoes.count()
    
    // Edu: Matrículas com status de conclusão (status diferente de ZERO)
    const totalCertificadosEdu = await prisma.matriculas_oxetech_edu.count({
      where: {
        status: {
          not: 'ZERO',
        },
      },
    })
    
    // Trilhas: Concluídas
    const totalCertificadosTrilhas = await prisma.inscricoes_trilhas_alunos.count({
      where: {
        concluido: true,
      },
    })
    
    // Lab: Certificados - Usar agregação (CSV + Banco) para contar todos os formados
    // CORRIGIDO: Usar agregarDadosLab para incluir dados do CSV legado + banco
    const turmasAgregadasLab = await agregarDadosLab(false) // Não usar IA aqui para performance
    const totalCertificadosLab = turmasAgregadasLab.reduce((acc, t) => acc + t.numFormados, 0)
    
    const totalCertificados = totalCertificadosWork + totalCertificadosEdu + totalCertificadosTrilhas + totalCertificadosLab

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

    const conclusaoTrilhasArray = Object.entries(conclusaoTrilhas)
      .map(([trilha, total]) => ({
        trilha,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Municípios atendidos
    const alunosMunicipios = await prisma.alunos.findMany({
      select: {
        municipio: true,
      },
      distinct: ['municipio'],
    })

    const totalMunicipios = alunosMunicipios.length

    // Distribuição por programa
    const distribuicaoPrograma = {
      work: totalInscricoesWork,
      edu: totalMatriculasEdu,
      lab: await prisma.oxetechlab_inscricoes.count(),
      trilhas: await prisma.inscricoes_trilhas_alunos.count(),
    }

    return NextResponse.json({
      data: {
          kpis: {
            totalAlunos,
            totalCertificados,
            totalCertificadosWork,
            totalCertificadosEdu,
            totalCertificadosTrilhas,
            totalCertificadosLab,
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
            totalMunicipios,
          },
        evolucao12Meses,
        evolucaoAlunos: evolucaoAlunosArray,
        evolucaoWork: evolucaoWorkArray,
        funilWork,
        conclusaoTrilhas: conclusaoTrilhasArray,
        distribuicaoPrograma,
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching home data:', error)
    return NextResponse.json({
      data: {
        kpis: {
          totalAlunos: 0,
          totalCertificados: 0,
          totalCertificadosWork: 0,
          totalCertificadosEdu: 0,
          totalCertificadosTrilhas: 0,
          totalCertificadosLab: 0,
          totalEmpresas: 0,
          totalMatriculasEdu: 0,
          totalInscricoesWork: 0,
          totalVagasWork: 0,
          totalCandidaturasWork: 0,
          totalContratacoesWork: 0,
          totalTrilhas: 0,
          totalAtividadesConcluidas: 0,
          totalFrequencias: 0,
          totalInstrutores: 0,
          totalAgentes: 0,
          totalMunicipios: 0,
        },
        evolucao12Meses: [],
        evolucaoAlunos: [],
        evolucaoWork: [],
        funilWork: { inscricoes: 0, candidaturas: 0, contratacoes: 0 },
        conclusaoTrilhas: [],
        distribuicaoPrograma: { work: 0, edu: 0, lab: 0, trilhas: 0 },
      },
      error: error instanceof Error ? error.message : 'Failed to fetch home data',
    }, { status: 200 })
  }
}
