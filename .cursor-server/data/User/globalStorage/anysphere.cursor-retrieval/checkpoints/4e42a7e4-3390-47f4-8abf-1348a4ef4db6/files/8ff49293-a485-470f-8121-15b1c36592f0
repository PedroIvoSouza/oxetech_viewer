/**
 * Business Intelligence (BI) - Análises Estratégicas
 * 
 * Este módulo contém análises avançadas de BI para o OxeTech Dashboard
 * Focado em insights estratégicos para gestores públicos
 */

import { prisma } from '@/lib/db'
import { normalizarCurso } from '@/lib/course-normalizer'
import { cachedQuery, createCacheKey } from '@/lib/cache'
import { queryCache } from '@/lib/cache'

// ============================================
// 1. ANÁLISE DE IMPACTO SOCIAL
// ============================================

export interface ImpactoSocial {
  totalAlunosImpactados: number
  totalCertificados: number
  totalEmpresasAtendidas: number
  totalMunicipiosAtendidos: number
  taxaEmpregabilidade: number
  distribuicaoPorGenero: {
    masculino: number
    feminino: number
    outro: number
    naoInformado: number
  }
  distribuicaoPorFaixaEtaria: Array<{
    faixa: string
    total: number
    percentual: number
  }>
  distribuicaoPorMunicipio: Array<{
    municipio: string
    totalAlunos: number
    totalEmpresas: number
    totalCertificados: number
    rank: number
  }>
  distribuicaoPorEixo: {
    work: { total: number; certificados: number }
    edu: { total: number; certificados: number }
    trilhas: { total: number; certificados: number }
    lab: { total: number; certificados: number }
  }
}

export async function analisarImpactoSocial(): Promise<ImpactoSocial> {
  const cacheKey = createCacheKey('bi-impacto-social', {})
  
  return cachedQuery(queryCache, cacheKey, async () => {
    // Total de alunos únicos (não duplicados)
    const totalAlunos = await prisma.alunos.count()
    
    // Alunos por gênero
    const alunosPorGenero = await prisma.alunos.groupBy({
      by: ['genero'],
      _count: true,
    })
    
    // Alunos por município
    const alunosPorMunicipio = await prisma.alunos.groupBy({
      by: ['municipio'],
      _count: true,
    })
    
    // Calcular faixas etárias
    const alunosComDataNascimento = await prisma.alunos.findMany({
      select: {
        data_nascimento: true,
      },
    })
    
    const faixasEtarias = {
      '16-20': 0,
      '21-25': 0,
      '26-30': 0,
      '31-35': 0,
      '36-40': 0,
      '41-50': 0,
      '50+': 0,
    }
    
    alunosComDataNascimento.forEach((aluno) => {
      const idade = new Date().getFullYear() - new Date(aluno.data_nascimento).getFullYear()
      if (idade >= 16 && idade <= 20) faixasEtarias['16-20']++
      else if (idade <= 25) faixasEtarias['21-25']++
      else if (idade <= 30) faixasEtarias['26-30']++
      else if (idade <= 35) faixasEtarias['31-35']++
      else if (idade <= 40) faixasEtarias['36-40']++
      else if (idade <= 50) faixasEtarias['41-50']++
      else faixasEtarias['50+']++
    })
    
    // Certificados por eixo
    const [
      certificadosWork,
      certificadosEdu,
      certificadosTrilhas,
      certificadosLab,
    ] = await Promise.all([
      prisma.contratacoes.count(),
      prisma.matriculas_oxetech_edu.count({
        where: { status: { not: 'ZERO' } },
      }),
      prisma.inscricoes_trilhas_alunos.count({ where: { concluido: true } }),
      // CORRIGIDO: Certificados Lab vêm da tabela matriculas (status TWO = APROVADO)
      prisma.matriculas.count({ where: { status: 'TWO' } }),
    ])
    
    // Total de empresas
    const totalEmpresas = await prisma.empresas.count({
      where: {
        vagas: {
          some: {},
        },
      },
    })
    
    // Municípios atendidos (união de todas as fontes)
    const municipiosWork = await prisma.empresas.findMany({
      select: { endereco: true },
      distinct: ['endereco'],
    })
    
    const municipiosEdu = await prisma.escolas_oxetech_edu.findMany({
      select: { municipio: true },
      distinct: ['municipio'],
    })
    
    const municipiosLab = await prisma.laboratorios.findMany({
      select: { municipio: true },
      distinct: ['municipio'],
    })
    
    const municipiosUnicos = new Set<string>()
    alunosPorMunicipio.forEach((a) => {
      if (a.municipio) municipiosUnicos.add(a.municipio)
    })
    municipiosEdu.forEach((m) => {
      if (m.municipio) municipiosUnicos.add(m.municipio)
    })
    municipiosLab.forEach((m) => {
      if (m.municipio) municipiosUnicos.add(m.municipio)
    })
    
    // Distribuição por município (top 20)
    const municipiosRanking = alunosPorMunicipio
      .map((m) => ({
        municipio: m.municipio || 'Não informado',
        totalAlunos: m._count,
        totalEmpresas: 0, // Será calculado depois
        totalCertificados: 0, // Será calculado depois
      }))
      .sort((a, b) => b.totalAlunos - a.totalAlunos)
      .slice(0, 20)
      .map((m, index) => ({
        ...m,
        rank: index + 1,
      }))
    
    // Taxa de empregabilidade
    const totalParticipantesWork = await prisma.oxetechwork_inscricao_alunos.count()
    const taxaEmpregabilidade = totalParticipantesWork > 0
      ? (certificadosWork / totalParticipantesWork) * 100
      : 0
    
    // Distribuição por gênero
    const distribuicaoGenero = {
      masculino: alunosPorGenero.find((g) => g.genero?.toLowerCase().includes('masc'))?._count || 0,
      feminino: alunosPorGenero.find((g) => g.genero?.toLowerCase().includes('femi'))?._count || 0,
      outro: alunosPorGenero.find((g) => !g.genero || (g.genero !== 'Masculino' && g.genero !== 'Feminino'))?._count || 0,
      naoInformado: alunosPorGenero.find((g) => !g.genero || g.genero === 'Desconhecido')?._count || 0,
    }
    
    // Participantes por eixo
    const participantesWork = await prisma.oxetechwork_inscricao_alunos.count()
    const participantesEdu = await prisma.matriculas_oxetech_edu.count()
    const participantesTrilhas = await prisma.inscricoes_trilhas_alunos.count()
    const participantesLab = await prisma.oxetechlab_inscricoes.count()
    
    return {
      totalAlunosImpactados: totalAlunos,
      totalCertificados: certificadosWork + certificadosEdu + certificadosTrilhas + certificadosLab,
      totalEmpresasAtendidas: totalEmpresas,
      totalMunicipiosAtendidos: municipiosUnicos.size,
      taxaEmpregabilidade: Math.round(taxaEmpregabilidade * 100) / 100,
      distribuicaoPorGenero: distribuicaoGenero,
      distribuicaoPorFaixaEtaria: Object.entries(faixasEtarias).map(([faixa, total]) => ({
        faixa,
        total,
        percentual: totalAlunos > 0 ? (total / totalAlunos) * 100 : 0,
      })),
      distribuicaoPorMunicipio: municipiosRanking,
      distribuicaoPorEixo: {
        work: { total: participantesWork, certificados: certificadosWork },
        edu: { total: participantesEdu, certificados: certificadosEdu },
        trilhas: { total: participantesTrilhas, certificados: certificadosTrilhas },
        lab: { total: participantesLab, certificados: certificadosLab },
      },
    }
  }, 10 * 60 * 1000) // Cache de 10 minutos
}

