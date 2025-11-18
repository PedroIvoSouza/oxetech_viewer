/**
 * Auditoria Inteligente do Banco de Dados OxeTech
 * 
 * Usa análise de dados e IA para identificar:
 * - Inconsistências nos dados
 * - Valores anômalos
 * - Integridade referencial
 * - Dados duplicados
 * - Problemas de qualidade
 */

import { prisma } from '@/lib/db'
import { cachedQuery, createCacheKey } from '@/lib/cache'
import { queryCache } from '@/lib/cache'

// ============================================
// INTERFACES
// ============================================

export interface AuditoriaFinding {
  id: string
  tipo: 'inconsistencia' | 'anomalia' | 'duplicacao' | 'integridade' | 'qualidade'
  severidade: 'critica' | 'alta' | 'media' | 'baixa'
  modulo: 'lab' | 'work' | 'edu' | 'trilhas' | 'geral'
  titulo: string
  descricao: string
  detalhes: any
  recomendacao: string
  ocorrencias: number
}

export interface AuditoriaCompleta {
  resumo: {
    totalFindings: number
    criticos: number
    altos: number
    medios: number
    baixos: number
    porModulo: Record<string, number>
  }
  findings: AuditoriaFinding[]
  estatisticas: {
    lab: {
      totalTurmas: number
      totalInscricoes: number
      totalCertificados: number
      totalVagas: number
      vagasOcupadas: number
      taxaOcupacao: number
      taxaCertificacao: number
      inconsistencias: string[]
    }
    work: {
      totalEmpresas: number
      totalVagas: number
      totalCandidaturas: number
      totalContratacoes: number
      inconsistencias: string[]
    }
    edu: {
      totalEscolas: number
      totalMatriculas: number
      totalTurmas: number
      inconsistencias: string[]
    }
    trilhas: {
      totalTrilhas: number
      totalInscricoes: number
      totalConcluidos: number
      inconsistencias: string[]
    }
  }
  alertasCriticos: string[]
  recomendacoesPrioritarias: string[]
}

// ============================================
// FUNÇÕES DE AUDITORIA
// ============================================

/**
 * Gerar análise completa de auditoria
 */
