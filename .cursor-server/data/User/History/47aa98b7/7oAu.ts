import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { gerarAlertasTrilhas } from '@/lib/core/alerts'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Buscar trilhas e inscrições
    const [trilhas, inscricoes] = await Promise.all([
      prisma.trilhas_de_conhecimento.findMany({
        select: {
          id: true,
          titulo: true,
          descricao: true,
          carga_horaria: true,
          created_at: true,
          inscricoes_trilhas_alunos: {
            select: {
              id: true,
              aluno_id: true,
              concluido: true,
              progresso: true,
              created_at: true,
            },
          },
          modulos_trilhas: {
            select: {
              id: true,
              curso_id: true,
              modulos_trilhas_alunos: {
                select: {
                  id: true,
                  curso_concluido: true,
                  created_at: true,
                  updated_at: true,
                },
              },
            },
          },
        },
      }),
      prisma.inscricoes_trilhas_alunos.findMany({
        select: {
          id: true,
          trilha_id: true,
          aluno_id: true,
          concluido: true,
          progresso: true,
          created_at: true,
          updated_at: true,
          alunos: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ])

    // Calcular métricas por trilha
    const trilhasComMetricas = trilhas.map((trilha) => {
      const inscricoesTrilha = inscricoes.filter((i) => i.trilha_id === trilha.id)
      const totalInscritos = inscricoesTrilha.length
      const concluidos = inscricoesTrilha.filter((i) => i.concluido).length
      const progressoMedio = inscricoesTrilha.length > 0
        ? inscricoesTrilha.reduce((acc, i) => acc + (i.progresso || 0), 0) / inscricoesTrilha.length
        : 0
      const taxaConclusao = totalInscritos > 0 ? (concluidos / totalInscritos) * 100 : 0

      // Módulos abandonados (> 30 dias sem atualização)
      const trintaDiasAtras = new Date()
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

      const modulosAbandonados = trilha.modulos_trilhas.reduce((acc, modulo) => {
        const modulosAlunos = modulo.modulos_trilhas_alunos.filter((ma) => {
          const ultimaAtualizacao = ma.updated_at || ma.created_at
          return !ma.curso_concluido && 
                 new Date(ultimaAtualizacao).getTime() < trintaDiasAtras.getTime()
        })
        return acc + modulosAlunos.length
      }, 0)

      return {
        id: trilha.id,
        titulo: trilha.titulo || 'Sem título',
        totalInscritos,
        concluidos,
        progressoMedio,
        taxaConclusao,
        modulosAbandonados,
        cargaHoraria: trilha.carga_horaria || 0,
      }
    })

    // Trilhas com baixa conclusão
    const trilhasBaixaConclusao = trilhasComMetricas
      .filter((t) => t.taxaConclusao < 70)
      .map((t) => ({
        trilha: t.titulo,
        conclusao: t.taxaConclusao,
      }))
      .sort((a, b) => a.conclusao - b.conclusao)

    // Trilhas com queda de performance (> 40%)
    const trilhasQueda = trilhasComMetricas
      .filter((t) => {
        // Simular cálculo de queda (comparar com histórico - ajustar conforme necessário)
        return t.progressoMedio < 40
      })
      .map((t) => ({
        trilha: t.titulo,
        queda: 100 - t.progressoMedio,
      }))
      .sort((a, b) => b.queda - a.queda)

    // Total de módulos abandonados
    const totalModulosAbandonados = trilhasComMetricas.reduce(
      (acc, t) => acc + t.modulosAbandonados,
      0
    )

    // Acessos por período (últimos 30 dias)
    const acessosPorPeriodo = []
    for (let i = 29; i >= 0; i--) {
      const dia = new Date()
      dia.setDate(dia.getDate() - i)
      const diaStr = dia.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

      // Filtrar inscrições criadas/atualizadas neste dia
      const acessos = inscricoes.filter((insc) => {
        const dataInsc = new Date(insc.created_at)
        const dataUpdate = new Date(insc.updated_at)
        return (
          dataInsc.toDateString() === dia.toDateString() ||
          dataUpdate.toDateString() === dia.toDateString()
        )
      }).length

      acessosPorPeriodo.push({
        dia: diaStr,
        acessos,
      })
    }

    // Engajamento por período (últimos 7 dias)
    const engajamentoSemanal = []
    for (let i = 6; i >= 0; i--) {
      const dia = new Date()
      dia.setDate(dia.getDate() - i)
      const diaStr = dia.toLocaleDateString('pt-BR', { weekday: 'short' })

      const acessos = inscricoes.filter((insc) => {
        const dataUpdate = new Date(insc.updated_at)
        return dataUpdate.toDateString() === dia.toDateString()
      }).length

      const concluidos = inscricoes.filter((insc) => {
        if (!insc.concluido) return false
        const dataUpdate = new Date(insc.updated_at)
        return dataUpdate.toDateString() === dia.toDateString()
      }).length

      engajamentoSemanal.push({
        dia: diaStr,
        acessos,
        concluidos,
      })
    }

    // Gerar alertas
    const alertas = gerarAlertasTrilhas({
      trilhasBaixaConclusao,
      modulosAbandonados: totalModulosAbandonados,
      trilhasQueda,
    })

    return NextResponse.json({
      data: {
        trilhasComMetricas,
        trilhasBaixaConclusao,
        trilhasQueda,
        totalModulosAbandonados,
        acessosPorPeriodo,
        engajamentoSemanal,
        alertas,
        stats: {
          totalTrilhas: trilhas.length,
          totalInscritos: inscricoes.length,
          totalConcluidos: inscricoes.filter((i) => i.concluido).length,
          progressoMedioGeral: inscricoes.length > 0
            ? inscricoes.reduce((acc, i) => acc + (i.progresso || 0), 0) / inscricoes.length
            : 0,
          taxaConclusaoGeral: inscricoes.length > 0
            ? (inscricoes.filter((i) => i.concluido).length / inscricoes.length) * 100
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