// ============================================
// 2. ANÁLISE DE EFICÁCIA DOS PROGRAMAS
// ============================================

export interface EficaciaProgramas {
  work: {
    taxaConversao: number // inscrições → contratações
    taxaRetencao3Meses: number
    taxaRetencao6Meses: number
    taxaRetencao12Meses: number
    tempoMedioContratacao: number // dias
    empresasPorCiclo: number
  }
  edu: {
    taxaFrequencia: number
    taxaEvasao: number
    taxaCertificacao: number
    escolasAtivas: number
    cursosMaisProcurados: Array<{ curso: string; matriculas: number }>
  }
  trilhas: {
    taxaConclusao: number
    tempoMedioConclusao: number // dias
    trilhasMaisConcluidas: Array<{ trilha: string; concluidas: number }>
    modulosAbandonados: number
  }
  lab: {
    taxaOcupacao: number
    taxaCertificacao: number
    turmasAtivas: number
    cursosMaisDemandados: Array<{ curso: string; inscricoes: number }>
  }
}

export async function analisarEficaciaProgramas(): Promise<EficaciaProgramas> {
  const cacheKey = createCacheKey('bi-eficacia', {})
  
  return cachedQuery(queryCache, cacheKey, async () => {
    // WORK
    const [
      inscricoesWork,
      contratacoes,
      empresas,
      ciclos,
    ] = await Promise.all([
      prisma.oxetechwork_inscricao_alunos.count(),
      prisma.contratacoes.findMany({
        select: { created_at: true },
      }),
      prisma.empresas.count(),
      prisma.oxetechwork_ciclos.count(),
    ])
    
    const totalCiclos = ciclos > 0 ? ciclos : 8 // Default 8 ciclos
    const taxaConversaoWork = inscricoesWork > 0
      ? (contratacoes.length / inscricoesWork) * 100
      : 0
    
    const tresMesesAtras = new Date()
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3)
    const seisMesesAtras = new Date()
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
    const dozeMesesAtras = new Date()
    dozeMesesAtras.setMonth(dozeMesesAtras.getMonth() - 12)
    
    const retencao3Meses = contratacoes.filter((c) => new Date(c.created_at) >= tresMesesAtras).length
    const retencao6Meses = contratacoes.filter((c) => new Date(c.created_at) >= seisMesesAtras).length
    const retencao12Meses = contratacoes.filter((c) => new Date(c.created_at) >= dozeMesesAtras).length
    
    const taxaRetencao3Meses = contratacoes.length > 0 ? (retencao3Meses / contratacoes.length) * 100 : 0
    const taxaRetencao6Meses = contratacoes.length > 0 ? (retencao6Meses / contratacoes.length) * 100 : 0
    const taxaRetencao12Meses = contratacoes.length > 0 ? (retencao12Meses / contratacoes.length) * 100 : 0
    
    // Tempo médio de contratação (simulado - ajustar conforme schema real)
    const tempoMedioContratacao = 45 // dias (média estimada)
    
    // EDU
    const [
      matriculasEdu,
      escolas,
      frequencias,
    ] = await Promise.all([
      prisma.matriculas_oxetech_edu.findMany({
        select: {
          status: true,
          created_at: true,
          inscricoes_turmas_oxetech_edu: {
            select: {
              turmas_oxetech_edu: {
                select: { titulo: true },
              },
            },
          },
        },
      }),
      prisma.escolas_oxetech_edu.findMany({
        select: { id: true },
      }),
      prisma.frequencias.findMany({
        select: { status: true },
      }),
    ])
    
    const totalFrequencias = frequencias.length
    const presencas = frequencias.filter((f) => String(f.status) === 'ONE' || String(f.status) === 'TWO').length
    const taxaFrequenciaEdu = totalFrequencias > 0 ? (presencas / totalFrequencias) * 100 : 0
    
    const evasoesEdu = matriculasEdu.filter((m) => String(m.status) === 'ZERO').length
    const taxaEvasaoEdu = matriculasEdu.length > 0 ? (evasoesEdu / matriculasEdu.length) * 100 : 0
    
    const certificadosEdu = matriculasEdu.filter((m) => String(m.status) !== 'ZERO').length
    const taxaCertificacaoEdu = matriculasEdu.length > 0 ? (certificadosEdu / matriculasEdu.length) * 100 : 0
    
    // Cursos mais procurados (Edu)
    const cursosMap = new Map<string, number>()
    matriculasEdu.forEach((m) => {
      const curso = m.inscricoes_turmas_oxetech_edu[0]?.turmas_oxetech_edu?.titulo || 'Sem curso'
      cursosMap.set(curso, (cursosMap.get(curso) || 0) + 1)
    })
    
    const cursosMaisProcurados = Array.from(cursosMap.entries())
      .map(([curso, matriculas]) => ({
        curso,
        matriculas,
      }))
      .sort((a, b) => b.matriculas - a.matriculas)
      .slice(0, 10)
    
    // TRILHAS
    const [
      inscricoesTrilhas,
      trilhasConcluidas,
    ] = await Promise.all([
      prisma.inscricoes_trilhas_alunos.findMany({
        select: {
          concluido: true,
          created_at: true,
          updated_at: true,
          trilhas_de_conhecimento: {
            select: { titulo: true },
          },
        },
      }),
      prisma.inscricoes_trilhas_alunos.findMany({
        where: { concluido: true },
        select: {
          created_at: true,
          updated_at: true,
          trilhas_de_conhecimento: {
            select: { titulo: true },
          },
        },
      }),
    ])
    
    const taxaConclusaoTrilhas = inscricoesTrilhas.length > 0
      ? (trilhasConcluidas.length / inscricoesTrilhas.length) * 100
      : 0
    
    const tempoMedioConclusaoTrilhas = trilhasConcluidas.length > 0
      ? trilhasConcluidas.reduce((acc, t) => {
          const dias = (new Date(t.updated_at).getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24)
          return acc + dias
        }, 0) / trilhasConcluidas.length
      : 0
    
    // Trilhas mais concluídas
    const trilhasMap = new Map<string, number>()
    trilhasConcluidas.forEach((t) => {
      const trilha = t.trilhas_de_conhecimento?.titulo || 'Sem trilha'
      trilhasMap.set(trilha, (trilhasMap.get(trilha) || 0) + 1)
    })
    
    const trilhasMaisConcluidas = Array.from(trilhasMap.entries())
      .map(([trilha, concluidas]) => ({
        trilha,
        concluidas,
      }))
      .sort((a, b) => b.concluidas - a.concluidas)
      .slice(0, 10)
    
    // Módulos abandonados (sem conclusão há 30+ dias)
    const modulosAbandonados = await prisma.modulos_trilhas_alunos.count({
      where: {
        curso_concluido: false,
        updated_at: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })
    
    // LAB
    const [
      inscricoesLab,
      turmasList,
      inscricoesLabDetalhadas,
    ] = await Promise.all([
      prisma.oxetechlab_inscricoes.count(),
      prisma.turmas.findMany({
        select: {
          id: true,
          qtd_vagas_total: true,
          qtd_vagas_preenchidas: true,
        },
      }),
      prisma.oxetechlab_inscricoes.findMany({
        select: {
          status: true,
          turmas: {
            select: {
              titulo: true,
              qtd_vagas_total: true,
              qtd_vagas_preenchidas: true,
            },
          },
        },
      }),
    ])
    
    const totalVagas = turmasList.reduce((acc, t) => acc + (t.qtd_vagas_total || 0), 0)
    const vagasOcupadas = turmasList.reduce((acc, t) => acc + (t.qtd_vagas_preenchidas || 0), 0)
    const taxaOcupacaoLab = totalVagas > 0 ? (vagasOcupadas / totalVagas) * 100 : 0
    
    const certificadosLab = inscricoesLabDetalhadas.filter((i) => String(i.status) === 'TWO').length
    const taxaCertificacaoLab = inscricoesLab > 0 ? (certificadosLab / inscricoesLab) * 100 : 0
    
    // Cursos mais demandados (Lab)
    const cursosLabMap = new Map<string, number>()
    inscricoesLabDetalhadas.forEach((i) => {
      const curso = i.turmas?.titulo || 'Sem curso'
      cursosLabMap.set(curso, (cursosLabMap.get(curso) || 0) + 1)
    })
    
    const cursosMaisDemandados = Array.from(cursosLabMap.entries())
      .map(([curso, inscricoes]) => ({
        curso,
        inscricoes,
      }))
      .sort((a, b) => b.inscricoes - a.inscricoes)
      .slice(0, 10)
    
    return {
      work: {
        taxaConversao: Math.round(taxaConversaoWork * 100) / 100,
        taxaRetencao3Meses: Math.round(taxaRetencao3Meses * 100) / 100,
        taxaRetencao6Meses: Math.round(taxaRetencao6Meses * 100) / 100,
        taxaRetencao12Meses: Math.round(taxaRetencao12Meses * 100) / 100,
        tempoMedioContratacao,
        empresasPorCiclo: empresas / totalCiclos,
      },
      edu: {
        taxaFrequencia: Math.round(taxaFrequenciaEdu * 100) / 100,
        taxaEvasao: Math.round(taxaEvasaoEdu * 100) / 100,
        taxaCertificacao: Math.round(taxaCertificacaoEdu * 100) / 100,
        escolasAtivas: escolas.length,
        cursosMaisProcurados,
      },
      trilhas: {
        taxaConclusao: Math.round(taxaConclusaoTrilhas * 100) / 100,
        tempoMedioConclusao: Math.round(tempoMedioConclusaoTrilhas),
        trilhasMaisConcluidas,
        modulosAbandonados,
      },
      lab: {
        taxaOcupacao: Math.round(taxaOcupacaoLab * 100) / 100,
        taxaCertificacao: Math.round(taxaCertificacaoLab * 100) / 100,
        turmasAtivas: turmasList.length,
        cursosMaisDemandados,
      },
    }
  }, 10 * 60 * 1000) // Cache de 10 minutos
}