export async function gerarAuditoriaCompleta(): Promise<AuditoriaCompleta> {
  const cacheKey = createCacheKey('auditoria-completa', {})

  return cachedQuery(queryCache, cacheKey, async () => {
    const [
      turmas,
      inscricoesLab,
      matriculasCertificadasLab, // Renomeado de certificadosLab
      empresas,
      vagas,
      candidaturas,
      contratacoes,
      escolas,
      matriculasEdu,
      turmasEdu,
      trilhas,
      inscricoesTrilhas,
      alunos,
      laboratorios,
    ] = await Promise.all([
      prisma.turmas.findMany({
        select: {
          id: true,
          titulo: true,
          qtd_vagas_total: true,
          qtd_vagas_preenchidas: true,
          qtd_vagas_disponiveis: true,
          laboratorio_id: true,
          status: true,
          data_inicio: true,
          data_encerramento: true,
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
            },
          },
        },
      }),
      prisma.oxetechlab_inscricoes.findMany({
        select: {
          id: true,
          status: true,
          aluno_id: true,
          turma_id: true,
          created_at: true,
          updated_at: true,
          alunos: {
            select: {
              id: true,
              name: true,
              cpf: true,
              email: true,
            },
          },
          turmas: {
            select: {
              id: true,
              titulo: true,
              qtd_vagas_total: true,
              qtd_vagas_preenchidas: true,
            },
          },
        },
      }),
      // CORRIGIDO: Certificados estão na tabela matriculas (status TWO = APROVADO)
      prisma.matriculas.findMany({
        where: { status: 'TWO' }, // APROVADO = Certificado
        select: {
          id: true,
          aluno_id: true,
          turma_id: true,
          updated_at: true,
          inscricao_id: true,
        },
      }),
      prisma.empresas.findMany({
        select: {
          id: true,
          razao_social: true,
          cnpj: true,
        },
      }),
      prisma.vagas.findMany({
        select: {
          id: true,
          quantidade: true,
          status: true,
          empresa_id: true,
        },
      }),
      prisma.candidaturas.findMany({
        select: {
          id: true,
          vaga_id: true,
          aluno_id: true,
        },
      }),
      prisma.contratacoes.findMany({
        select: {
          id: true,
          candidatura_id: true,
          created_at: true,
        },
      }),
      prisma.escolas_oxetech_edu.findMany({
        select: {
          id: true,
          nome: true,
          municipio: true,
        },
      }),
      prisma.matriculas_oxetech_edu.findMany({
        select: {
          id: true,
          aluno_id: true,
          escola_id: true,
          status: true,
        },
      }),
      prisma.turmas_oxetech_edu.findMany({
        select: {
          id: true,
          titulo: true,
          qtd_vagas_total: true,
          qtd_vagas_preenchidas: true,
          escola_id: true,
        },
      }),
      prisma.trilhas_de_conhecimento.findMany({
        select: {
          id: true,
          titulo: true,
        },
      }),
      prisma.inscricoes_trilhas_alunos.findMany({
        select: {
          id: true,
          concluido: true,
          trilha_id: true,
          aluno_id: true,
        },
      }),
      prisma.alunos.findMany({
        select: {
          id: true,
          name: true,
          cpf: true,
          email: true,
        },
      }),
      prisma.laboratorios.findMany({
        select: {
          id: true,
          nome: true,
          municipio: true,
        },
      }),
    ])

    const findings: AuditoriaFinding[] = []

    // ============================================
    // AUDITORIA LAB
    // ============================================
    const auditoriaLab = await auditarLab(turmas, inscricoesLab, matriculasCertificadasLab, alunos, laboratorios)
    findings.push(...auditoriaLab)

    // ============================================
    // AUDITORIA WORK
    // ============================================
    const auditoriaWork = await auditarWork(empresas, vagas, candidaturas, contratacoes, alunos)
    findings.push(...auditoriaWork)

    // ============================================
    // AUDITORIA EDU
    // ============================================
    const auditoriaEdu = await auditarEdu(escolas, matriculasEdu, turmasEdu, alunos)
    findings.push(...auditoriaEdu)

    // ============================================
    // AUDITORIA TRILHAS
    // ============================================
    const auditoriaTrilhas = await auditarTrilhas(trilhas, inscricoesTrilhas, alunos)
    findings.push(...auditoriaTrilhas)

    // ============================================
    // ESTATÍSTICAS
    // ============================================
    const totalVagasLab = turmas.reduce((acc, t) => acc + (t.qtd_vagas_total || 0), 0)
    const vagasOcupadasLab = turmas.reduce((acc, t) => acc + (t.qtd_vagas_preenchidas || 0), 0)
    const totalCertificadosLab = matriculasCertificadasLab.length
    const taxaOcupacaoLab = totalVagasLab > 0 ? (vagasOcupadasLab / totalVagasLab) * 100 : 0
    const taxaCertificacaoLab = inscricoesLab.length > 0 ? (totalCertificadosLab / inscricoesLab.length) * 100 : 0

    const inconsistenciasLab: string[] = []
    if (taxaOcupacaoLab > 100) inconsistenciasLab.push('Taxa de ocupação > 100%')
    if (vagasOcupadasLab > totalVagasLab) inconsistenciasLab.push('Vagas ocupadas > vagas totais')
    if (totalCertificadosLab > inscricoesLab.length) inconsistenciasLab.push('Certificados > Inscrições')

    const estatisticas = {
      lab: {
        totalTurmas: turmas.length,
        totalInscricoes: inscricoesLab.length,
        totalCertificados: totalCertificadosLab,
        totalVagas: totalVagasLab,
        vagasOcupadas: vagasOcupadasLab,
        taxaOcupacao: taxaOcupacaoLab,
        taxaCertificacao: taxaCertificacaoLab,
        inconsistencias: inconsistenciasLab,
      },
      work: {
        totalEmpresas: empresas.length,
        totalVagas: vagas.reduce((acc, v) => acc + (v.quantidade || 0), 0),
        totalCandidaturas: candidaturas.length,
        totalContratacoes: contratacoes.length,
        inconsistencias: auditoriaWork
          .filter(f => f.severidade === 'critica' || f.severidade === 'alta')
          .map(f => f.titulo),
      },
      edu: {
        totalEscolas: escolas.length,
        totalMatriculas: matriculasEdu.length,
        totalTurmas: turmasEdu.length,
        inconsistencias: auditoriaEdu
          .filter(f => f.severidade === 'critica' || f.severidade === 'alta')
          .map(f => f.titulo),
      },
      trilhas: {
        totalTrilhas: trilhas.length,
        totalInscricoes: inscricoesTrilhas.length,
        totalConcluidos: inscricoesTrilhas.filter(i => i.concluido).length,
        inconsistencias: auditoriaTrilhas
          .filter(f => f.severidade === 'critica' || f.severidade === 'alta')
          .map(f => f.titulo),
      },
    }

    // Resumo
    const resumo = {
      totalFindings: findings.length,
      criticos: findings.filter(f => f.severidade === 'critica').length,
      altos: findings.filter(f => f.severidade === 'alta').length,
      medios: findings.filter(f => f.severidade === 'media').length,
      baixos: findings.filter(f => f.severidade === 'baixa').length,
      porModulo: {
        lab: findings.filter(f => f.modulo === 'lab').length,
        work: findings.filter(f => f.modulo === 'work').length,
        edu: findings.filter(f => f.modulo === 'edu').length,
        trilhas: findings.filter(f => f.modulo === 'trilhas').length,
        geral: findings.filter(f => f.modulo === 'geral').length,
      },
    }

    // Alertas críticos
    const alertasCriticos = findings
      .filter(f => f.severidade === 'critica')
      .map(f => `${f.titulo}: ${f.descricao}`)

    // Recomendações prioritárias
    const recomendacoesPrioritarias = findings
      .filter(f => f.severidade === 'critica' || f.severidade === 'alta')
      .slice(0, 10)
      .map(f => f.recomendacao)

    return {
      resumo,
      findings: findings.sort((a, b) => {
        const severidadeOrder = { critica: 0, alta: 1, media: 2, baixa: 3 }
        return severidadeOrder[a.severidade] - severidadeOrder[b.severidade]
      }),
      estatisticas,
      alertasCriticos,
      recomendacoesPrioritarias,
    }
  }, 5 * 60 * 1000) // Cache de 5 minutos
}

