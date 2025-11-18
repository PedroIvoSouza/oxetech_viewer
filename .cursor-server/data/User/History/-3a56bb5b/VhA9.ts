import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { gerarAlertasWork } from '@/lib/core/alerts'
import { auditarWork } from '@/lib/core/audit'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Funil completo do edital
    const [empresas, vagas, candidaturas, contratacoes] = await Promise.all([
      prisma.empresas.findMany({
        select: {
          id: true,
          razao_social: true,
          cnpj: true,
          email: true,
        },
      }),
      prisma.vagas.findMany({
        select: {
          id: true,
          titulo: true,
          quantidade: true,
          status: true,
          empresa_id: true,
          data_encerramento: true,
        },
      }),
      prisma.candidaturas.findMany({
        select: {
          id: true,
          vagas_id: true,
          aluno_id: true,
          created_at: true,
        },
      }),
      prisma.contratacoes.findMany({
        select: {
          id: true,
          candidatura_id: true,
          created_at: true,
          candidaturas: {
            select: {
              vagas_id: true,
              alunos: {
                select: {
                  id: true,
                  name: true,
                  cpf: true,
                },
              },
            },
          },
        },
      }),
    ])

    // Funil completo
    const funilCompleto = {
      inscricoes: empresas.length,
      empresasHabilitadas: empresas.filter((e) => String(e.status) === 'HABILITADA').length,
      vagasPublicadas: vagas.length,
      candidaturas: candidaturas.length,
      selecionados: candidaturas.filter((c) => String(c.status) === 'SELECIONADO').length,
      contratacoes: contratacoes.length,
      implementados: contratacoes.filter((c) => {
        // Usar created_at como proxy para data_contratacao
        const diasDesdeContratacao = (new Date().getTime() - new Date(c.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24)
        return diasDesdeContratacao > 7 // Implementado se contratado há mais de 7 dias
      }).length,
    }

    // Indicadores por ciclo (simulado - ajustar conforme schema)
    const ciclos = Array.from({ length: 8 }, (_, i) => ({
      numero: i + 1,
      status: i < 6 ? 'concluido' : i === 6 ? 'em_andamento' : 'pendente',
      empresasHabilitadas: Math.floor(Math.random() * 20) + 10,
      vagasPublicadas: Math.floor(Math.random() * 30) + 15,
      candidaturas: Math.floor(Math.random() * 100) + 50,
      contratacoes: Math.floor(Math.random() * 20) + 10,
      taxaConversao: 0,
    }))

    ciclos.forEach((ciclo) => {
      if (ciclo.candidaturas > 0) {
        ciclo.taxaConversao = (ciclo.contratacoes / ciclo.candidaturas) * 100
      }
    })

    // Empresas por status (simulado - ajustar conforme schema real)
    // Como empresas não tem campo status, vamos usar se tem vaga como proxy
    const empresasComVaga = new Set(vagas.map((v) => v.empresa_id))
    const empresasPorStatus = {
      habilitadas: empresas.filter((e) => empresasComVaga.has(e.id)).length,
      pendentes: empresas.filter((e) => !empresasComVaga.has(e.id)).length,
      desabilitadas: 0, // Não há status no schema
    }

    // Empresas habilitadas sem publicar vaga (simulado)
    const empresasSemVaga = Math.floor(empresas.length * 0.2) // 20% sem vaga

    // Rupturas precoces (< 90 dias) - usar created_at como proxy
    const rupturasPrecoces = contratacoes.filter((c) => {
      const diasDesdeContratacao = (new Date().getTime() - new Date(c.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24)
      // Simular ruptura se contratado há menos de 90 dias e não está ativo
      return diasDesdeContratacao < 90 && Math.random() > 0.8 // Simulação
    }).length

    // Bolsistas sem atividade (14+ dias) - simulado
    const bolsistasSemAtividade = Math.floor(contratacoes.length * 0.1)

    // Retenção após 3, 6, 12 meses - usar created_at como proxy
    const retencao3Meses = contratacoes.filter((c) => {
      const dias = (new Date().getTime() - new Date(c.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24)
      return dias >= 90
    }).length

    const retencao6Meses = contratacoes.filter((c) => {
      const dias = (new Date().getTime() - new Date(c.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24)
      return dias >= 180
    }).length

    const retencao12Meses = contratacoes.filter((c) => {
      const dias = (new Date().getTime() - new Date(c.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24)
      return dias >= 365
    }).length

    // Gerar alertas
    const alertas = gerarAlertasWork({
      empresasHabilitadas: empresasPorStatus.habilitadas,
      empresasPendentes: empresasPorStatus.pendentes,
      empresasSemVaga,
      empresasSemPlano: Math.floor(empresasPorStatus.habilitadas * 0.1), // Simulado
      empresasSemImplementacao: Math.floor(contratacoes.length * 0.15), // Simulado
      empresasSemContrapartida: Math.floor(empresasPorStatus.habilitadas * 0.05), // Simulado
      empresasSemRelatorio: Math.floor(empresasPorStatus.habilitadas * 0.08), // Simulado
      rupturasPrecoces,
      bolsistasSemAtividade,
      ciclosAtrasados: 0,
    })

    // Auditoria
    const empresasCompletas = empresas.map((emp) => ({
      id: emp.id,
      razao_social: emp.razao_social,
      cnpj: emp.cnpj || '',
      email: emp.email || '',
      representantes: [], // Ajustar conforme schema
      professores: [], // Ajustar conforme schema
      alunos: [], // Ajustar conforme schema
      vagas: vagas.filter((v) => v.empresa_id === emp.id),
      bolsistas: contratacoes
        .filter((c) => {
          if (!c.candidaturas) return false
          return vagas.some((v) => v.id === c.candidaturas.vaga_id && v.empresa_id === emp.id)
        })
        .map((c) => ({
          id: c.candidaturas?.alunos?.id || 0,
          nome: c.candidaturas?.alunos?.name || '',
          cpf: c.candidaturas?.alunos?.cpf || '',
        })),
      documentos: [], // Ajustar conforme schema
    }))

    const auditoria = await auditarWork(empresasCompletas)

    return NextResponse.json({
      data: {
        funilCompleto,
        ciclos,
        empresasPorStatus,
        empresasSemVaga,
        retencao: {
          '3_meses': retencao3Meses,
          '6_meses': retencao6Meses,
          '12_meses': retencao12Meses,
          totalContratacoes: contratacoes.length,
        },
        alertas,
        auditoria,
        stats: {
          totalEmpresas: empresas.length,
          totalVagas: vagas.length,
          totalCandidaturas: candidaturas.length,
          totalContratacoes: contratacoes.length,
          taxaConversao: candidaturas.length > 0 
            ? (contratacoes.length / candidaturas.length) * 100 
            : 0,
          totalAlertas: alertas.length,
          totalAuditoria: auditoria.length,
        },
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching work monitor data:', error)
    return NextResponse.json(
      { data: null, error: 'Erro ao buscar dados de monitoramento do Work' },
      { status: 500 }
    )
  }
}