// ============================================
// 3. ANÁLISE DE TENDÊNCIAS E PROJEÇÕES
// ============================================

export interface TendenciasProjecoes {
  crescimentoMensal: Array<{
    mes: string
    inscricoes: number
    certificados: number
    crescimento: number
  }>
  projecaoProximos6Meses: {
    inscricoes: number
    certificados: number
    taxaCrescimento: number
  }
  tendenciasPorEixo: {
    work: { tendencia: 'crescimento' | 'estavel' | 'declinio'; percentual: number }
    edu: { tendencia: 'crescimento' | 'estavel' | 'declinio'; percentual: number }
    trilhas: { tendencia: 'crescimento' | 'estavel' | 'declinio'; percentual: number }
    lab: { tendencia: 'crescimento' | 'estavel' | 'declinio'; percentual: number }
  }
  sazonalidade: {
    mesMaisAtivo: string
    mesMenosAtivo: string
    variacao: number
  }
}

export async function analisarTendenciasProjecoes(): Promise<TendenciasProjecoes> {
  const cacheKey = createCacheKey('bi-tendencias', {})
  
  return cachedQuery(queryCache, cacheKey, async () => {
    // Últimos 12 meses
    const meses = []
    const hoje = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const mes = new Date(hoje)
      mes.setMonth(mes.getMonth() - i)
      meses.push({
        data: mes,
        mesStr: mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      })
    }
    
    // Inscrições por mês (todos os eixos)
    const crescimentoMensal = await Promise.all(
      meses.map(async (mesObj) => {
        const mesInicio = new Date(mesObj.data)
        mesInicio.setDate(1)
        mesInicio.setHours(0, 0, 0, 0)
        
        const mesFim = new Date(mesObj.data)
        mesFim.setMonth(mesFim.getMonth() + 1)
        mesFim.setDate(0)
        mesFim.setHours(23, 59, 59, 999)
        
        const [
          inscricoesWork,
          inscricoesEdu,
          inscricoesTrilhas,
          inscricoesLab,
          certificadosWork,
          certificadosEdu,
          certificadosTrilhas,
          certificadosLab,
        ] = await Promise.all([
          prisma.oxetechwork_inscricao_alunos.count({
            where: {
              created_at: {
                gte: mesInicio,
                lte: mesFim,
              },
            },
          }),
          prisma.matriculas_oxetech_edu.count({
            where: {
              created_at: {
                gte: mesInicio,
                lte: mesFim,
              },
            },
          }),
          prisma.inscricoes_trilhas_alunos.count({
            where: {
              created_at: {
                gte: mesInicio,
                lte: mesFim,
              },
            },
          }),
          prisma.oxetechlab_inscricoes.count({
            where: {
              created_at: {
                gte: mesInicio,
                lte: mesFim,
              },
            },
          }),
          prisma.contratacoes.count({
            where: {
              created_at: {
                gte: mesInicio,
                lte: mesFim,
              },
            },
          }),
          prisma.matriculas_oxetech_edu.count({
            where: {
              created_at: {
                gte: mesInicio,
                lte: mesFim,
              },
              status: { not: 'ZERO' },
            },
          }),
          prisma.inscricoes_trilhas_alunos.count({
            where: {
              created_at: {
                gte: mesInicio,
                lte: mesFim,
              },
              concluido: true,
            },
          }),
          prisma.oxetechlab_inscricoes.count({
            where: {
              created_at: {
                gte: mesInicio,
                lte: mesFim,
              },
              status: 'TWO',
            },
          }),
        ])
        
        const inscricoes = inscricoesWork + inscricoesEdu + inscricoesTrilhas + inscricoesLab
        const certificados = certificadosWork + certificadosEdu + certificadosTrilhas + certificadosLab
        
        return {
          mes: mesObj.mesStr,
          inscricoes,
          certificados,
          crescimento: 0, // Será calculado depois
        }
      })
    )
    
    // Calcular crescimento mensal
    crescimentoMensal.forEach((mes, index) => {
      if (index > 0) {
        const mesAnterior = crescimentoMensal[index - 1]
        const crescimento = mesAnterior.inscricoes > 0
          ? ((mes.inscricoes - mesAnterior.inscricoes) / mesAnterior.inscricoes) * 100
          : 0
        mes.crescimento = Math.round(crescimento * 100) / 100
      }
    })
    
    // Projeção para próximos 6 meses (média dos últimos 3 meses)
    const ultimos3Meses = crescimentoMensal.slice(-3)
    const mediaInscricoes = ultimos3Meses.length > 0
      ? ultimos3Meses.reduce((acc, m) => acc + m.inscricoes, 0) / ultimos3Meses.length
      : 0
    const mediaCertificados = ultimos3Meses.length > 0
      ? ultimos3Meses.reduce((acc, m) => acc + m.certificados, 0) / ultimos3Meses.length
      : 0
    
    const taxaCrescimento = ultimos3Meses.length > 1 && ultimos3Meses[0].inscricoes > 0
      ? ((ultimos3Meses[ultimos3Meses.length - 1].inscricoes - ultimos3Meses[0].inscricoes) / ultimos3Meses[0].inscricoes) * 100 / ultimos3Meses.length
      : 0
    
    const projecaoProximos6Meses = {
      inscricoes: Math.round(mediaInscricoes * 6 * (1 + taxaCrescimento / 100)),
      certificados: Math.round(mediaCertificados * 6 * (1 + taxaCrescimento / 100)),
      taxaCrescimento: Math.round(taxaCrescimento * 100) / 100,
    }
    
    // Tendências por eixo (últimos 6 meses vs 6 meses anteriores)
    const seisMesesAtras = new Date()
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
    const dozeMesesAtras = new Date()
    dozeMesesAtras.setMonth(dozeMesesAtras.getMonth() - 12)
    
    const [
      inscricoesWork6Meses,
      inscricoesWork12Meses,
      inscricoesEdu6Meses,
      inscricoesEdu12Meses,
      inscricoesTrilhas6Meses,
      inscricoesTrilhas12Meses,
      inscricoesLab6Meses,
      inscricoesLab12Meses,
    ] = await Promise.all([
      prisma.oxetechwork_inscricao_alunos.count({
        where: { created_at: { gte: seisMesesAtras } },
      }),
      prisma.oxetechwork_inscricao_alunos.count({
        where: {
          created_at: {
            gte: dozeMesesAtras,
            lt: seisMesesAtras,
          },
        },
      }),
      prisma.matriculas_oxetech_edu.count({
        where: { created_at: { gte: seisMesesAtras } },
      }),
      prisma.matriculas_oxetech_edu.count({
        where: {
          created_at: {
            gte: dozeMesesAtras,
            lt: seisMesesAtras,
          },
        },
      }),
      prisma.inscricoes_trilhas_alunos.count({
        where: { created_at: { gte: seisMesesAtras } },
      }),
      prisma.inscricoes_trilhas_alunos.count({
        where: {
          created_at: {
            gte: dozeMesesAtras,
            lt: seisMesesAtras,
          },
        },
      }),
      prisma.oxetechlab_inscricoes.count({
        where: { created_at: { gte: seisMesesAtras } },
      }),
      prisma.oxetechlab_inscricoes.count({
        where: {
          created_at: {
            gte: dozeMesesAtras,
            lt: seisMesesAtras,
          },
        },
      }),
    ])
    
    const calcularTendencia = (atual: number, anterior: number) => {
      if (anterior === 0) return { tendencia: 'estavel' as const, percentual: 0 }
      const percentual = ((atual - anterior) / anterior) * 100
      if (percentual > 5) return { tendencia: 'crescimento' as const, percentual: Math.round(percentual * 100) / 100 }
      if (percentual < -5) return { tendencia: 'declinio' as const, percentual: Math.round(percentual * 100) / 100 }
      return { tendencia: 'estavel' as const, percentual: Math.round(percentual * 100) / 100 }
    }
    
    // Sazonalidade
    const mesMaisAtivo = crescimentoMensal.length > 0
      ? crescimentoMensal.reduce((max, m) => (m.inscricoes > max.inscricoes ? m : max), crescimentoMensal[0])
      : { mes: 'N/A', inscricoes: 0 }
    const mesMenosAtivo = crescimentoMensal.length > 0
      ? crescimentoMensal.reduce((min, m) => (m.inscricoes < min.inscricoes ? m : min), crescimentoMensal[0])
      : { mes: 'N/A', inscricoes: 0 }
    const variacao = mesMaisAtivo.inscricoes > 0
      ? ((mesMaisAtivo.inscricoes - mesMenosAtivo.inscricoes) / mesMaisAtivo.inscricoes) * 100
      : 0
    
    return {
      crescimentoMensal,
      projecaoProximos6Meses,
      tendenciasPorEixo: {
        work: calcularTendencia(inscricoesWork6Meses, inscricoesWork12Meses),
        edu: calcularTendencia(inscricoesEdu6Meses, inscricoesEdu12Meses),
        trilhas: calcularTendencia(inscricoesTrilhas6Meses, inscricoesTrilhas12Meses),
        lab: calcularTendencia(inscricoesLab6Meses, inscricoesLab12Meses),
      },
      sazonalidade: {
        mesMaisAtivo: mesMaisAtivo.mes,
        mesMenosAtivo: mesMenosAtivo.mes,
        variacao: Math.round(variacao * 100) / 100,
      },
    }
  }, 10 * 60 * 1000) // Cache de 10 minutos
}