/**
 * Auditar dados do Lab
 */
async function auditarLab(
  turmas: any[],
  inscricoes: any[],
  matriculasCertificadas: any[], // Renomeado de certificados
  alunos: any[],
  laboratorios: any[]
): Promise<AuditoriaFinding[]> {
  const findings: AuditoriaFinding[] = []

  // 1. Verificar vagas vs ocupadas
  const turmasComVagasInvalidas = turmas.filter(t => {
    const ocupadas = t.qtd_vagas_preenchidas || 0
    const total = t.qtd_vagas_total || 0
    const disponiveis = t.qtd_vagas_disponiveis || 0
    return ocupadas > total || ocupadas + disponiveis !== total
  })

  if (turmasComVagasInvalidas.length > 0) {
    findings.push({
      id: 'lab-001',
      tipo: 'inconsistencia',
      severidade: 'critica',
      modulo: 'lab',
      titulo: 'Inconsistência nas Vagas das Turmas',
      descricao: `${turmasComVagasInvalidas.length} turmas têm vagas ocupadas > vagas totais ou soma inconsistente`,
      detalhes: {
        turmas: turmasComVagasInvalidas.map(t => ({
          id: t.id,
          titulo: t.titulo,
          vagasTotal: t.qtd_vagas_total,
          vagasOcupadas: t.qtd_vagas_preenchidas,
          vagasDisponiveis: t.qtd_vagas_disponiveis,
        })),
      },
      recomendacao: 'Revisar e corrigir os campos qtd_vagas_preenchidas, qtd_vagas_total e qtd_vagas_disponiveis das turmas',
      ocorrencias: turmasComVagasInvalidas.length,
    })
  }

  // 2. Verificar inscrições vs vagas
  const turmasComInscricoesExcedentes = turmas.map(t => {
    const inscricoesNaTurma = inscricoes.filter(i => i.turma_id === t.id).length
    const vagasTotal = t.qtd_vagas_total || 0
    return { turma: t, inscricoes: inscricoesNaTurma, vagasTotal }
  }).filter(item => item.inscricoes > item.vagasTotal)

  if (turmasComInscricoesExcedentes.length > 0) {
    findings.push({
      id: 'lab-002',
      tipo: 'inconsistencia',
      severidade: 'alta',
      modulo: 'lab',
      titulo: 'Inscrições Excedem Vagas Totais',
      descricao: `${turmasComInscricoesExcedentes.length} turmas têm mais inscrições do que vagas totais`,
      detalhes: {
        turmas: turmasComInscricoesExcedentes.map(item => ({
          id: item.turma.id,
          titulo: item.turma.titulo,
          inscricoes: item.inscricoes,
          vagasTotal: item.vagasTotal,
        })),
      },
      recomendacao: 'Verificar se as inscrições estão corretas ou se as vagas totais precisam ser atualizadas',
      ocorrencias: turmasComInscricoesExcedentes.length,
    })
  }

  // 3. Verificar certificados > inscrições
  // CORRIGIDO: Certificados agora vêm da tabela matriculas (status TWO = APROVADO)
  if (matriculasCertificadas.length > inscricoes.length) {
    findings.push({
      id: 'lab-003',
      tipo: 'anomalia',
      severidade: 'critica',
      modulo: 'lab',
      titulo: 'Certificados Excedem Inscrições',
      descricao: `Total de certificados (${matriculasCertificadas.length}) é maior que total de inscrições (${inscricoes.length})`,
      detalhes: {
        totalCertificados: matriculasCertificadas.length,
        totalInscricoes: inscricoes.length,
        diferenca: matriculasCertificadas.length - inscricoes.length,
      },
      recomendacao: 'Revisar os critérios de certificação e verificar se há duplicações nos dados. Nota: Certificados vêm da tabela matriculas (status TWO = APROVADO)',
      ocorrencias: 1,
    })
  }

  // 4. Verificar alunos sem CPF ou email
  const alunosSemDados = alunos.filter(a => !a.cpf || !a.email)
  if (alunosSemDados.length > 0) {
    findings.push({
      id: 'lab-004',
      tipo: 'qualidade',
      severidade: 'media',
      modulo: 'lab',
      titulo: 'Alunos com Dados Incompletos',
      descricao: `${alunosSemDados.length} alunos não têm CPF ou email cadastrado`,
      detalhes: {
        alunos: alunosSemDados.map(a => ({
          id: a.id,
          name: a.name,
          temCPF: !!a.cpf,
          temEmail: !!a.email,
        })),
      },
      recomendacao: 'Completar os dados cadastrais dos alunos para melhor qualidade dos dados',
      ocorrencias: alunosSemDados.length,
    })
  }

  // 5. Verificar inscrições com status inválido
  const inscricoesComStatusInvalido = inscricoes.filter(i => !i.status || !['ZERO', 'ONE', 'TWO', 'THREE'].includes(String(i.status)))
  if (inscricoesComStatusInvalido.length > 0) {
    findings.push({
      id: 'lab-005',
      tipo: 'qualidade',
      severidade: 'alta',
      modulo: 'lab',
      titulo: 'Inscrições com Status Inválido',
      descricao: `${inscricoesComStatusInvalido.length} inscrições têm status inválido ou nulo`,
      detalhes: {
        inscricoes: inscricoesComStatusInvalido.map(i => ({
          id: i.id,
          aluno: i.alunos?.name,
          status: i.status,
        })),
      },
      recomendacao: 'Corrigir os status das inscrições para valores válidos (ZERO, ONE, TWO, THREE)',
      ocorrencias: inscricoesComStatusInvalido.length,
    })
  }

  // 6. Verificar turmas sem laboratório
  const turmasSemLaboratorio = turmas.filter(t => !t.laboratorio_id || !t.laboratorios)
  if (turmasSemLaboratorio.length > 0) {
    findings.push({
      id: 'lab-006',
      tipo: 'integridade',
      severidade: 'alta',
      modulo: 'lab',
      titulo: 'Turmas sem Laboratório Associado',
      descricao: `${turmasSemLaboratorio.length} turmas não têm laboratório associado`,
      detalhes: {
        turmas: turmasSemLaboratorio.map(t => ({
          id: t.id,
          titulo: t.titulo,
          laboratorioId: t.laboratorio_id,
        })),
      },
      recomendacao: 'Associar todas as turmas a um laboratório válido',
      ocorrencias: turmasSemLaboratorio.length,
    })
  }

  // 7. Verificar laboratórios sem turmas
  const laboratoriosIds = new Set(laboratorios.map(l => l.id))
  const turmasLaboratoriosIds = new Set(turmas.map(t => t.laboratorio_id).filter(Boolean))
  const laboratoriosSemTurmas = Array.from(laboratoriosIds).filter(id => !turmasLaboratoriosIds.has(id))
  
  if (laboratoriosSemTurmas.length > 0) {
    findings.push({
      id: 'lab-007',
      tipo: 'qualidade',
      severidade: 'baixa',
      modulo: 'lab',
      titulo: 'Laboratórios sem Turmas',
      descricao: `${laboratoriosSemTurmas.length} laboratórios não têm turmas associadas`,
      detalhes: {
        laboratorios: laboratoriosSemTurmas.map(id => {
          const lab = laboratorios.find(l => l.id === id)
          return lab ? { id: lab.id, nome: lab.nome, municipio: lab.municipio } : { id }
        }),
      },
      recomendacao: 'Verificar se esses laboratórios estão ativos ou se precisam de turmas',
      ocorrencias: laboratoriosSemTurmas.length,
    })
  }

  // 8. Verificar taxa de certificação muito baixa (< 5%)
  const taxaCertificacao = inscricoes.length > 0 ? (certificados.length / inscricoes.length) * 100 : 0
  if (taxaCertificacao > 0 && taxaCertificacao < 5) {
    findings.push({
      id: 'lab-008',
      tipo: 'anomalia',
      severidade: 'media',
      modulo: 'lab',
      titulo: 'Taxa de Certificação Muito Baixa',
      descricao: `Taxa de certificação é ${taxaCertificacao.toFixed(2)}%, o que pode indicar problemas nos dados`,
      detalhes: {
        taxaCertificacao,
        totalInscricoes: inscricoes.length,
        totalCertificados: certificados.length,
      },
      recomendacao: 'Verificar se os status de certificação estão sendo atualizados corretamente',
      ocorrencias: 1,
    })
  }

  // 9. Verificar taxa de certificação muito alta (> 95%)
  if (taxaCertificacao > 95) {
    findings.push({
      id: 'lab-009',
      tipo: 'anomalia',
      severidade: 'media',
      modulo: 'lab',
      titulo: 'Taxa de Certificação Muito Alta',
      descricao: `Taxa de certificação é ${taxaCertificacao.toFixed(2)}%, o que pode indicar que todos estão sendo certificados automaticamente`,
      detalhes: {
        taxaCertificacao,
        totalInscricoes: inscricoes.length,
        totalCertificados: certificados.length,
      },
      recomendacao: 'Verificar se os critérios de certificação estão corretos',
      ocorrencias: 1,
    })
  }

  // 10. Verificar duplicação de inscrições (mesmo aluno, mesma turma)
  const inscricoesPorAlunoTurma = new Map<string, number>()
  inscricoes.forEach(insc => {
    const key = `${insc.aluno_id}-${insc.turma_id}`
    inscricoesPorAlunoTurma.set(key, (inscricoesPorAlunoTurma.get(key) || 0) + 1)
  })
  const inscricoesDuplicadas = Array.from(inscricoesPorAlunoTurma.entries())
    .filter(([_, count]) => count > 1)
    .map(([key, count]) => {
      const [alunoId, turmaId] = key.split('-')
      const insc = inscricoes.find(i => i.aluno_id === Number(alunoId) && i.turma_id === Number(turmaId))
      return { alunoId: Number(alunoId), turmaId: Number(turmaId), count, insc }
    })

  if (inscricoesDuplicadas.length > 0) {
    findings.push({
      id: 'lab-010',
      tipo: 'duplicacao',
      severidade: 'alta',
      modulo: 'lab',
      titulo: 'Inscrições Duplicadas',
      descricao: `${inscricoesDuplicadas.length} alunos têm múltiplas inscrições na mesma turma`,
      detalhes: {
        inscricoes: inscricoesDuplicadas.map(d => ({
          alunoId: d.alunoId,
          alunoName: d.insc?.alunos?.name,
          turmaId: d.turmaId,
          turmaTitulo: d.insc?.turmas?.titulo,
          quantidade: d.count,
        })),
      },
      recomendacao: 'Remover inscrições duplicadas, mantendo apenas uma por aluno por turma',
      ocorrencias: inscricoesDuplicadas.length,
    })
  }

  return findings
}

