/**
 * Ferramenta de Debug para Lab
 * 
 * Analisa detalhadamente as inconsistências identificadas na auditoria
 */

import { prisma } from '@/lib/db'

export interface LabDebugInfo {
  turmasComProblemas: Array<{
    id: number
    titulo: string
    laboratorio: string
    vagasTotal: number
    vagasOcupadas: number
    vagasDisponiveis: number
    totalInscricoes: number
    inscricoesPorStatus: Record<string, number>
    inscricoesDetalhadas: Array<{
      id: number
      alunoId: number
      alunoName: string
      status: string
      created_at: Date
    }>
    problema: string
  }>
  inscricoesDuplicadas: Array<{
    alunoId: number
    alunoName: string
    turmaId: number
    turmaTitulo: string
    quantidade: number
    inscricoesIds: number[]
    status: string[]
  }>
  estatisticas: {
    totalTurmas: number
    turmasComVagasInvalidas: number
    turmasComInscricoesExcedentes: number
    totalInscricoes: number
    inscricoesFinalizadas: number
    inscricoesAtivas: number
    inscricoesDuplicadas: number
  }
}

export async function debugLabInconsistencias(): Promise<LabDebugInfo> {
  // Buscar todas as turmas com detalhes
  const turmas = await prisma.turmas.findMany({
    select: {
      id: true,
      titulo: true,
      qtd_vagas_total: true,
      qtd_vagas_preenchidas: true,
      qtd_vagas_disponiveis: true,
      laboratorios: {
        select: {
          id: true,
          nome: true,
          municipio: true,
        },
      },
      oxetechlab_inscricoes: {
        select: {
          id: true,
          status: true,
          aluno_id: true,
          created_at: true,
          alunos: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })

  const turmasComProblemas: LabDebugInfo['turmasComProblemas'] = []

  // Analisar cada turma
  for (const turma of turmas) {
    const vagasTotal = turma.qtd_vagas_total || 0
    const vagasOcupadas = turma.qtd_vagas_preenchidas || 0
    const vagasDisponiveis = turma.qtd_vagas_disponiveis || 0
    const totalInscricoes = turma.oxetechlab_inscricoes.length

    // Contar inscrições por status
    const inscricoesPorStatus: Record<string, number> = {}
    turma.oxetechlab_inscricoes.forEach(insc => {
      const status = String(insc.status)
      inscricoesPorStatus[status] = (inscricoesPorStatus[status] || 0) + 1
    })

    // Verificar problemas
    const problemas: string[] = []

    // Problema 1: Vagas ocupadas > vagas totais
    if (vagasOcupadas > vagasTotal) {
      problemas.push(`Vagas ocupadas (${vagasOcupadas}) > vagas totais (${vagasTotal})`)
    }

    // Problema 2: Soma inconsistente
    if (vagasOcupadas + vagasDisponiveis !== vagasTotal) {
      problemas.push(`Soma inconsistente: ocupadas (${vagasOcupadas}) + disponíveis (${vagasDisponiveis}) ≠ total (${vagasTotal})`)
    }

    // Problema 3: Inscrições > vagas totais
    if (totalInscricoes > vagasTotal) {
      problemas.push(`Total de inscrições (${totalInscricoes}) > vagas totais (${vagasTotal})`)
    }

    // Se tem problemas, adicionar à lista
    if (problemas.length > 0) {
      turmasComProblemas.push({
        id: turma.id,
        titulo: turma.titulo,
        laboratorio: turma.laboratorios?.nome || 'N/A',
        vagasTotal,
        vagasOcupadas,
        vagasDisponiveis,
        totalInscricoes,
        inscricoesPorStatus,
        inscricoesDetalhadas: turma.oxetechlab_inscricoes.map(insc => ({
          id: insc.id,
          alunoId: insc.aluno_id,
          alunoName: insc.alunos?.name || 'N/A',
          status: String(insc.status),
          created_at: insc.created_at,
        })),
        problema: problemas.join('; '),
      })
    }
  }

  // Buscar inscrições duplicadas
  const todasInscricoes = await prisma.oxetechlab_inscricoes.findMany({
    select: {
      id: true,
      aluno_id: true,
      turma_id: true,
      status: true,
      alunos: {
        select: {
          name: true,
        },
      },
      turmas: {
        select: {
          titulo: true,
        },
      },
    },
  })

  // Agrupar por aluno-turma
  const inscricoesPorAlunoTurma = new Map<string, typeof todasInscricoes>()
  
  todasInscricoes.forEach(insc => {
    const key = `${insc.aluno_id}-${insc.turma_id}`
    if (!inscricoesPorAlunoTurma.has(key)) {
      inscricoesPorAlunoTurma.set(key, [])
    }
    inscricoesPorAlunoTurma.get(key)!.push(insc)
  })

  // Encontrar duplicadas
  const inscricoesDuplicadas: LabDebugInfo['inscricoesDuplicadas'] = []
  
  inscricoesPorAlunoTurma.forEach((inscricoes, key) => {
    if (inscricoes.length > 1) {
      const [alunoId, turmaId] = key.split('-')
      inscricoesDuplicadas.push({
        alunoId: Number(alunoId),
        alunoName: inscricoes[0].alunos?.name || 'N/A',
        turmaId: Number(turmaId),
        turmaTitulo: inscricoes[0].turmas?.titulo || 'N/A',
        quantidade: inscricoes.length,
        inscricoesIds: inscricoes.map(i => i.id),
        status: inscricoes.map(i => String(i.status)),
      })
    }
  })

  // Estatísticas gerais
  const totalInscricoes = await prisma.oxetechlab_inscricoes.count()
  const inscricoesFinalizadas = await prisma.oxetechlab_inscricoes.count({
    where: {
      status: 'TWO',
    },
  })
  const inscricoesAtivas = totalInscricoes - inscricoesFinalizadas

  const turmasComVagasInvalidas = turmasComProblemas.filter(
    t => t.vagasOcupadas > t.vagasTotal || t.vagasOcupadas + t.vagasDisponiveis !== t.vagasTotal
  ).length

  const turmasComInscricoesExcedentes = turmasComProblemas.filter(
    t => t.totalInscricoes > t.vagasTotal
  ).length

  return {
    turmasComProblemas: turmasComProblemas.sort((a, b) => {
      // Ordenar por severidade (mais problemas primeiro)
      const severidadeA = (a.vagasOcupadas > a.vagasTotal ? 1000 : 0) + (a.totalInscricoes > a.vagasTotal ? 500 : 0)
      const severidadeB = (b.vagasOcupadas > b.vagasTotal ? 1000 : 0) + (b.totalInscricoes > b.vagasTotal ? 500 : 0)
      return severidadeB - severidadeA
    }),
    inscricoesDuplicadas,
    estatisticas: {
      totalTurmas: turmas.length,
      turmasComVagasInvalidas,
      turmasComInscricoesExcedentes,
      totalInscricoes,
      inscricoesFinalizadas,
      inscricoesAtivas,
      inscricoesDuplicadas: inscricoesDuplicadas.length,
    },
  }
}