// ============================================
// 4. ANÁLISE DE DESEMPENHO TERRITORIAL
// ============================================

export interface DesempenhoTerritorial {
  municipiosRanking: Array<{
    municipio: string
    rank: number
    totalAlunos: number
    totalCertificados: number
    taxaCertificacao: number
    distribuicaoPorEixo: {
      work: number
      edu: number
      trilhas: number
      lab: number
    }
    cobertura: {
      escolas: number
      empresas: number
      laboratorios: number
    }
  }>
  regioes: {
    norte: { total: number; municipios: string[] }
    sul: { total: number; municipios: string[] }
    leste: { total: number; municipios: string[] }
    oeste: { total: number; municipios: string[] }
    centro: { total: number; municipios: string[] }
  }
  municipiosComMaiorImpacto: Array<{
    municipio: string
    impacto: number // Score calculado
    criterios: {
      totalAlunos: number
      taxaCertificacao: number
      diversidadeEixos: number
      cobertura: number
    }
  }>
}

export async function analisarDesempenhoTerritorial(): Promise<DesempenhoTerritorial> {
  const cacheKey = createCacheKey('bi-territorial', {})
  
  return cachedQuery(queryCache, cacheKey, async () => {
    // Alunos por município
    const alunosPorMunicipio = await prisma.alunos.groupBy({
      by: ['municipio'],
      _count: true,
    })
    
    // Certificados por município (via alunos)
    const certificadosPorMunicipio = new Map<string, number>()
    
    // Work
    const contratacoes = await prisma.contratacoes.findMany({
      select: {
        candidaturas: {
          select: {
            alunos: {
              select: { municipio: true },
            },
          },
        },
      },
    })
    
    contratacoes.forEach((c) => {
      const municipio = c.candidaturas?.alunos?.municipio || 'Não informado'
      certificadosPorMunicipio.set(municipio, (certificadosPorMunicipio.get(municipio) || 0) + 1)
    })
    
    // Edu
    const matriculasEdu = await prisma.matriculas_oxetech_edu.findMany({
      where: { status: { not: 'ZERO' } },
      select: {
        alunos: {
          select: { municipio: true },
        },
      },
    })
    
    matriculasEdu.forEach((m) => {
      const municipio = m.alunos?.municipio || 'Não informado'
      certificadosPorMunicipio.set(municipio, (certificadosPorMunicipio.get(municipio) || 0) + 1)
    })
    
    // Trilhas
    const trilhasConcluidas = await prisma.inscricoes_trilhas_alunos.findMany({
      where: { concluido: true },
      select: {
        alunos: {
          select: { municipio: true },
        },
      },
    })
    
    trilhasConcluidas.forEach((t) => {
      const municipio = t.alunos?.municipio || 'Não informado'
      certificadosPorMunicipio.set(municipio, (certificadosPorMunicipio.get(municipio) || 0) + 1)
    })
    
    // Lab
    const labCertificados = await prisma.oxetechlab_inscricoes.findMany({
      where: { status: 'TWO' },
      select: {
        alunos: {
          select: { municipio: true },
        },
      },
    })
    
    labCertificados.forEach((l) => {
      const municipio = l.alunos?.municipio || 'Não informado'
      certificadosPorMunicipio.set(municipio, (certificadosPorMunicipio.get(municipio) || 0) + 1)
    })
    
    // Cobertura (escolas, empresas, laboratórios por município)
    const [
      escolasPorMunicipio,
      empresasPorMunicipio,
      laboratoriosPorMunicipio,
    ] = await Promise.all([
      prisma.escolas_oxetech_edu.groupBy({
        by: ['municipio'],
        _count: true,
      }),
      prisma.empresas.findMany({
        select: { endereco: true },
      }), // Ajustar conforme schema
      prisma.laboratorios.groupBy({
        by: ['municipio'],
        _count: true,
      }),
    ])
    
    // Montar ranking
    const municipiosRanking = alunosPorMunicipio
      .map((m, index) => {
        const municipio = m.municipio || 'Não informado'
        const totalAlunos = m._count
        const totalCertificados = certificadosPorMunicipio.get(municipio) || 0
        const taxaCertificacao = totalAlunos > 0 ? (totalCertificados / totalAlunos) * 100 : 0
        
        return {
          municipio,
          rank: index + 1,
          totalAlunos,
          totalCertificados,
          taxaCertificacao: Math.round(taxaCertificacao * 100) / 100,
          distribuicaoPorEixo: {
            work: 0, // Será calculado depois
            edu: 0,
            trilhas: 0,
            lab: 0,
          },
          cobertura: {
            escolas: escolasPorMunicipio.find((e) => e.municipio === municipio)?._count || 0,
            empresas: 0, // Ajustar conforme schema
            laboratorios: laboratoriosPorMunicipio.find((l) => l.municipio === municipio)?._count || 0,
          },
        }
      })
      .sort((a, b) => b.totalAlunos - a.totalAlunos)
      .slice(0, 20)
    
    // Regiões (simulado - ajustar conforme mapeamento real de Alagoas)
    const regioes = {
      norte: { total: 0, municipios: [] as string[] },
      sul: { total: 0, municipios: [] as string[] },
      leste: { total: 0, municipios: [] as string[] },
      oeste: { total: 0, municipios: [] as string[] },
      centro: { total: 0, municipios: [] as string[] },
    }
    
    // Mapeamento simplificado (ajustar conforme região real)
    const mapearRegiao = (municipio: string): keyof typeof regioes => {
      if (municipio.toLowerCase().includes('maceió') || municipio.toLowerCase().includes('marechal')) return 'leste'
      // Adicionar mais mapeamentos conforme necessário
      return 'centro'
    }
    
    municipiosRanking.forEach((m) => {
      const regiao = mapearRegiao(m.municipio)
      regioes[regiao].total += m.totalAlunos
      if (!regioes[regiao].municipios.includes(m.municipio)) {
        regioes[regiao].municipios.push(m.municipio)
      }
    })
    
    // Municípios com maior impacto (score)
    const municipiosComMaiorImpacto = municipiosRanking
      .map((m) => {
        const scoreImpacto =
          m.totalAlunos * 0.3 +
          m.taxaCertificacao * 0.4 +
          (m.cobertura.escolas + m.cobertura.laboratorios) * 10 * 0.2 +
          (m.distribuicaoPorEixo.work + m.distribuicaoPorEixo.edu + m.distribuicaoPorEixo.trilhas + m.distribuicaoPorEixo.lab > 0 ? 1 : 0) * 100 * 0.1
        
        return {
          municipio: m.municipio,
          impacto: Math.round(scoreImpacto),
          criterios: {
            totalAlunos: m.totalAlunos,
            taxaCertificacao: m.taxaCertificacao,
            diversidadeEixos: m.distribuicaoPorEixo.work + m.distribuicaoPorEixo.edu + m.distribuicaoPorEixo.trilhas + m.distribuicaoPorEixo.lab,
            cobertura: m.cobertura.escolas + m.cobertura.laboratorios,
          },
        }
      })
      .sort((a, b) => b.impacto - a.impacto)
      .slice(0, 10)
    
    return {
      municipiosRanking,
      regioes,
      municipiosComMaiorImpacto,
    }
  }, 15 * 60 * 1000) // Cache de 15 minutos
}