/**
 * Auditar dados do Work
 */
async function auditarWork(
  empresas: any[],
  vagas: any[],
  candidaturas: any[],
  contratacoes: any[],
  alunos: any[]
): Promise<AuditoriaFinding[]> {
  const findings: AuditoriaFinding[] = []

  // 1. Verificar empresas sem CNPJ
  const empresasSemCNPJ = empresas.filter(e => !e.cnpj)
  if (empresasSemCNPJ.length > 0) {
    findings.push({
      id: 'work-001',
      tipo: 'qualidade',
      severidade: 'alta',
      modulo: 'work',
      titulo: 'Empresas sem CNPJ',
      descricao: `${empresasSemCNPJ.length} empresas não têm CNPJ cadastrado`,
      detalhes: {
        empresas: empresasSemCNPJ.map(e => ({
          id: e.id,
          razao_social: e.razao_social,
        })),
      },
      recomendacao: 'Completar o CNPJ de todas as empresas',
      ocorrencias: empresasSemCNPJ.length,
    })
  }

  // 2. Verificar vagas sem empresa
  const vagasSemEmpresa = vagas.filter(v => !v.empresa_id)
  if (vagasSemEmpresa.length > 0) {
    findings.push({
      id: 'work-002',
      tipo: 'integridade',
      severidade: 'alta',
      modulo: 'work',
      titulo: 'Vagas sem Empresa Associada',
      descricao: `${vagasSemEmpresa.length} vagas não têm empresa associada`,
      detalhes: {
        vagas: vagasSemEmpresa.map(v => ({
          id: v.id,
          quantidade: v.quantidade,
        })),
      },
      recomendacao: 'Associar todas as vagas a uma empresa válida',
      ocorrencias: vagasSemEmpresa.length,
    })
  }

  // 3. Verificar candidaturas sem vaga
  const candidaturasSemVaga = candidaturas.filter(c => !c.vaga_id)
  if (candidaturasSemVaga.length > 0) {
    findings.push({
      id: 'work-003',
      tipo: 'integridade',
      severidade: 'alta',
      modulo: 'work',
      titulo: 'Candidaturas sem Vaga',
      descricao: `${candidaturasSemVaga.length} candidaturas não têm vaga associada`,
      detalhes: {
        candidaturas: candidaturasSemVaga.map(c => ({
          id: c.id,
          alunoId: c.aluno_id,
        })),
      },
      recomendacao: 'Associar todas as candidaturas a uma vaga válida',
      ocorrencias: candidaturasSemVaga.length,
    })
  }

  // 4. Verificar contratacoes > vagas
  if (contratacoes.length > vagas.reduce((acc, v) => acc + (v.quantidade || 0), 0)) {
    findings.push({
      id: 'work-004',
      tipo: 'anomalia',
      severidade: 'alta',
      modulo: 'work',
      titulo: 'Contratações Excedem Vagas',
      descricao: `Total de contratações (${contratacoes.length}) é maior que total de vagas disponíveis`,
      detalhes: {
        totalContratacoes: contratacoes.length,
        totalVagas: vagas.reduce((acc, v) => acc + (v.quantidade || 0), 0),
      },
      recomendacao: 'Verificar se as vagas estão corretas ou se há duplicações nas contratações',
      ocorrencias: 1,
    })
  }

  return findings
}

