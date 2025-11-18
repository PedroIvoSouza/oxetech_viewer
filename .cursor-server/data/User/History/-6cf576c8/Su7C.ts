/**
 * Análise Detalhada do OxeTech Lab
 * 
 * Métricas específicas para gestão e monitoramento do programa Lab
 */

import { prisma } from '@/lib/db'
import { normalizarCurso } from '@/lib/course-normalizer'
import { cachedQuery, createCacheKey } from '@/lib/cache'
import { queryCache } from '@/lib/cache'

// ============================================
// INTERFACES
// ============================================

export interface AnaliseDetalhadaLab {
  resumo: {
    totalLaboratorios: number
    totalTurmas: number
    totalInscricoes: number
    totalCertificados: number
    taxaCertificacaoGeral: number
    taxaEvasaoGeral: number
    taxaOcupacaoGeral: number
  }
  porLaboratorio: Array<{
    laboratorioId: number
    nome: string
    municipio: string
    totalTurmas: number
    totalInscricoes: number
    totalCertificados: number
    taxaCertificacao: number
    taxaEvasao: number
    taxaOcupacao: number
    vagasTotal: number
    vagasOcupadas: number
    vagasLivres: number
    cursosOferecidos: number
    ranking: number
  }>
  porCurso: Array<{
    curso: string
    cursoNormalizado: string
    categoria: string
    totalTurmas: number
    totalInscricoes: number
    totalCertificados: number
    taxaCertificacao: number
    taxaEvasao: number
    laboratorios: string[]
    municipios: string[]
  }>
  alunosCertificados: Array<{
    alunoId: number
    nome: string
    email: string
    telefone: string
    municipio: string
    curso: string
    cursoNormalizado: string
    laboratorio: string
    dataInscricao: Date
    dataConclusao: Date
    tempoConclusao: number // dias
  }>
  evasao: {
    porLaboratorio: Array<{
      laboratorio: string
      municipio: string
      totalInscricoes: number
      totalEvasao: number
      taxaEvasao: number
      cursosAfetados: string[]
    }>
    porCurso: Array<{
      curso: string
      cursoNormalizado: string
      totalInscricoes: number
      totalEvasao: number
      taxaEvasao: number
    }>
    principaisMotivos: Array<{
      motivo: string
      quantidade: number
      percentual: number
    }>
  }
  desempenho: {
    laboratoriosTop10: Array<{
      laboratorio: string
      municipio: string
      score: number
      criterios: {
        taxaCertificacao: number
        taxaOcupacao: number
        totalCertificados: number
        diversidadeCursos: number
      }
    }>
    laboratoriosComProblemas: Array<{
      laboratorio: string
      municipio: string
      problema: string
      severidade: 'alta' | 'media' | 'baixa'
      detalhes: string
    }>
  }
  tendencias: {
    crescimentoInscricoes: {
      ultimos3Meses: number
      ultimos6Meses: number
      tendencia: 'crescimento' | 'estavel' | 'declinio'
    }
    crescimentoCertificados: {
      ultimos3Meses: number
      ultimos6Meses: number
      tendencia: 'crescimento' | 'estavel' | 'declinio'
    }
    sazonalidade: {
      mesMaisAtivo: string
      mesMenosAtivo: string
      variacao: number
    }
  }
  alertas: Array<{
    tipo: 'evasao' | 'ocupacao' | 'certificacao' | 'outro'
    severidade: 'alta' | 'media' | 'baixa'
    titulo: string
    descricao: string
    laboratorio?: string
    curso?: string
  }>
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

export async function gerarAnaliseDetalhadaLab(): Promise<AnaliseDetalhadaLab> {
  const cacheKey = createCacheKey('bi-lab-detalhado', {})
  
  return cachedQuery(queryCache, cacheKey, async () => {
    // Buscar todos os dados em paralelo
    const [
      laboratorios,
      turmas,
      inscricoes,
      matriculasCertificadas,
    ] = await Promise.all([
      prisma.laboratorios.findMany({
        select: {
          id: true,
          nome: true,
          municipio: true,
        },
      }),
      prisma.turmas.findMany({
        select: {
          id: true,
          titulo: true,
          laboratorio_id: true,
          qtd_vagas_total: true,
          qtd_vagas_preenchidas: true,
          laboratorios: {
            select: {
              nome: true,
              municipio: true,
            },
          },
        },
      }),
      prisma.oxetechlab_inscricoes.findMany({
        select: {
          id: true,
          aluno_id: true,
          turma_id: true,
          status: true,
          created_at: true,
          updated_at: true,
          alunos: {
            select: {
              id: true,
              name: true,
              email: true,
              telefone: true,
              municipio: true,
            },
          },
          turmas: {
            select: {
              id: true,
              titulo: true,
              laboratorio_id: true,
              laboratorios: {
                select: {
                  id: true,
                  nome: true,
                  municipio: true,
                },
              },
            },
          },
        },
      }),
      // CORRIGIDO: Buscar certificados da tabela matriculas (status TWO = APROVADO)
      // No Lab, aluno certificado está marcado como APROVADO (código 2) na tabela matrícula
      prisma.matriculas.findMany({
        where: {
          status: 'TWO', // APROVADO = Certificado
        },
        select: {
          id: true,
          aluno_id: true,
          turma_id: true,
          inscricao_id: true,
          created_at: true,
          updated_at: true,
          media: true,
          percentual_faltas: true,
          certificado_id: true,
          alunos: {
            select: {
              id: true,
              name: true,
              email: true,
              telefone: true,
              municipio: true,
            },
          },
          turmas: {
            select: {
              id: true,
              titulo: true,
              laboratorio_id: true,
              laboratorios: {
                select: {
                  id: true,
                  nome: true,
                  municipio: true,
                },
              },
            },
          },
          oxetechlab_inscricoes: {
            select: {
              id: true,
              status: true,
              created_at: true,
            },
          },
        },
      }),
    ])

    // ============================================
    // RESUMO GERAL
    // ============================================
    // CORRIGIDO: Certificados agora vêm da tabela matriculas (status TWO = APROVADO)
    const totalInscricoes = inscricoes.length
    const totalCertificados = matriculasCertificadas.length // Renomeado de inscricoesCertificadas
    const totalEvasao = inscricoes.filter(
      (i) => String(i.status) === 'ZERO' || String(i.status) === 'ONE'
    ).length
    const vagasTotal = turmas.reduce((acc, t) => acc + (t.qtd_vagas_total || 0), 0)
    const vagasOcupadas = turmas.reduce((acc, t) => acc + (t.qtd_vagas_preenchidas || 0), 0)

    const resumo = {
      totalLaboratorios: laboratorios.length,
      totalTurmas: turmas.length,
      totalInscricoes,
      totalCertificados,
      taxaCertificacaoGeral: totalInscricoes > 0 
        ? (totalCertificados / totalInscricoes) * 100 
        : 0,
      taxaEvasaoGeral: totalInscricoes > 0 
        ? (totalEvasao / totalInscricoes) * 100 
        : 0,
      taxaOcupacaoGeral: vagasTotal > 0 
        ? (vagasOcupadas / vagasTotal) * 100 
        : 0,
    }

    // ============================================
    // ANÁLISE POR LABORATÓRIO
    // ============================================
    const porLaboratorioMap = new Map<number, {
      laboratorioId: number
      nome: string
      municipio: string
      totalTurmas: number
      totalInscricoes: number
      totalCertificados: number
      totalEvasao: number
      vagasTotal: number
      vagasOcupadas: number
      cursosSet: Set<string>
    }>()

    // Inicializar map com laboratórios
    laboratorios.forEach((lab) => {
      porLaboratorioMap.set(lab.id, {
        laboratorioId: lab.id,
        nome: lab.nome,
        municipio: lab.municipio || 'Não informado',
        totalTurmas: 0,
        totalInscricoes: 0,
        totalCertificados: 0,
        totalEvasao: 0,
        vagasTotal: 0,
        vagasOcupadas: 0,
        cursosSet: new Set<string>(),
      })
    })

    // Processar turmas
    turmas.forEach((turma) => {
      const labId = turma.laboratorio_id
      const lab = porLaboratorioMap.get(labId)
      if (lab) {
        lab.totalTurmas++
        lab.vagasTotal += turma.qtd_vagas_total || 0
        lab.vagasOcupadas += turma.qtd_vagas_preenchidas || 0
        lab.cursosSet.add(turma.titulo || 'Sem título')
      }
    })

    // Processar inscrições
    inscricoes.forEach((insc) => {
      const labId = insc.turmas?.laboratorio_id
      if (!labId) return

      const lab = porLaboratorioMap.get(labId)
      if (lab) {
        lab.totalInscricoes++
        
        // Não contar certificados aqui - eles vêm da tabela matriculas
        if (String(insc.status) === 'ZERO' || String(insc.status) === 'ONE') {
          lab.totalEvasao++
        }
      }
    })

    // Converter map para array e calcular métricas
    const porLaboratorioTemp = Array.from(porLaboratorioMap.values())
      .map((lab) => {
        const cursosOferecidos = lab.cursosSet.size
        return {
          laboratorioId: lab.laboratorioId,
          nome: lab.nome,
          municipio: lab.municipio,
          totalTurmas: lab.totalTurmas,
          totalInscricoes: lab.totalInscricoes,
          totalCertificados: lab.totalCertificados,
          totalEvasao: lab.totalEvasao,
          vagasTotal: lab.vagasTotal,
          vagasOcupadas: lab.vagasOcupadas,
          cursosOferecidos,
          taxaCertificacao: lab.totalInscricoes > 0 
            ? (lab.totalCertificados / lab.totalInscricoes) * 100 
            : 0,
          taxaEvasao: lab.totalInscricoes > 0 
            ? (lab.totalEvasao / lab.totalInscricoes) * 100 
            : 0,
          taxaOcupacao: lab.vagasTotal > 0 
            ? (lab.vagasOcupadas / lab.vagasTotal) * 100 
            : 0,
          vagasLivres: lab.vagasTotal - lab.vagasOcupadas,
        }
      })
      .sort((a, b) => {
        // Ordenar por score: certificados + ocupação + diversidade
        const scoreA = a.totalCertificados * 0.5 + a.taxaOcupacao * 0.3 + a.cursosOferecidos * 10 * 0.2
        const scoreB = b.totalCertificados * 0.5 + b.taxaOcupacao * 0.3 + b.cursosOferecidos * 10 * 0.2
        return scoreB - scoreA
      })

    const porLaboratorio = porLaboratorioTemp.map((lab, index) => ({
      ...lab,
      ranking: index + 1,
    }))

    // ============================================
    // ANÁLISE POR CURSO
    // ============================================
    const porCursoMap = new Map<string, {
      curso: string
      cursoNormalizado: string
      categoria: string
      totalTurmas: number
      totalInscricoes: number
      totalCertificados: number
      totalEvasao: number
      laboratoriosSet: Set<string>
      municipiosSet: Set<string>
    }>()

    inscricoes.forEach((insc) => {
      const curso = insc.turmas?.titulo || 'Sem curso'
      const normalizado = normalizarCurso(curso)
      const key = normalizado.nomeNormalizado.toLowerCase()

      if (!porCursoMap.has(key)) {
        porCursoMap.set(key, {
          curso,
          cursoNormalizado: normalizado.nomeNormalizado,
          categoria: normalizado.categoria,
          totalTurmas: 0,
          totalInscricoes: 0,
          totalCertificados: 0,
          totalEvasao: 0,
          laboratoriosSet: new Set<string>(),
          municipiosSet: new Set<string>(),
        })
      }

      const cursoData = porCursoMap.get(key)!
      cursoData.totalInscricoes++
      
      if (insc.turmas?.laboratorios) {
        cursoData.laboratoriosSet.add(insc.turmas.laboratorios.nome)
        cursoData.municipiosSet.add(insc.turmas.laboratorios.municipio || 'Não informado')
      }

      // Não contar certificados aqui - eles vêm da tabela matriculas
      if (String(insc.status) === 'ZERO' || String(insc.status) === 'ONE') {
        cursoData.totalEvasao++
      }
    })

    // Contar turmas por curso
    turmas.forEach((turma) => {
      const curso = turma.titulo || 'Sem curso'
      const normalizado = normalizarCurso(curso)
      const key = normalizado.nomeNormalizado.toLowerCase()

      const cursoData = porCursoMap.get(key)
      if (cursoData) {
        cursoData.totalTurmas++
      }
    })

    // Contar certificados por curso via matriculas (status TWO = APROVADO)
    matriculasCertificadas.forEach((matricula) => {
      const cursoNormalizado = normalizarCurso(matricula.turmas?.titulo || '').nomeNormalizado
      const key = cursoNormalizado.toLowerCase()
      const cursoData = porCursoMap.get(key)

      if (cursoData) {
        cursoData.totalCertificados++
      }
    })

    const porCurso = Array.from(porCursoMap.values())
      .map((curso) => ({
        curso: curso.curso,
        cursoNormalizado: curso.cursoNormalizado,
        categoria: curso.categoria,
        totalTurmas: curso.totalTurmas,
        totalInscricoes: curso.totalInscricoes,
        totalCertificados: curso.totalCertificados,
        taxaCertificacao: curso.totalInscricoes > 0 
          ? (curso.totalCertificados / curso.totalInscricoes) * 100 
          : 0,
        taxaEvasao: curso.totalInscricoes > 0 
          ? (curso.totalEvasao / curso.totalInscricoes) * 100 
          : 0,
        laboratorios: Array.from(curso.laboratoriosSet),
        municipios: Array.from(curso.municipiosSet),
      }))
      .sort((a, b) => b.totalInscricoes - a.totalInscricoes)

    // ============================================
    // ALUNOS CERTIFICADOS DE FATO (da tabela matriculas com status TWO = APROVADO)
    // ============================================
    const alunosCertificados = matriculasCertificadas.map((matricula) => {
      const dataInscricao = new Date(matricula.oxetechlab_inscricoes?.created_at || matricula.created_at)
      const dataConclusao = new Date(matricula.updated_at || matricula.created_at)
      const tempoConclusao = Math.floor(
        (dataConclusao.getTime() - dataInscricao.getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        alunoId: matricula.aluno_id || 0,
        nome: matricula.alunos?.name || 'Sem nome',
        email: matricula.alunos?.email || '',
        telefone: matricula.alunos?.telefone || '',
        municipio: matricula.alunos?.municipio || 'Não informado',
        curso: matricula.turmas?.titulo || 'Sem curso',
        cursoNormalizado: normalizarCurso(matricula.turmas?.titulo || 'Sem curso').nomeNormalizado,
        laboratorio: matricula.turmas?.laboratorios?.nome || 'Sem laboratório',
        dataInscricao,
        dataConclusao,
        tempoConclusao,
        media: matricula.media,
        percentualFaltas: matricula.percentual_faltas,
        temCertificado: !!matricula.certificado_id,
      }
    }).sort((a, b) => b.dataConclusao.getTime() - a.dataConclusao.getTime())

    // ============================================
    // ANÁLISE DE EVASÃO
    // ============================================
    const evasaoPorLabMap = new Map<string, {
      laboratorio: string
      municipio: string
      totalInscricoes: number
      totalEvasao: number
      cursosSet: Set<string>
    }>()

    inscricoes.forEach((insc) => {
      if (String(insc.status) === 'ZERO' || String(insc.status) === 'ONE') {
        const labNome = insc.turmas?.laboratorios?.nome || 'Sem laboratório'
        const key = `${labNome}-${insc.turmas?.laboratorios?.municipio || ''}`

        if (!evasaoPorLabMap.has(key)) {
          evasaoPorLabMap.set(key, {
            laboratorio: labNome,
            municipio: insc.turmas?.laboratorios?.municipio || 'Não informado',
            totalInscricoes: 0,
            totalEvasao: 0,
            cursosSet: new Set<string>(),
          })
        }

        const evasaoLab = evasaoPorLabMap.get(key)!
        evasaoLab.totalInscricoes++
        evasaoLab.totalEvasao++
        if (insc.turmas?.titulo) {
          evasaoLab.cursosSet.add(insc.turmas.titulo)
        }
      }
    })

    // Adicionar total de inscrições por laboratório
    inscricoes.forEach((insc) => {
      const labNome = insc.turmas?.laboratorios?.nome || 'Sem laboratório'
      const key = `${labNome}-${insc.turmas?.laboratorios?.municipio || ''}`
      
      const evasaoLab = evasaoPorLabMap.get(key)
      if (evasaoLab) {
        evasaoLab.totalInscricoes++
      }
    })

    const evasaoPorLaboratorio = Array.from(evasaoPorLabMap.values())
      .map((evasao) => ({
        laboratorio: evasao.laboratorio,
        municipio: evasao.municipio,
        totalInscricoes: evasao.totalInscricoes,
        totalEvasao: evasao.totalEvasao,
        taxaEvasao: evasao.totalInscricoes > 0 
          ? (evasao.totalEvasao / evasao.totalInscricoes) * 100 
          : 0,
        cursosAfetados: Array.from(evasao.cursosSet),
      }))
      .sort((a, b) => b.taxaEvasao - a.taxaEvasao)

    const evasaoPorCurso = porCurso
      .filter((c) => c.taxaEvasao > 0)
      .map((c) => ({
        curso: c.curso,
        cursoNormalizado: c.cursoNormalizado,
        totalInscricoes: c.totalInscricoes,
        totalEvasao: c.taxaEvasao * c.totalInscricoes / 100,
        taxaEvasao: c.taxaEvasao,
      }))
      .sort((a, b) => b.taxaEvasao - a.taxaEvasao)

    // Principais motivos (simulado - ajustar conforme dados reais)
    const principaisMotivos = [
      {
        motivo: 'Desistência do aluno',
        quantidade: Math.floor(totalEvasao * 0.4),
        percentual: 40,
      },
      {
        motivo: 'Falta de frequência',
        quantidade: Math.floor(totalEvasao * 0.3),
        percentual: 30,
      },
      {
        motivo: 'Dificuldade no curso',
        quantidade: Math.floor(totalEvasao * 0.2),
        percentual: 20,
      },
      {
        motivo: 'Problemas pessoais',
        quantidade: Math.floor(totalEvasao * 0.1),
        percentual: 10,
      },
    ]

    // ============================================
    // DESEMPENHO
    // ============================================
    const laboratoriosTop10 = porLaboratorio
      .slice(0, 10)
      .map((lab) => ({
        laboratorio: lab.nome,
        municipio: lab.municipio,
        score: lab.totalCertificados * 0.5 + lab.taxaOcupacao * 0.3 + lab.cursosOferecidos * 10 * 0.2,
        criterios: {
          taxaCertificacao: lab.taxaCertificacao,
          taxaOcupacao: lab.taxaOcupacao,
          totalCertificados: lab.totalCertificados,
          diversidadeCursos: lab.cursosOferecidos,
        },
      }))

    const laboratoriosComProblemas: Array<{
      laboratorio: string
      municipio: string
      problema: string
      severidade: 'alta' | 'media' | 'baixa'
      detalhes: string
    }> = []

    porLaboratorio.forEach((lab) => {
      if (lab.taxaEvasao > 50) {
        laboratoriosComProblemas.push({
          laboratorio: lab.nome,
          municipio: lab.municipio,
          problema: 'Evasão alta',
          severidade: 'alta',
          detalhes: `Taxa de evasão de ${lab.taxaEvasao.toFixed(1)}%`,
        })
      } else if (lab.taxaEvasao > 30) {
        laboratoriosComProblemas.push({
          laboratorio: lab.nome,
          municipio: lab.municipio,
          problema: 'Evasão média',
          severidade: 'media',
          detalhes: `Taxa de evasão de ${lab.taxaEvasao.toFixed(1)}%`,
        })
      }

      if (lab.taxaOcupacao < 30) {
        laboratoriosComProblemas.push({
          laboratorio: lab.nome,
          municipio: lab.municipio,
          problema: 'Baixa ocupação',
          severidade: 'alta',
          detalhes: `Taxa de ocupação de apenas ${lab.taxaOcupacao.toFixed(1)}%`,
        })
      }

      if (lab.taxaCertificacao < 20) {
        laboratoriosComProblemas.push({
          laboratorio: lab.nome,
          municipio: lab.municipio,
          problema: 'Baixa certificação',
          severidade: 'media',
          detalhes: `Taxa de certificação de apenas ${lab.taxaCertificacao.toFixed(1)}%`,
        })
      }
    })

    // ============================================
    // TENDÊNCIAS
    // ============================================
    const tresMesesAtras = new Date()
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3)
    const seisMesesAtras = new Date()
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)

    const inscricoes3Meses = inscricoes.filter(
      (i) => new Date(i.created_at) >= tresMesesAtras
    ).length
    const inscricoes6Meses = inscricoes.filter(
      (i) => new Date(i.created_at) >= seisMesesAtras
    ).length
    const inscricoes6MesesAtras = inscricoes.filter(
      (i) => {
        const data = new Date(i.created_at)
        return data >= seisMesesAtras && data < tresMesesAtras
      }
    ).length

    const certificados3Meses = matriculasCertificadas.filter(
      (m) => new Date(m.updated_at || m.created_at) >= tresMesesAtras
    ).length
    const certificados6Meses = matriculasCertificadas.filter(
      (m) => new Date(m.updated_at || m.created_at) >= seisMesesAtras
    ).length
    const certificados6MesesAtras = matriculasCertificadas.filter(
      (m) => {
        const data = new Date(m.updated_at || m.created_at)
        return data >= seisMesesAtras && data < tresMesesAtras
      }
    ).length

    const calcularTendencia = (atual: number, anterior: number): 'crescimento' | 'estavel' | 'declinio' => {
      if (anterior === 0) return atual > 0 ? 'crescimento' : 'estavel'
      const percentual = ((atual - anterior) / anterior) * 100
      if (percentual > 5) return 'crescimento'
      if (percentual < -5) return 'declinio'
      return 'estavel'
    }

    // Sazonalidade (últimos 12 meses)
    const meses = Array.from({ length: 12 }, (_, i) => {
      const mes = new Date()
      mes.setMonth(mes.getMonth() - i)
      return mes
    }).reverse()

    const inscricoesPorMes = meses.map((mes) => {
      const mesInicio = new Date(mes.getFullYear(), mes.getMonth(), 1)
      const mesFim = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)
      
      return inscricoes.filter(
        (i) => {
          const data = new Date(i.created_at)
          return data >= mesInicio && data <= mesFim
        }
      ).length
    })

    const mesMaisAtivo = inscricoesPorMes.reduce((max, val, idx) => 
      val > max.val ? { val, idx } : max, 
      { val: 0, idx: 0 }
    )
    const mesMenosAtivo = inscricoesPorMes.reduce((min, val, idx) => 
      val < min.val ? { val, idx } : min, 
      { val: Infinity, idx: 0 }
    )

    const tendencias = {
      crescimentoInscricoes: {
        ultimos3Meses: inscricoes3Meses,
        ultimos6Meses: inscricoes6Meses,
        tendencia: calcularTendencia(inscricoes3Meses, inscricoes6MesesAtras),
      },
      crescimentoCertificados: {
        ultimos3Meses: certificados3Meses,
        ultimos6Meses: certificados6Meses,
        tendencia: calcularTendencia(certificados3Meses, certificados6MesesAtras),
      },
      sazonalidade: {
        mesMaisAtivo: meses[mesMaisAtivo.idx].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        mesMenosAtivo: meses[mesMenosAtivo.idx].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        variacao: mesMaisAtivo.val > 0 
          ? ((mesMaisAtivo.val - mesMenosAtivo.val) / mesMaisAtivo.val) * 100 
          : 0,
      },
    }

    // ============================================
    // ALERTAS
    // ============================================
    const alertas: AnaliseDetalhadaLab['alertas'] = []

    // Alertas de evasão alta
    evasaoPorLaboratorio
      .filter((e) => e.taxaEvasao > 50)
      .forEach((e) => {
        alertas.push({
          tipo: 'evasao',
          severidade: 'alta',
          titulo: `Evasão crítica em ${e.laboratorio}`,
          descricao: `Taxa de evasão de ${e.taxaEvasao.toFixed(1)}% - requer atenção imediata`,
          laboratorio: e.laboratorio,
        })
      })

    // Alertas de ocupação baixa
    porLaboratorio
      .filter((lab) => lab.taxaOcupacao < 30)
      .forEach((lab) => {
        alertas.push({
          tipo: 'ocupacao',
          severidade: 'alta',
          titulo: `Baixa ocupação em ${lab.nome}`,
          descricao: `Taxa de ocupação de apenas ${lab.taxaOcupacao.toFixed(1)}% - ${lab.vagasLivres} vagas livres`,
          laboratorio: lab.nome,
        })
      })

    // Alertas de certificação baixa
    porLaboratorio
      .filter((lab) => lab.taxaCertificacao < 20 && lab.totalInscricoes > 10)
      .forEach((lab) => {
        alertas.push({
          tipo: 'certificacao',
          severidade: 'media',
          titulo: `Baixa certificação em ${lab.nome}`,
          descricao: `Taxa de certificação de apenas ${lab.taxaCertificacao.toFixed(1)}%`,
          laboratorio: lab.nome,
        })
      })

    // Arredondar valores
    const round = (val: number, decimals = 2) => Math.round(val * 100) / 100

    return {
      resumo: {
        ...resumo,
        taxaCertificacaoGeral: round(resumo.taxaCertificacaoGeral),
        taxaEvasaoGeral: round(resumo.taxaEvasaoGeral),
        taxaOcupacaoGeral: round(resumo.taxaOcupacaoGeral),
      },
      porLaboratorio: porLaboratorio.map((lab) => ({
        ...lab,
        taxaCertificacao: round(lab.taxaCertificacao),
        taxaEvasao: round(lab.taxaEvasao),
        taxaOcupacao: round(lab.taxaOcupacao),
      })),
      porCurso: porCurso.map((curso) => ({
        ...curso,
        taxaCertificacao: round(curso.taxaCertificacao),
        taxaEvasao: round(curso.taxaEvasao),
      })),
      alunosCertificados,
      evasao: {
        porLaboratorio: evasaoPorLaboratorio.map((e) => ({
          ...e,
          taxaEvasao: round(e.taxaEvasao),
        })),
        porCurso: evasaoPorCurso.map((e) => ({
          ...e,
          taxaEvasao: round(e.taxaEvasao),
        })),
        principaisMotivos,
      },
      desempenho: {
        laboratoriosTop10: laboratoriosTop10.map((lab) => ({
          ...lab,
          score: round(lab.score),
          criterios: {
            ...lab.criterios,
            taxaCertificacao: round(lab.criterios.taxaCertificacao),
            taxaOcupacao: round(lab.criterios.taxaOcupacao),
          },
        })),
        laboratoriosComProblemas,
      },
      tendencias,
      alertas,
    }
  }, 10 * 60 * 1000) // Cache de 10 minutos
}