// ============================================
// 5. ANÁLISE DE OPORTUNIDADES E GAPS
// ============================================

export interface OportunidadesGaps {
  oportunidades: Array<{
    tipo: 'expansao' | 'melhoria' | 'novo_servico' | 'parceria'
    titulo: string
    descricao: string
    impacto: 'alto' | 'medio' | 'baixo'
    facilidade: 'alta' | 'media' | 'baixa'
    municipiosAlvos: string[]
  }>
  gaps: Array<{
    tipo: 'cobertura' | 'eficiência' | 'retenção' | 'qualidade'
    descricao: string
    severidade: 'alta' | 'media' | 'baixa'
    municipiosAfetados: string[]
    recomendacoes: string[]
  }>
  priorizacao: Array<{
    acao: string
    prioridade: number // 1-10
    razao: string
    impactoEsperado: string
  }>
}

export async function analisarOportunidadesGaps(): Promise<OportunidadesGaps> {
  const cacheKey = createCacheKey('bi-oportunidades', {})
  
  return cachedQuery(queryCache, cacheKey, async () => {
    // Análise de oportunidades
    const oportunidades: OportunidadesGaps['oportunidades'] = []
    
    // Gaps
    const gaps: OportunidadesGaps['gaps'] = []
    
    // Análise de cobertura
    const municipiosComAlunos = await prisma.alunos.groupBy({
      by: ['municipio'],
      _count: true,
    })
    
    const municipiosComEscolas = await prisma.escolas_oxetech_edu.groupBy({
      by: ['municipio'],
      _count: true,
    })
    
    const municipiosComLaboratorios = await prisma.laboratorios.groupBy({
      by: ['municipio'],
      _count: true,
    })
    
    // Municípios sem cobertura
    const municipiosSemCobertura = municipiosComAlunos
      .filter((m) => {
        const temEscola = municipiosComEscolas.some((e) => e.municipio === m.municipio)
        const temLab = municipiosComLaboratorios.some((l) => l.municipio === m.municipio)
        return !temEscola && !temLab && m._count >= 10 // Pelo menos 10 alunos
      })
      .map((m) => m.municipio || 'Não informado')
    
    if (municipiosSemCobertura.length > 0) {
      gaps.push({
        tipo: 'cobertura',
        descricao: `${municipiosSemCobertura.length} municípios com alunos mas sem escolas ou laboratórios`,
        severidade: 'alta',
        municipiosAfetados: municipiosSemCobertura.slice(0, 10),
        recomendacoes: [
          'Instalar pontos de atendimento nos municípios identificados',
          'Parcerias com escolas locais',
          'Programas itinerantes',
        ],
      })
      
      oportunidades.push({
        tipo: 'expansao',
        titulo: 'Expansão para municípios sem cobertura',
        descricao: `Expandir serviços para ${municipiosSemCobertura.length} municípios que já possuem alunos cadastrados mas não têm pontos de atendimento`,
        impacto: 'alto',
        facilidade: 'media',
        municipiosAlvos: municipiosSemCobertura.slice(0, 10),
      })
    }
    
    // Análise de evasão
    const matriculasEdu = await prisma.matriculas_oxetech_edu.count()
    const evasoesEdu = await prisma.matriculas_oxetech_edu.count({
      where: { status: 'ZERO' },
    })
    
    const taxaEvasao = matriculasEdu > 0 ? (evasoesEdu / matriculasEdu) * 100 : 0
    
    if (taxaEvasao > 20) {
      gaps.push({
        tipo: 'retenção',
        descricao: `Taxa de evasão alta no Edu: ${taxaEvasao.toFixed(1)}%`,
        severidade: 'alta',
        municipiosAfetados: [],
        recomendacoes: [
          'Programas de acompanhamento personalizado',
          'Gamificação e incentivos',
          'Mentoria e apoio psicossocial',
        ],
      })
      
      oportunidades.push({
        tipo: 'melhoria',
        titulo: 'Programa de Retenção',
        descricao: 'Implementar programa específico para reduzir evasão no Edu',
        impacto: 'alto',
        facilidade: 'media',
        municipiosAlvos: [],
      })
    }
    
    // Análise de taxa de conclusão Trilhas
    const trilhasInscricoes = await prisma.inscricoes_trilhas_alunos.count()
    const trilhasConcluidas = await prisma.inscricoes_trilhas_alunos.count({
      where: { concluido: true },
    })
    
    const taxaConclusaoTrilhas = trilhasInscricoes > 0 ? (trilhasConcluidas / trilhasInscricoes) * 100 : 0
    
    if (taxaConclusaoTrilhas < 50) {
      gaps.push({
        tipo: 'eficiência',
        descricao: `Taxa de conclusão baixa nas Trilhas: ${taxaConclusaoTrilhas.toFixed(1)}%`,
        severidade: 'media',
        municipiosAfetados: [],
        recomendacoes: [
          'Melhorar UX das trilhas',
          'Notificações e lembretes',
          'Conteúdo mais engajador',
        ],
      })
    }
    
    // Análise de vagas não ocupadas (Lab)
    const turmasVagas = await prisma.turmas.findMany({
      select: {
        qtd_vagas_total: true,
        qtd_vagas_preenchidas: true,
        laboratorios: {
          select: { municipio: true },
        },
      },
    })
    
    const vagasLivres = turmasVagas.reduce((acc, t) => {
      return acc + ((t.qtd_vagas_total || 0) - (t.qtd_vagas_preenchidas || 0))
    }, 0)
    
    if (vagasLivres > 100) {
      oportunidades.push({
        tipo: 'expansao',
        titulo: 'Campanha de Divulgação Lab',
        descricao: `${vagasLivres} vagas disponíveis no Lab - oportunidade de expansão`,
        impacto: 'medio',
        facilidade: 'alta',
        municipiosAlvos: [],
      })
    }
    
    // Priorização
    const priorizacao: OportunidadesGaps['priorizacao'] = [
      ...gaps
        .filter((g) => g.severidade === 'alta')
        .map((g) => ({
          acao: `Resolver gap: ${g.descricao}`,
          prioridade: 9,
          razao: 'Alta severidade',
          impactoEsperado: 'Redução de problemas críticos',
        })),
      ...oportunidades
        .filter((o) => o.impacto === 'alto')
        .map((o) => ({
          acao: o.titulo,
          prioridade: 8,
          razao: 'Alto impacto',
          impactoEsperado: 'Aumento significativo de resultados',
        })),
    ]
      .slice(0, 10)
      .sort((a, b) => b.prioridade - a.prioridade)
    
    return {
      oportunidades,
      gaps,
      priorizacao,
    }
  }, 15 * 60 * 1000) // Cache de 15 minutos
}