/**
 * Auditar dados do Edu
 */
async function auditarEdu(
  escolas: any[],
  matriculas: any[],
  turmas: any[],
  alunos: any[]
): Promise<AuditoriaFinding[]> {
  const findings: AuditoriaFinding[] = []

  // 1. Verificar matrículas sem escola
  const matriculasSemEscola = matriculas.filter(m => !m.escola_id)
  if (matriculasSemEscola.length > 0) {
    findings.push({
      id: 'edu-001',
      tipo: 'integridade',
      severidade: 'alta',
      modulo: 'edu',
      titulo: 'Matrículas sem Escola',
      descricao: `${matriculasSemEscola.length} matrículas não têm escola associada`,
      detalhes: {
        matriculas: matriculasSemEscola.map(m => ({
          id: m.id,
          alunoId: m.aluno_id,
        })),
      },
      recomendacao: 'Associar todas as matrículas a uma escola válida',
      ocorrencias: matriculasSemEscola.length,
    })
  }

  // 2. Verificar turmas sem escola
  const turmasSemEscola = turmas.filter(t => !t.escola_id)
  if (turmasSemEscola.length > 0) {
    findings.push({
      id: 'edu-002',
      tipo: 'integridade',
      severidade: 'alta',
      modulo: 'edu',
      titulo: 'Turmas sem Escola',
      descricao: `${turmasSemEscola.length} turmas não têm escola associada`,
      detalhes: {
        turmas: turmasSemEscola.map(t => ({
          id: t.id,
          titulo: t.titulo,
        })),
      },
      recomendacao: 'Associar todas as turmas a uma escola válida',
      ocorrencias: turmasSemEscola.length,
    })
  }

  // 3. Verificar vagas vs ocupadas
  const turmasComVagasInvalidas = turmas.filter(t => {
    const ocupadas = t.qtd_vagas_preenchidas || 0
    const total = t.qtd_vagas_total || 0
    return ocupadas > total
  })

  if (turmasComVagasInvalidas.length > 0) {
    findings.push({
      id: 'edu-003',
      tipo: 'inconsistencia',
      severidade: 'alta',
      modulo: 'edu',
      titulo: 'Inconsistência nas Vagas das Turmas Edu',
      descricao: `${turmasComVagasInvalidas.length} turmas têm vagas ocupadas > vagas totais`,
      detalhes: {
        turmas: turmasComVagasInvalidas.map(t => ({
          id: t.id,
          titulo: t.titulo,
          vagasTotal: t.qtd_vagas_total,
          vagasOcupadas: t.qtd_vagas_preenchidas,
        })),
      },
      recomendacao: 'Revisar e corrigir os campos qtd_vagas_preenchidas e qtd_vagas_total das turmas',
      ocorrencias: turmasComVagasInvalidas.length,
    })
  }

  return findings
}

