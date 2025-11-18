import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { gerarAlertasTrilhas } from '@/lib/core/alerts'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Buscar trilhas e inscrições
    const trilhas = await prisma.trilhas_de_conhecimento.findMany({
      select: {
        id: true,
        titulo: true,
        descricao: true,
        carga_horaria: true,
        created_at: true,
        inscricoes_trilhas_alunos: {
          select: {
            id: true,
            concluido: true,
            created_at: true,
            alunos: {
              select: {
                id: true,
                name: true,
              },
            },
            modulos_trilhas_alunos: {
              select: {
                curso_concluido: true,
                created_at: true,
                updated_at: true,
              },
            },
          },
        },
      },
    })

    // Calcular métricas por trilha
    const trilhasComMetricas = trilhas.map((trilha) => {
      const totalInscritos = trilha.inscricoes_trilhas_alunos.length
      const concluidos = trilha.inscricoes_trilhas_alunos.filter((insc) => insc.concluido).length
      const conclusaoPercentual = totalInscritos > 0 ? (concluidos / totalInscritos) * 100 : 0

      // Módulos concluídos vs total
      const totalModulos = trilha.inscricoes_trilhas_alunos.reduce((acc, insc) => {
        return acc + insc.modulos_trilhas_alunos.length
      }, 0)

      const modulosConcluidos = trilha.inscricoes_trilhas_alunos.reduce((acc, insc) => {
        return acc + insc.modulos_trilhas_alunos.filter((mod) => mod.curso_concluido).length
      }, 0)

      // Tempo médio de conclusão (dias)
      const concluidosComData = trilha.inscricoes_trilhas_alunos
        .filter((insc) => insc.concluido && insc.created_at)
        .map((insc) => {
          const dias = (new Date().getTime() - new Date(insc.created_at).getTime()) / (1000 * 60 * 60 * 24)
          return dias
        })

      const tempoMedioConclusao = concluidosComData.length > 0
        ? concluidosComData.reduce((acc, dias) => acc + dias, 0) / concluidosComData.length
        : 0

      // Acessos (últimos 30 dias)
      const acessos30Dias = trilha.inscricoes_trilhas_alunos.filter((insc) => {
        if (!insc.created_at) return false
        const dias = (new Date().getTime() - new Date(insc.created_at).getTime()) / (1000 * 60 * 60 * 24)
        return dias <= 30
      }).length

      // Queda de performance (comparar últimos 30 dias com 30 dias anteriores)
      const acessos60Dias = trilha.inscricoes_trilhas_alunos.filter((insc) => {
        if (!insc.created_at) return false
        const dias = (new Date().getTime() - new Date(insc.created_at).getTime()) / (1000 * 60 * 60 * 24)
        return dias <= 60 && dias > 30
      }).length

      const queda = acessos60Dias > 0
        ? ((acessos60Dias - acessos30Dias) / acessos60Dias) * 100
        : 0

      return {
        id: trilha.id,
        titulo: trilha.titulo || 'Sem título',
        totalInscritos,
        concluidos,
        conclusaoPercentual,
        totalModulos,
        modulosConcluidos,
        tempoMedioConclusao: Math.round(tempoMedioConclusao),
        acessos30Dias,
        queda,
      }
    })

    // Trilhas com baixa conclusão (< 30%)
    const trilhasBaixaConclusao = trilhasComMetricas
      .filter((t) => t.conclusaoPercentual < 30)
      .map((t) => ({
        trilha: t.titulo,
        conclusao: t.conclusaoPercentual,
      }))
      .sort((a, b) => a.conclusao - b.conclusao)

    // Trilhas com queda de performance (> 40%)
    const trilhasQueda = trilhasComMetricas
      .filter((t) => t.queda > 40)
      .map((t) => ({
        trilha: t.titulo,
        queda: t.queda,
      }))
      .sort((a, b) => b.queda - a.queda)

    // Módulos abandonados (sem conclusão há mais de 30 dias)
    const modulosAbandonados = trilhas.reduce((acc, trilha) => {
      const abandonados = trilha.inscricoes_trilhas_alunos.reduce((acc2, insc) => {
        const modulosAbandonadosNaInscricao = insc.modulos_trilhas_alunos.filter((mod) => {
          if (mod.curso_concluido) return false
          if (!mod.updated_at) return true
          const diasSemAtividade = (new Date().getTime() - new Date(mod.updated_at).getTime()) / (1000 * 60 * 60 * 24)
          return diasSemAtividade > 30
        }).length
        return acc2 + modulosAbandonadosNaInscricao
      }, 0)
      return acc + abandonados
    }, 0)

    // Engajamento por período (últimos 12 meses)
    const engajamentoPorPeriodo = []
    for (let i = 11; i >= 0; i--) {
      const mes = new Date()
      mes.setMonth(mes.getMonth() - i)
      const mesStr = mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })

      const inscricoesNoMes = trilhas.reduce((acc, trilha) => {
        return acc + trilha.inscricoes_trilhas_alunos.filter((insc) => {
          if (!insc.created_at) return false
          const dataInscricao = new Date(insc.created_at)
          return dataInscricao.getMonth() === mes.getMonth() &&
            dataInscricao.getFullYear() === mes.getFullYear()
        }).length
      }, 0)

      engajamentoPorPeriodo.push({
        mes: mesStr,
        inscricoes: inscricoesNoMes,
      })
    }

    // Gerar alertas
    const alertas = gerarAlertasTrilhas({
      trilhasBaixaConclusao,
      modulosAbandonados,
      trilhasQueda,
    })

    return NextResponse.json({
      data: {
        trilhasComMetricas,
        trilhasBaixaConclusao,
        trilhasQueda,
        modulosAbandonados,
        engajamentoPorPeriodo,
        alertas,
        stats: {
          totalTrilhas: trilhas.length,
          totalInscritos: trilhasComMetricas.reduce((acc, t) => acc + t.totalInscritos, 0),
          totalConcluidos: trilhasComMetricas.reduce((acc, t) => acc + t.concluidos, 0),
          conclusaoMedia: trilhasComMetricas.length > 0
            ? trilhasComMetricas.reduce((acc, t) => acc + t.conclusaoPercentual, 0) / trilhasComMetricas.length
            : 0,
          tempoMedioConclusao: trilhasComMetricas.length > 0
            ? trilhasComMetricas.reduce((acc, t) => acc + t.tempoMedioConclusao, 0) / trilhasComMetricas.length
            : 0,
          totalAlertas: alertas.length,
        },
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching trilhas monitor data:', error)
    return NextResponse.json(
      { data: null, error: 'Erro ao buscar dados de monitoramento das Trilhas' },
      { status: 500 }
    )
  }
}