// ============================================
// 6. ANÁLISE DE ROI E EFICIÊNCIA ORÇAMENTÁRIA
// ============================================

export interface ROIEficiencia {
  investimentoPorAluno: {
    work: number
    edu: number
    trilhas: number
    lab: number
    media: number
  }
  custoPorCertificado: {
    work: number
    edu: number
    trilhas: number
    lab: number
    media: number
  }
  eficienciaOrcamentaria: {
    orcamentoUsado: number // %
    orcamentoRestante: number // %
    projecaoGasto: number
    mesesRestantes: number
  }
  comparacaoEixos: Array<{
    eixo: string
    investimento: number
    retorno: number // certificados
    eficiencia: number // certificados por R$ 1000
  }>
}

export async function analisarROIEficiencia(): Promise<ROIEficiencia> {
  const cacheKey = createCacheKey('bi-roi', {})
  
  return cachedQuery(queryCache, cacheKey, async () => {
    // Dados simulados - ajustar conforme dados reais de orçamento
    const orcamentoTotal = 10000000 // R$ 10 milhões (simulado)
    const orcamentoUsado = 6500000 // R$ 6.5 milhões (simulado)
    
    // Participantes e certificados
    const [
      participantesWork,
      certificadosWork,
      participantesEdu,
      certificadosEdu,
      participantesTrilhas,
      certificadosTrilhas,
      participantesLab,
      certificadosLab,
    ] = await Promise.all([
      prisma.oxetechwork_inscricao_alunos.count(),
      prisma.contratacoes.count(),
      prisma.matriculas_oxetech_edu.count(),
      prisma.matriculas_oxetech_edu.count({ where: { status: { not: 'ZERO' } } }),
      prisma.inscricoes_trilhas_alunos.count(),
      prisma.inscricoes_trilhas_alunos.count({ where: { concluido: true } }),
      prisma.oxetechlab_inscricoes.count(),
      // CORRIGIDO: Certificados Lab vêm da tabela matriculas (status TWO = APROVADO)
      prisma.matriculas.count({ where: { status: 'TWO' } }),
    ])
    
    // Distribuição de orçamento (simulado - ajustar conforme real)
    const orcamentoWork = orcamentoUsado * 0.4
    const orcamentoEdu = orcamentoUsado * 0.25
    const orcamentoTrilhas = orcamentoUsado * 0.15
    const orcamentoLab = orcamentoUsado * 0.2
    
    // Investimento por aluno
    const investimentoPorAluno = {
      work: participantesWork > 0 ? orcamentoWork / participantesWork : 0,
      edu: participantesEdu > 0 ? orcamentoEdu / participantesEdu : 0,
      trilhas: participantesTrilhas > 0 ? orcamentoTrilhas / participantesTrilhas : 0,
      lab: participantesLab > 0 ? orcamentoLab / participantesLab : 0,
      media: 0,
    }
    
    investimentoPorAluno.media =
      (investimentoPorAluno.work +
        investimentoPorAluno.edu +
        investimentoPorAluno.trilhas +
        investimentoPorAluno.lab) /
      4
    
    // Custo por certificado
    const custoPorCertificado = {
      work: certificadosWork > 0 ? orcamentoWork / certificadosWork : 0,
      edu: certificadosEdu > 0 ? orcamentoEdu / certificadosEdu : 0,
      trilhas: certificadosTrilhas > 0 ? orcamentoTrilhas / certificadosTrilhas : 0,
      lab: certificadosLab > 0 ? orcamentoLab / certificadosLab : 0,
      media: 0,
    }
    
    custoPorCertificado.media =
      (custoPorCertificado.work +
        custoPorCertificado.edu +
        custoPorCertificado.trilhas +
        custoPorCertificado.lab) /
      4
    
    // Eficiência orçamentária
    const hoje = new Date()
    const mesAtual = hoje.getMonth()
    const mesesRestantes = 12 - mesAtual
    
    const taxaGastoMensal = orcamentoUsado / (mesAtual + 1)
    const projecaoGasto = taxaGastoMensal * 12
    
    // Comparação entre eixos (eficiencia = certificados por R$ 1000)
    const comparacaoEixos = [
      {
        eixo: 'Work',
        investimento: orcamentoWork,
        retorno: certificadosWork,
        eficiencia: orcamentoWork > 0 ? (certificadosWork / orcamentoWork) * 1000 : 0,
      },
      {
        eixo: 'Edu',
        investimento: orcamentoEdu,
        retorno: certificadosEdu,
        eficiencia: orcamentoEdu > 0 ? (certificadosEdu / orcamentoEdu) * 1000 : 0,
      },
      {
        eixo: 'Trilhas',
        investimento: orcamentoTrilhas,
        retorno: certificadosTrilhas,
        eficiencia: orcamentoTrilhas > 0 ? (certificadosTrilhas / orcamentoTrilhas) * 1000 : 0,
      },
      {
        eixo: 'Lab',
        investimento: orcamentoLab,
        retorno: certificadosLab,
        eficiencia: orcamentoLab > 0 ? (certificadosLab / orcamentoLab) * 1000 : 0,
      },
    ].sort((a, b) => b.eficiencia - a.eficiencia)
    
    return {
      investimentoPorAluno: {
        work: Math.round(investimentoPorAluno.work),
        edu: Math.round(investimentoPorAluno.edu),
        trilhas: Math.round(investimentoPorAluno.trilhas),
        lab: Math.round(investimentoPorAluno.lab),
        media: Math.round(investimentoPorAluno.media),
      },
      custoPorCertificado: {
        work: Math.round(custoPorCertificado.work),
        edu: Math.round(custoPorCertificado.edu),
        trilhas: Math.round(custoPorCertificado.trilhas),
        lab: Math.round(custoPorCertificado.lab),
        media: Math.round(custoPorCertificado.media),
      },
      eficienciaOrcamentaria: {
        orcamentoUsado: (orcamentoUsado / orcamentoTotal) * 100,
        orcamentoRestante: ((orcamentoTotal - orcamentoUsado) / orcamentoTotal) * 100,
        projecaoGasto,
        mesesRestantes,
      },
      comparacaoEixos: comparacaoEixos.map((e) => ({
        ...e,
        eficiencia: Math.round(e.eficiencia * 100) / 100,
      })),
    }
  }, 15 * 60 * 1000) // Cache de 15 minutos
}