/**
 * Auditar dados das Trilhas
 */
async function auditarTrilhas(
  trilhas: any[],
  inscricoes: any[],
  alunos: any[]
): Promise<AuditoriaFinding[]> {
  const findings: AuditoriaFinding[] = []

  // 1. Verificar inscrições sem trilha
  const inscricoesSemTrilha = inscricoes.filter(i => !i.trilha_id)
  if (inscricoesSemTrilha.length > 0) {
    findings.push({
      id: 'trilhas-001',
      tipo: 'integridade',
      severidade: 'alta',
      modulo: 'trilhas',
      titulo: 'Inscrições sem Trilha',
      descricao: `${inscricoesSemTrilha.length} inscrições não têm trilha associada`,
      detalhes: {
        inscricoes: inscricoesSemTrilha.map(i => ({
          id: i.id,
          alunoId: i.aluno_id,
        })),
      },
      recomendacao: 'Associar todas as inscrições a uma trilha válida',
      ocorrencias: inscricoesSemTrilha.length,
    })
  }

  // 2. Verificar taxa de conclusão muito baixa (< 1%)
  const totalConcluidos = inscricoes.filter(i => i.concluido).length
  const taxaConclusao = inscricoes.length > 0 ? (totalConcluidos / inscricoes.length) * 100 : 0
  if (inscricoes.length > 0 && taxaConclusao < 1) {
    findings.push({
      id: 'trilhas-002',
      tipo: 'anomalia',
      severidade: 'media',
      modulo: 'trilhas',
      titulo: 'Taxa de Conclusão Muito Baixa',
      descricao: `Taxa de conclusão é ${taxaConclusao.toFixed(2)}%, o que pode indicar problemas nos dados`,
      detalhes: {
        taxaConclusao,
        totalInscricoes: inscricoes.length,
        totalConcluidos,
      },
      recomendacao: 'Verificar se o campo "concluido" está sendo atualizado corretamente',
      ocorrencias: 1,
    })
  }

  // 3. Verificar trilhas sem inscrições
  const trilhasIds = new Set(trilhas.map(t => t.id))
  const inscricoesTrilhasIds = new Set(inscricoes.map(i => i.trilha_id).filter(Boolean))
  const trilhasSemInscricoes: number[] = []
  trilhasIds.forEach(id => {
    if (!inscricoesTrilhasIds.has(id)) {
      trilhasSemInscricoes.push(id)
    }
  })
  
  if (trilhasSemInscricoes.length > 0) {
    findings.push({
      id: 'trilhas-003',
      tipo: 'qualidade',
      severidade: 'baixa',
      modulo: 'trilhas',
      titulo: 'Trilhas sem Inscrições',
      descricao: `${trilhasSemInscricoes.length} trilhas não têm inscrições associadas`,
      detalhes: {
        trilhas: trilhasSemInscricoes.map(id => {
          const trilha = trilhas.find(t => t.id === id)
          return trilha ? { id: trilha.id, titulo: trilha.titulo } : { id }
        }),
      },
      recomendacao: 'Verificar se essas trilhas estão ativas ou se precisam de divulgação',
      ocorrencias: trilhasSemInscricoes.length,
    })
  }

  return findings
}

