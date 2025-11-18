import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // KPIs Estratégicos
    const [
      totalAlunos,
      totalEmpresas,
      totalContratacoes,
      totalMatriculasEdu,
      totalInscricoesTrilhas,
      totalInscricoesLab,
      certificadosWork,
      certificadosEdu,
      certificadosTrilhas,
      certificadosLab,
    ] = await Promise.all([
      prisma.alunos.count(),
      prisma.empresas.count(),
      prisma.contratacoes.count(),
      prisma.matriculas_oxetech_edu.count(),
      prisma.inscricoes_trilhas_alunos.count(),
      prisma.oxetechlab_inscricoes.count(),
      prisma.contratacoes.count(),
      prisma.matriculas_oxetech_edu.count({
        where: { status: { not: 'ZERO' } },
      }),
      prisma.inscricoes_trilhas_alunos.count({ where: { concluido: true } }),
      prisma.oxetechlab_inscricoes.count({ where: { status: 'TWO' } }),
    ])

    const totalCertificados = certificadosWork + certificadosEdu + certificadosTrilhas + certificadosLab

    // Taxa de Empregabilidade (contratações / total de participantes Work)
    const totalParticipantesWork = await prisma.oxetechwork_inscricao_alunos.count()
    const taxaEmpregabilidade = totalParticipantesWork > 0
      ? (totalContratacoes / totalParticipantesWork) * 100
      : 0

    // Empresas Atendidas
    const empresasAtendidas = await prisma.empresas.count({
      where: {
        vagas: {
          some: {},
        },
      },
    })

    // Participantes Ativos por Eixo
    const participantesAtivos = {
      work: totalParticipantesWork,
      edu: totalMatriculasEdu,
      trilhas: totalInscricoesTrilhas,
      lab: totalInscricoesLab,
    }

    // Indicadores Territoriais (municípios atendidos)
    // Nota: empresas não tem campo municipio diretamente, vamos usar outros campos se disponíveis
    const municipiosWork = await prisma.empresas.findMany({
      select: { id: true },
    })
    const municipiosWorkSet = new Set<string>() // Simular - ajustar conforme schema real

    const municipiosEdu = await prisma.escolas_oxetech_edu.findMany({
      select: { municipio: true },
      distinct: ['municipio'],
    })

    const municipiosLab = await prisma.laboratorios.findMany({
      select: { municipio: true },
      distinct: ['municipio'],
    })

    const municipiosUnicos = new Set([
      ...municipiosWork.map((m) => m.municipio || ''),
      ...municipiosEdu.map((m) => m.municipio || ''),
      ...municipiosLab.map((m) => m.municipio || ''),
    ]).size

    // Execução de Metas (OKRs)
    const okrs = [
      {
        id: 'okr-1',
        titulo: 'Aumentar empregabilidade em TI em Alagoas',
        meta: 1000,
        atual: totalContratacoes,
        percentual: (totalContratacoes / 1000) * 100,
        status: totalContratacoes >= 1000 ? 'concluido' : totalContratacoes >= 800 ? 'em_andamento' : 'atrasado',
      },
      {
        id: 'okr-2',
        titulo: 'Ampliar participação de empresas inovadoras',
        meta: 150,
        atual: empresasAtendidas,
        percentual: (empresasAtendidas / 150) * 100,
        status: empresasAtendidas >= 150 ? 'concluido' : empresasAtendidas >= 120 ? 'em_andamento' : 'atrasado',
      },
      {
        id: 'okr-3',
        titulo: 'Expandir trilhas e formar talentos',
        meta: 5000,
        atual: totalInscricoesTrilhas,
        percentual: (totalInscricoesTrilhas / 5000) * 100,
        status: totalInscricoesTrilhas >= 5000 ? 'concluido' : totalInscricoesTrilhas >= 4000 ? 'em_andamento' : 'atrasado',
      },
      {
        id: 'okr-4',
        titulo: 'Reduzir evasão educacional',
        meta: 80, // Meta de frequência média
        atual: 75, // Simulado - ajustar conforme dados reais
        percentual: (75 / 80) * 100,
        status: 75 >= 80 ? 'concluido' : 75 >= 70 ? 'em_andamento' : 'atrasado',
      },
      {
        id: 'okr-5',
        titulo: 'Criar governança e monitoramento contínuo',
        meta: 100, // 100% de cobertura
        atual: 95, // Simulado
        percentual: 95,
        status: 'em_andamento',
      },
    ]

    // Impacto Social (estimado)
    const impactoSocial = {
      pessoasImpactadas: totalAlunos,
      certificadosEmitidos: totalCertificados,
      empresasParticipantes: totalEmpresas,
      municipiosAtendidos: municipiosUnicos,
      taxaEmpregabilidade,
    }

    // Tendências (últimos 6 meses)
    const seisMesesAtras = new Date()
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)

    const contratacoes6Meses = await prisma.contratacoes.count({
      where: {
        data_contratacao: {
          gte: seisMesesAtras,
        },
      },
    })

    const matriculas6Meses = await prisma.matriculas_oxetech_edu.count({
      where: {
        created_at: {
          gte: seisMesesAtras,
        },
      },
    })

    const tendencias = {
      contratacoes6Meses,
      matriculas6Meses,
      crescimentoContratacoes: ((contratacoes6Meses / Math.max(1, totalContratacoes - contratacoes6Meses)) * 100) || 0,
      crescimentoMatriculas: ((matriculas6Meses / Math.max(1, totalMatriculasEdu - matriculas6Meses)) * 100) || 0,
    }

    return NextResponse.json({
      data: {
        kpis: {
          totalAlunos,
          totalEmpresas,
          totalContratacoes,
          taxaEmpregabilidade: Math.round(taxaEmpregabilidade * 100) / 100,
          empresasAtendidas,
          totalCertificados,
          municipiosAtendidos: municipiosUnicos,
        },
        participantesAtivos,
        impactoSocial,
        okrs,
        tendencias,
        stats: {
          okrsConcluidos: okrs.filter((o) => o.status === 'concluido').length,
          okrsEmAndamento: okrs.filter((o) => o.status === 'em_andamento').length,
          okrsAtrasados: okrs.filter((o) => o.status === 'atrasado').length,
          percentualExecucaoGeral: okrs.reduce((acc, o) => acc + o.percentual, 0) / okrs.length,
        },
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching executive panel data:', error)
    return NextResponse.json(
      { data: null, error: 'Erro ao buscar dados do painel executivo' },
      { status: 500 }
    )
  }
}