// ============================================
// 7. ANÁLISE COMPLETA DE BI
// ============================================

export interface AnaliseCompletaBI {
  impactoSocial: ImpactoSocial
  eficaciaProgramas: EficaciaProgramas
  tendenciasProjecoes: TendenciasProjecoes
  desempenhoTerritorial: DesempenhoTerritorial
  oportunidadesGaps: OportunidadesGaps
  roiEficiencia: ROIEficiencia
  resumoExecutivo: {
    principaisInsights: string[]
    recomendacoesPrioritarias: string[]
    alertasCriticos: string[]
    destaques: string[]
  }
}

export async function gerarAnaliseCompletaBI(): Promise<AnaliseCompletaBI> {
  const [
    impactoSocial,
    eficaciaProgramas,
    tendenciasProjecoes,
    desempenhoTerritorial,
    oportunidadesGaps,
    roiEficiencia,
  ] = await Promise.all([
    analisarImpactoSocial(),
    analisarEficaciaProgramas(),
    analisarTendenciasProjecoes(),
    analisarDesempenhoTerritorial(),
    analisarOportunidadesGaps(),
    analisarROIEficiencia(),
  ])
  
  // Gerar resumo executivo
  const principaisInsights: string[] = []
  const recomendacoesPrioritarias: string[] = []
  const alertasCriticos: string[] = []
  const destaques: string[] = []
  
  // Insights
  if (impactoSocial.taxaEmpregabilidade > 0) {
    principaisInsights.push(
      `Taxa de empregabilidade de ${impactoSocial.taxaEmpregabilidade.toFixed(1)}%`
    )
  }
  
  if (impactoSocial.totalCertificados > 0) {
    principaisInsights.push(
      `${impactoSocial.totalCertificados} alunos certificados em todos os eixos`
    )
  }
  
  if (impactoSocial.totalMunicipiosAtendidos > 0) {
    principaisInsights.push(
      `Cobertura em ${impactoSocial.totalMunicipiosAtendidos} municípios de Alagoas`
    )
  }
  
  if (eficaciaProgramas.trilhas?.taxaConclusao && eficaciaProgramas.trilhas.taxaConclusao > 0) {
    principaisInsights.push(
      `Taxa de conclusão nas Trilhas: ${eficaciaProgramas.trilhas.taxaConclusao.toFixed(1)}%`
    )
  }
  
  // Se não houver insights, adicionar um padrão
  if (principaisInsights.length === 0) {
    principaisInsights.push(
      'Análise de BI carregada com sucesso',
      'Dados disponíveis para visualização'
    )
  }
  
  // Alertas
  if (eficaciaProgramas.edu?.taxaEvasao && eficaciaProgramas.edu.taxaEvasao > 20) {
    alertasCriticos.push(`Evasão alta no Edu: ${eficaciaProgramas.edu.taxaEvasao.toFixed(1)}%`)
  }
  
  if (eficaciaProgramas.lab?.taxaOcupacao && eficaciaProgramas.lab.taxaOcupacao < 70) {
    alertasCriticos.push(`Taxa de ocupação baixa no Lab: ${eficaciaProgramas.lab.taxaOcupacao.toFixed(1)}%`)
  }
  
  // Destaques
  if (roiEficiencia.comparacaoEixos && roiEficiencia.comparacaoEixos.length > 0) {
    const eixoMaisEficiente = roiEficiencia.comparacaoEixos[0]
    destaques.push(`${eixoMaisEficiente.eixo} é o eixo mais eficiente: ${eixoMaisEficiente.eficiencia} certificados por R$ 1000`)
  }
  
  if (desempenhoTerritorial.municipiosRanking && desempenhoTerritorial.municipiosRanking.length > 0) {
    const municipioTop = desempenhoTerritorial.municipiosRanking[0]
    destaques.push(`${municipioTop.municipio} lidera em número de alunos: ${municipioTop.totalAlunos}`)
  }
  
  // Se não houver destaques, adicionar um padrão
  if (destaques.length === 0) {
    destaques.push('Sistema de BI operacional')
  }
  
  // Recomendações
  if (oportunidadesGaps.priorizacao && oportunidadesGaps.priorizacao.length > 0) {
    oportunidadesGaps.priorizacao.slice(0, 5).forEach((p) => {
      recomendacoesPrioritarias.push(`${p.acao}: ${p.razao}`)
    })
  }
  
  // Se não houver recomendações, adicionar uma padrão
  if (recomendacoesPrioritarias.length === 0) {
    recomendacoesPrioritarias.push('Continuar monitoramento dos indicadores', 'Manter coleta regular de dados')
  }
  
  return {
    impactoSocial,
    eficaciaProgramas,
    tendenciasProjecoes,
    desempenhoTerritorial,
    oportunidadesGaps,
    roiEficiencia,
    resumoExecutivo: {
      principaisInsights,
      recomendacoesPrioritarias,
      alertasCriticos,
      destaques,
    },
  }
}

