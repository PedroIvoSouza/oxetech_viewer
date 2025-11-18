import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // KPIs estratégicos - Impacto Social
    const [
      totalAlunos,
      totalEmpresas,
      totalContratacoes,
      totalCertificados,
      totalMunicipios,
      totalEscolas,
      contratacoes,
      matriculasEdu,
      inscricoesLab,
      inscricoesTrilhas,
    ] = await Promise.all([
      prisma.alunos.count(),
      prisma.empresas.count(),
      prisma.contratacoes.count(),
      prisma.contratacoes.count(), // Usar contratacoes como proxy para certificados
      prisma.alunos.findMany({
        select: {
          municipio: true,
        },
        distinct: ['municipio'],
      }).then((result) => result.length),
      prisma.escolas_oxetech_edu.count(),
      prisma.contratacoes.findMany({
        select: {
          data_contratacao: true,
          alunos: {
            select: {
              municipio: true,
            },
          },
        },
      }),
      prisma.matriculas_oxetech_edu.findMany({
        select: {
          created_at: true,
          status: true,
        },
      }),
      prisma.oxetechlab_inscricoes.findMany({
        select: {
          created_at: true,
          status: true,
        },
      }),
      prisma.inscricoes_trilhas_alunos.findMany({
        select: {
          created_at: true,
          concluido: true,
        },
      }),
    ])

    // Taxa de empregabilidade
    const taxaEmpregabilidade = totalAlunos > 0 
      ? (totalContratacoes / totalAlunos) * 100 
      : 0

    // Participantes ativos por eixo
    const participantesAtivos = {
      work: contratacoes.filter((c) => {
        const dias = (new Date().getTime() - new Date(c.data_contratacao).getTime()) / (1000 * 60 * 60 * 24)
        return dias <= 365 // Ativo se contratado há menos de 1 ano
      }).length,
      edu: matriculasEdu.filter((m) => String(m.status) !== 'ZERO').length,
      lab: inscricoesLab.filter((i) => String(i.status) !== 'ZERO' && String(i.status) !== 'THREE').length,
      trilhas: inscricoesTrilhas.filter((i) => !i.concluido).length,
    }

    // Indicadores territoriais
    const municipiosAtendidos = new Set<string>()
    contratacoes.forEach((c) => {
      if (c.alunos?.municipio) {
        municipiosAtendidos.add(c.alunos.municipio)
      }
    })

    // Execução de metas (simulado - ajustar conforme metas reais)
    const metas = {
      contratacoes: {
        meta: 500,
        realizado: totalContratacoes,
        percentual: totalContratacoes > 0 ? (totalContratacoes / 500) * 100 : 0,
      },
      certificados: {
        meta: 400,
        realizado: totalCertificados,
        percentual: totalCertificados > 0 ? (totalCertificados / 400) * 100 : 0,
      },
      municipios: {
        meta: 50,
        realizado: totalMunicipios,
        percentual: totalMunicipios > 0 ? (totalMunicipios / 50) * 100 : 0,
      },
      empresas: {
        meta: 100,
        realizado: totalEmpresas,
        percentual: totalEmpresas > 0 ? (totalEmpresas / 100) * 100 : 0,
      },
    }

    // OKRs estratégicos
    const okrs = [
      {
        objetivo: 'Aumentar a empregabilidade em TI em Alagoas',
        resultadoChave1: {
          nome: 'Taxa de empregabilidade',
          valor: taxaEmpregabilidade.toFixed(1),
          unidade: '%',
          status: taxaEmpregabilidade >= 30 ? 'atingido' : taxaEmpregabilidade >= 20 ? 'em_andamento' : 'atrasado',
        },
        resultadoChave2: {
          nome: 'Empresas atendidas',
          valor: totalEmpresas,
          unidade: 'empresas',
          status: totalEmpresas >= 100 ? 'atingido' : totalEmpresas >= 70 ? 'em_andamento' : 'atrasado',
        },
      },
      {
        objetivo: 'Ampliar participação de empresas inovadoras',
        resultadoChave1: {
          nome: 'Empresas cadastradas',
          valor: totalEmpresas,
          unidade: 'empresas',
          status: totalEmpresas >= 100 ? 'atingido' : totalEmpresas >= 70 ? 'em_andamento' : 'atrasado',
        },
        resultadoChave2: {
          nome: 'Contratações realizadas',
          valor: totalContratacoes,
          unidade: 'contratações',
          status: totalContratacoes >= 500 ? 'atingido' : totalContratacoes >= 350 ? 'em_andamento' : 'atrasado',
        },
      },
      {
        objetivo: 'Expandir trilhas e formar talentos',
        resultadoChave1: {
          nome: 'Participantes ativos em trilhas',
          valor: participantesAtivos.trilhas,
          unidade: 'participantes',
          status: participantesAtivos.trilhas >= 1000 ? 'atingido' : participantesAtivos.trilhas >= 700 ? 'em_andamento' : 'atrasado',
        },
        resultadoChave2: {
          nome: 'Taxa de conclusão de trilhas',
          valor: inscricoesTrilhas.length > 0
            ? (inscricoesTrilhas.filter((i) => i.concluido).length / inscricoesTrilhas.length) * 100
            : 0,
          unidade: '%',
          status: inscricoesTrilhas.length > 0 && (inscricoesTrilhas.filter((i) => i.concluido).length / inscricoesTrilhas.length) * 100 >= 60
            ? 'atingido'
            : 'em_andamento',
        },
      },
      {
        objetivo: 'Reduzir evasão educacional',
        resultadoChave1: {
          nome: 'Taxa de frequência Edu',
          valor: 75, // Simulado - ajustar conforme cálculo real
          unidade: '%',
          status: 75 >= 80 ? 'atingido' : 75 >= 70 ? 'em_andamento' : 'atrasado',
        },
        resultadoChave2: {
          nome: 'Taxa de evasão',
          valor: 15, // Simulado - ajustar conforme cálculo real
          unidade: '%',
          status: 15 <= 10 ? 'atingido' : 15 <= 20 ? 'em_andamento' : 'atrasado',
        },
      },
    ]

    // Tendências (evolução mensal)
    const tendencias = []
    for (let i = 11; i >= 0; i--) {
      const mes = new Date()
      mes.setMonth(mes.getMonth() - i)
      const mesStr = mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })

      const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1)
      const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)

      const contratacoesMes = contratacoes.filter((c) => {
        const data = new Date(c.data_contratacao)
        return data >= inicioMes && data <= fimMes
      }).length

      tendencias.push({
        mes: mesStr,
        contratacoes: contratacoesMes,
        matriculas: matriculasEdu.filter((m) => {
          const data = new Date(m.created_at)
          return data >= inicioMes && data <= fimMes
        }).length,
        inscricoesLab: inscricoesLab.filter((i) => {
          const data = new Date(i.created_at)
          return data >= inicioMes && data <= fimMes
        }).length,
        inscricoesTrilhas: inscricoesTrilhas.filter((i) => {
          const data = new Date(i.created_at)
          return data >= inicioMes && data <= fimMes
        }).length,
      })
    }

    // Oportunidades (simulado)
    const oportunidades = [
      {
        titulo: 'Expansão para novos municípios',
        descricao: `${50 - totalMunicipios} municípios ainda não atendidos`,
        prioridade: 'alta',
        impacto: 'alto',
      },
      {
        titulo: 'Aumentar retenção de bolsistas',
        descricao: 'Oportunidade de melhorar taxa de retenção após 12 meses',
        prioridade: 'media',
        impacto: 'medio',
      },
      {
        titulo: 'Diversificação de cursos',
        descricao: 'Expandir oferta de cursos técnicos',
        prioridade: 'baixa',
        impacto: 'medio',
      },
    ]

    return NextResponse.json({
      data: {
        impactoSocial: {
          totalAlunos,
          totalEmpresas,
          totalContratacoes,
          totalCertificados,
          totalMunicipios,
          taxaEmpregabilidade,
        },
        participantesAtivos,
        indicadoresTerritoriais: {
          municipiosAtendidos: municipiosAtendidos.size,
          municipios: Array.from(municipiosAtendidos),
        },
        execucaoMetas: metas,
        okrs,
        tendencias,
        oportunidades,
        stats: {
          totalParticipantes: participantesAtivos.work + participantesAtivos.edu + participantesAtivos.lab + participantesAtivos.trilhas,
          taxaExecucaoGeral: Object.values(metas).reduce((acc, m) => acc + m.percentual, 0) / Object.keys(metas).length,
        },
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching executivo monitor data:', error)
    return NextResponse.json(
      { data: null, error: 'Erro ao buscar dados do painel executivo' },
      { status: 500 }
    )
  }
}

