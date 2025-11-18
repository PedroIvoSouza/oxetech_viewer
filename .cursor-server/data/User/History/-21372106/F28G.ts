import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { gerarAlertasEdu } from '@/lib/core/alerts'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Buscar escolas, turmas, matrículas e frequências
    const [escolas, turmas, matriculas, frequencias] = await Promise.all([
      prisma.escolas_oxetech_edu.findMany({
        select: {
          id: true,
          nome: true,
          municipio: true,
          turmas_oxetech_edu: {
            select: {
              id: true,
              titulo: true,
              inscricoes_turmas_oxetech_edu: {
                select: {
                  id: true,
                  matricula_id: true,
                },
              },
            },
          },
        },
      }),
      prisma.turmas_oxetech_edu.findMany({
        select: {
          id: true,
          titulo: true,
          escola_id: true,
          inscricoes_turmas_oxetech_edu: {
            select: {
              id: true,
              matricula_id: true,
            },
          },
        },
      }),
      prisma.matriculas_oxetech_edu.findMany({
        select: {
          id: true,
          status: true,
          escola_id: true,
          created_at: true,
        },
      }),
      prisma.frequencias.findMany({
        select: {
          id: true,
          presenca: true,
          ausencia: true,
          data: true,
          matriculas_oxetech_edu: {
            select: {
              id: true,
              escolas_id: true,
              turmas_oxetech_edu: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      }),
    ])

    // Calcular frequência por escola
    const escolasComFrequencia = escolas.map((escola) => {
      const matriculasEscola = matriculas.filter((m) => m.escola_id === escola.id)
      const frequenciasEscola = frequencias.filter((f) => {
        const matriculaId = f.matriculas_oxetech_edu?.id
        const matricula = matriculas.find((m) => m.id === matriculaId)
        return matricula?.escola_id === escola.id
      })

      const totalPresencas = frequenciasEscola.reduce((acc, f) => acc + (f.presenca || 0), 0)
      const totalAusencias = frequenciasEscola.reduce((acc, f) => acc + (f.ausencia || 0), 0)
      const total = totalPresencas + totalAusencias
      const frequencia = total > 0 ? (totalPresencas / total) * 100 : 0

      return {
        id: escola.id,
        nome: escola.nome || 'Sem nome',
        municipio: escola.municipio || 'Sem município',
        totalMatriculas: matriculasEscola.length,
        totalTurmas: escola.turmas_oxetech_edu.length,
        frequencia,
        totalPresencas,
        totalAusencias,
      }
    })

    // Escolas com baixa frequência (< 60%)
    const escolasBaixaFrequencia = escolasComFrequencia
      .filter((e) => e.frequencia < 60)
      .map((e) => ({
        nome: e.nome,
        frequencia: e.frequencia,
      }))
      .sort((a, b) => a.frequencia - b.frequencia)

    // Calcular evasão por curso
    const cursosMap = new Map<string, { 
      curso: string
      totalInicial: number
      totalAtual: number
      evasao: number
    }>()

    turmas.forEach((turma) => {
      const curso = turma.titulo || 'Sem curso'
      const totalInicial = turma.inscricoes_turmas_oxetech_edu.length
      const totalAtual = turma.inscricoes_turmas_oxetech_edu.filter((i) => {
        const matricula = matriculas.find((m) => m.id === i.matricula_id)
        return matricula && String(matricula.status) !== 'ZERO'
      }).length

      if (!cursosMap.has(curso)) {
        cursosMap.set(curso, {
          curso,
          totalInicial: 0,
          totalAtual: 0,
          evasao: 0,
        })
      }

      const dados = cursosMap.get(curso)!
      dados.totalInicial += totalInicial
      dados.totalAtual += totalAtual
    })

    // Calcular evasão
    const cursosComEvasao = Array.from(cursosMap.values()).map((dados) => {
      const evasao = dados.totalInicial > 0
        ? ((dados.totalInicial - dados.totalAtual) / dados.totalInicial) * 100
        : 0
      return {
        curso: dados.curso,
        evasao,
        totalInicial: dados.totalInicial,
        totalAtual: dados.totalAtual,
      }
    })

    // Cursos com alta evasão (> 20%)
    const cursosAltaEvasao = cursosComEvasao
      .filter((c) => c.evasao > 20)
      .sort((a, b) => b.evasao - a.evasao)

    // Ranking de escolas
    const rankingEscolas = escolasComFrequencia
      .map((e) => ({
        escola: e.nome,
        frequencia: e.frequencia,
        totalMatriculas: e.totalMatriculas,
        municipio: e.municipio,
      }))
      .sort((a, b) => b.frequencia - a.frequencia)

    // Heatmap por horário (simulado - ajustar conforme schema)
    const heatmapHorario = [
      { horario: '08:00', frequencia: 85 },
      { horario: '09:00', frequencia: 90 },
      { horario: '10:00', frequencia: 88 },
      { horario: '14:00', frequencia: 75 },
      { horario: '15:00', frequencia: 80 },
      { horario: '16:00', frequencia: 78 },
      { horario: '19:00', frequencia: 70 },
      { horario: '20:00', frequencia: 65 },
    ]

    // Aulas sem presença registrada hoje (simulado)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const frequenciasHoje = frequencias.filter((f) => {
      const dataFreq = new Date(f.data)
      return dataFreq.toDateString() === hoje.toDateString()
    })
    const aulasSemPresenca = turmas.length - Math.ceil(frequenciasHoje.length / 2) // Estimativa

    // Professores com maior variação de frequência (simulado)
    const professoresVariacao = [
      { professor: 'Professor 1', variacao: 25, frequenciaMedia: 75 },
      { professor: 'Professor 2', variacao: 30, frequenciaMedia: 70 },
      { professor: 'Professor 3', variacao: 20, frequenciaMedia: 80 },
    ]

    // Gerar alertas
    const alertas = gerarAlertasEdu({
      escolasBaixaFrequencia,
      cursosAltaEvasao: cursosAltaEvasao.map((c) => ({
        curso: c.curso,
        evasao: c.evasao,
      })),
      aulasSemPresenca,
      professoresSemFrequencia: professoresVariacao.filter((p) => p.frequenciaMedia < 60).length,
    })

    return NextResponse.json({
      data: {
        escolasComFrequencia,
        escolasBaixaFrequencia,
        cursosComEvasao,
        cursosAltaEvasao,
        rankingEscolas,
        heatmapHorario,
        aulasSemPresenca,
        professoresVariacao,
        alertas,
        stats: {
          totalEscolas: escolas.length,
          totalTurmas: turmas.length,
          totalMatriculas: matriculas.length,
          frequenciaGeral: escolasComFrequencia.length > 0
            ? escolasComFrequencia.reduce((acc, e) => acc + e.frequencia, 0) / escolasComFrequencia.length
            : 0,
          taxaEvasaoGeral: cursosComEvasao.length > 0
            ? cursosComEvasao.reduce((acc, c) => acc + c.evasao, 0) / cursosComEvasao.length
            : 0,
          totalAlertas: alertas.length,
        },
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching edu monitor data:', error)
    return NextResponse.json(
      { data: null, error: 'Erro ao buscar dados de monitoramento do Edu' },
      { status: 500 }
    )
  }
}

