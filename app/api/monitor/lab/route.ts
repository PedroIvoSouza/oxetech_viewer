import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { gerarAlertasLab } from '@/lib/core/alerts'
import { auditarLab } from '@/lib/core/audit'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        turmas: [],
        alertas: [],
        auditoria: {
          inconsistencias: [],
          sugestoes: [],
        },
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    // Buscar todas as turmas com presenças
    const turmas = await prisma.turmas.findMany({
      select: {
        id: true,
        titulo: true,
        qtd_vagas_total: true,
        qtd_vagas_preenchidas: true,
        laboratorios: {
          select: {
            nome: true,
            municipio: true,
          },
        },
        oxetechlab_inscricoes: {
          select: {
            id: true,
            alunos: {
              select: {
                id: true,
                name: true,
              },
            },
            status: true,
          },
        },
      },
    })

    // Buscar presenças/ausências (via frequências relacionadas)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // Turmas abertas hoje (últimas 24h)
    const turmasHoje = turmas.filter((turma) => {
      // Simular verificação de turma aberta hoje (ajustar conforme schema)
      return turma.qtd_vagas_preenchidas > 0
    })

    // Calcular presença/ausência por turma
    const turmasComPresenca = turmas.map((turma) => {
      const totalInscritos = turma.oxetechlab_inscricoes.length
      const inscritosAtivos = turma.oxetechlab_inscricoes.filter(
        (insc) => String(insc.status) !== 'ZERO' && String(insc.status) !== 'THREE'
      ).length

      // Simular cálculo de presença (ajustar conforme schema de frequências)
      const presentes = Math.floor(inscritosAtivos * 0.7) // 70% de presença média
      const ausentes = inscritosAtivos - presentes
      const ausenciaPercentual = inscritosAtivos > 0 
        ? (ausentes / inscritosAtivos) * 100 
        : 0

      return {
        id: turma.id,
        titulo: turma.titulo || 'Sem título',
        ausenciaPercentual,
        totalAlunos: inscritosAtivos,
        presentes,
        ausentes,
        frequencia: 100 - ausenciaPercentual,
        ultimaPresenca: new Date(), // Ajustar conforme schema
        escola: turma.laboratorios?.nome || 'Sem escola',
        professor: 'Professor', // Ajustar conforme schema
        laboratorio: turma.laboratorios?.nome || 'Sem laboratório',
        municipio: turma.laboratorios?.municipio || 'Sem município',
      }
    })

    // Ranking de escolas
    const escolasMap = new Map<string, { nome: string; totalTurmas: number; mediaFrequencia: number; totalAlunos: number }>()
    turmasComPresenca.forEach((turma) => {
      const escola = turma.escola
      if (!escolasMap.has(escola)) {
        escolasMap.set(escola, { nome: escola, totalTurmas: 0, mediaFrequencia: 0, totalAlunos: 0 })
      }
      const dados = escolasMap.get(escola)!
      dados.totalTurmas++
      dados.totalAlunos += turma.totalAlunos
      dados.mediaFrequencia = ((dados.mediaFrequencia * (dados.totalTurmas - 1)) + turma.frequencia) / dados.totalTurmas
    })

    const rankingEscolas = Array.from(escolasMap.values())
      .map((escola) => ({
        escola: escola.nome,
        totalTurmas: escola.totalTurmas,
        mediaFrequencia: Math.round(escola.mediaFrequencia),
        totalAlunos: escola.totalAlunos,
      }))
      .sort((a, b) => b.mediaFrequencia - a.mediaFrequencia)

    // Heatmap semanal (últimos 7 dias)
    const heatmapSemanal = []
    for (let i = 6; i >= 0; i--) {
      const dia = new Date()
      dia.setDate(dia.getDate() - i)
      const diaStr = dia.toLocaleDateString('pt-BR', { weekday: 'short' })
      
      // Simular dados (ajustar conforme schema)
      const presencas = Math.floor(Math.random() * 100) + 50
      const total = Math.floor(Math.random() * 150) + 100
      
      heatmapSemanal.push({
        dia: diaStr,
        presencas,
        total,
        percentual: Math.round((presencas / total) * 100),
      })
    }

    // Turmas críticas (ausência > 30%)
    const turmasCriticas = turmasComPresenca
      .filter((t) => t.ausenciaPercentual > 30)
      .sort((a, b) => b.ausenciaPercentual - a.ausenciaPercentual)

    // Turmas sem presença registrada
    const turmasSemPresenca = turmasComPresenca.filter(
      (t) => !t.ultimaPresenca || 
        (new Date().getTime() - new Date(t.ultimaPresenca).getTime()) > 24 * 60 * 60 * 1000
    )

    // Professores com maior evasão (simulado)
    const professoresEvasao = [
      { professor: 'Professor 1', evasao: 45, turmas: 3 },
      { professor: 'Professor 2', evasao: 38, turmas: 2 },
      { professor: 'Professor 3', evasao: 32, turmas: 4 },
    ]

    // Gerar alertas
    const alertas = gerarAlertasLab(turmasComPresenca)

    // Auditoria
    const auditoria = await auditarLab(
      turmasComPresenca.map((t) => ({
        id: t.id,
        titulo: t.titulo,
        professor: t.professor,
        escola: t.escola,
        totalAlunos: t.totalAlunos,
        presencas: t.presentes,
        ausencias: t.ausentes,
        frequencia: t.frequencia,
        ultimaAula: t.ultimaPresenca,
        aulasCadastradas: 10, // Ajustar conforme schema
        aulasRealizadas: 8, // Ajustar conforme schema
      }))
    )

    return NextResponse.json({
      data: {
        turmasAbertasHoje: turmasHoje.length,
        turmasComPresenca,
        rankingEscolas,
        heatmapSemanal,
        turmasCriticas,
        turmasSemPresenca,
        professoresEvasao,
        alertas,
        auditoria,
        stats: {
          totalTurmas: turmas.length,
          totalAlunos: turmasComPresenca.reduce((acc, t) => acc + t.totalAlunos, 0),
          mediaFrequencia: turmasComPresenca.reduce((acc, t) => acc + t.frequencia, 0) / turmasComPresenca.length || 0,
          totalAlertas: alertas.length,
          totalAuditoria: auditoria.length,
        },
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching lab monitor data:', error)
    return NextResponse.json({
      data: {
        turmas: [],
        alertas: [],
        auditoria: {
          inconsistencias: [],
          sugestoes: [],
        },
      },
      error: error instanceof Error ? error.message : 'Erro ao buscar dados de monitoramento do Lab',
    }, { status: 200 })
  }
}

