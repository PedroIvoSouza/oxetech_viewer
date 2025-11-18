/**
 * Sistema de Alertas - OxeTech Dashboard
 * Níveis: verde, amarelo, vermelho, crítico
 */

export type AlertLevel = 'verde' | 'amarelo' | 'vermelho' | 'critico'

export interface Alert {
  id: string
  titulo: string
  descricao: string
  nivel: AlertLevel
  modulo: 'work' | 'edu' | 'lab' | 'trilhas' | 'geral'
  tipo: string
  prioridade: number // 1-10 (10 = máximo)
  timestamp: Date
  acaoRecomendada?: string
  link?: string
  dados?: Record<string, any>
}

export interface AlertConfig {
  modulo: 'work' | 'edu' | 'lab' | 'trilhas' | 'geral'
  limiteVerde: number
  limiteAmarelo: number
  limiteVermelho: number
  limiteCritico: number
}

/**
 * Configuração de limites por módulo
 */
const alertConfigs: Record<string, AlertConfig> = {
  lab: {
    modulo: 'lab',
    limiteVerde: 15, // < 15% ausência = verde
    limiteAmarelo: 30, // 15-30% ausência = amarelo
    limiteVermelho: 50, // 30-50% ausência = vermelho
    limiteCritico: 50, // > 50% ausência = crítico
  },
  work: {
    modulo: 'work',
    limiteVerde: 80, // > 80% taxa conversão = verde
    limiteAmarelo: 60, // 60-80% = amarelo
    limiteVermelho: 40, // 40-60% = vermelho
    limiteCritico: 40, // < 40% = crítico
  },
  edu: {
    modulo: 'edu',
    limiteVerde: 80, // > 80% frequência = verde
    limiteAmarelo: 60, // 60-80% = amarelo
    limiteVermelho: 40, // 40-60% = vermelho
    limiteCritico: 40, // < 40% = crítico
  },
  trilhas: {
    modulo: 'trilhas',
    limiteVerde: 70, // > 70% conclusão = verde
    limiteAmarelo: 50, // 50-70% = amarelo
    limiteVermelho: 30, // 30-50% = vermelho
    limiteCritico: 30, // < 30% = crítico
  },
}

/**
 * Determinar nível de alerta baseado no valor
 */
export function determinarNivelAlerta(
  valor: number,
  tipo: 'percentual' | 'valor',
  modulo: 'work' | 'edu' | 'lab' | 'trilhas',
  invertido: boolean = false
): AlertLevel {
  const config = alertConfigs[modulo]
  if (!config) return 'verde'

  let valorComparacao = valor
  if (tipo === 'percentual') {
    valorComparacao = valor // Já é percentual
  }

  // Se invertido, valores menores são melhores
  if (invertido) {
    if (valorComparacao <= config.limiteVerde) return 'verde'
    if (valorComparacao <= config.limiteAmarelo) return 'amarelo'
    if (valorComparacao <= config.limiteVermelho) return 'vermelho'
    return 'critico'
  }

  // Valores maiores são melhores
  if (valorComparacao >= config.limiteVermelho) return 'verde'
  if (valorComparacao >= config.limiteAmarelo) return 'amarelo'
  if (valorComparacao >= config.limiteVermelho) return 'vermelho'
  return 'critico'
}

/**
 * Gerar alertas para Lab (ausência de alunos)
 */
export function gerarAlertasLab(
  turmas: Array<{
    id: number
    titulo: string
    ausenciaPercentual: number
    totalAlunos: number
    presentes: number
    ausentes: number
    ultimaPresenca?: Date
    escola?: string
    professor?: string
  }>
): Alert[] {
  const alertas: Alert[] = []

  turmas.forEach((turma) => {
    const ausencia = turma.ausenciaPercentual
    const nivel = determinarNivelAlerta(ausencia, 'percentual', 'lab', true)

    if (nivel !== 'verde') {
      alertas.push({
        id: `lab-turma-${turma.id}`,
        titulo: `Turma: ${turma.titulo}`,
        descricao: `Ausência de ${ausencia.toFixed(1)}% (${turma.ausentes} de ${turma.totalAlunos} alunos)`,
        nivel,
        modulo: 'lab',
        tipo: 'ausencia',
        prioridade: nivel === 'critico' ? 10 : nivel === 'vermelho' ? 8 : 5,
        timestamp: new Date(),
        acaoRecomendada: nivel === 'critico' 
          ? 'Ação imediata: Contatar professor e alunos'
          : 'Revisar estratégia de engajamento',
        link: `/lab/turmas/${turma.id}`,
        dados: turma,
      })
    }

    // Alerta para turmas sem presença registrada hoje
    if (!turma.ultimaPresenca || 
        new Date().getTime() - new Date(turma.ultimaPresenca).getTime() > 24 * 60 * 60 * 1000) {
      alertas.push({
        id: `lab-turma-${turma.id}-sem-presenca`,
        titulo: `Turma sem presença registrada: ${turma.titulo}`,
        descricao: 'Nenhuma presença registrada nas últimas 24 horas',
        nivel: 'amarelo',
        modulo: 'lab',
        tipo: 'sem_presenca',
        prioridade: 6,
        timestamp: new Date(),
        acaoRecomendada: 'Verificar se a aula foi realizada e registrar presença',
        link: `/lab/turmas/${turma.id}`,
        dados: turma,
      })
    }
  })

  return alertas.sort((a, b) => b.prioridade - a.prioridade)
}

/**
 * Gerar alertas para Work (edital e empresas)
 */
export function gerarAlertasWork(
  dados: {
    empresasHabilitadas: number
    empresasPendentes: number
    empresasSemVaga: number
    empresasSemPlano: number
    empresasSemImplementacao: number
    empresasSemContrapartida: number
    empresasSemRelatorio: number
    rupturasPrecoces: number
    bolsistasSemAtividade: number
    ciclosAtrasados: number
  }
): Alert[] {
  const alertas: Alert[] = []

  // Empresas habilitadas sem publicar vaga
  if (dados.empresasSemVaga > 0) {
    alertas.push({
      id: 'work-empresas-sem-vaga',
      titulo: `${dados.empresasSemVaga} empresa(s) habilitada(s) sem publicar vaga`,
      descricao: 'Empresas que foram habilitadas mas ainda não publicaram vagas',
      nivel: 'vermelho',
      modulo: 'work',
      tipo: 'empresa_sem_vaga',
      prioridade: 9,
      timestamp: new Date(),
      acaoRecomendada: 'Contatar empresas para publicação de vagas',
      link: '/work/empresas?status=habilitada_sem_vaga',
      dados: { total: dados.empresasSemVaga },
    })
  }

  // Empresas sem plano de trabalho
  if (dados.empresasSemPlano > 0) {
    alertas.push({
      id: 'work-empresas-sem-plano',
      titulo: `${dados.empresasSemPlano} empresa(s) sem plano de trabalho`,
      descricao: 'Empresas que não enviaram plano de trabalho',
      nivel: 'critico',
      modulo: 'work',
      tipo: 'empresa_sem_plano',
      prioridade: 10,
      timestamp: new Date(),
      acaoRecomendada: 'Ação imediata: Solicitar envio do plano de trabalho',
      link: '/work/empresas?status=sem_plano',
      dados: { total: dados.empresasSemPlano },
    })
  }

  // Empresas que selecionaram bolsista mas não formalizaram
  if (dados.empresasSemImplementacao > 0) {
    alertas.push({
      id: 'work-empresas-sem-implementacao',
      titulo: `${dados.empresasSemImplementacao} empresa(s) sem implementação formalizada`,
      descricao: 'Empresas que selecionaram bolsista mas não formalizaram implementação',
      nivel: 'critico',
      modulo: 'work',
      tipo: 'empresa_sem_implementacao',
      prioridade: 10,
      timestamp: new Date(),
      acaoRecomendada: 'Ação imediata: Formalizar implementação do bolsista',
      link: '/work/empresas?status=sem_implementacao',
      dados: { total: dados.empresasSemImplementacao },
    })
  }

  // Bolsistas sem registro de atividade
  if (dados.bolsistasSemAtividade > 0) {
    alertas.push({
      id: 'work-bolsistas-sem-atividade',
      titulo: `${dados.bolsistasSemAtividade} bolsista(s) sem registro de atividade (14+ dias)`,
      descricao: 'Bolsistas que não registraram atividades há mais de 14 dias',
      nivel: 'amarelo',
      modulo: 'work',
      tipo: 'bolsista_sem_atividade',
      prioridade: 7,
      timestamp: new Date(),
      acaoRecomendada: 'Verificar status do bolsista e solicitar registro',
      link: '/work/bolsistas?status=sem_atividade',
      dados: { total: dados.bolsistasSemAtividade },
    })
  }

  // Empresas com contrapartida atrasada
  if (dados.empresasSemContrapartida > 0) {
    alertas.push({
      id: 'work-empresas-sem-contrapartida',
      titulo: `${dados.empresasSemContrapartida} empresa(s) com contrapartida atrasada`,
      descricao: 'Empresas com pagamento de contrapartida em atraso',
      nivel: 'critico',
      modulo: 'work',
      tipo: 'empresa_contrapartida_atrasada',
      prioridade: 10,
      timestamp: new Date(),
      acaoRecomendada: 'Ação imediata: Cobrar contrapartida e verificar situação',
      link: '/work/empresas?status=contrapartida_atrasada',
      dados: { total: dados.empresasSemContrapartida },
    })
  }

  // Rupturas precoces
  if (dados.rupturasPrecoces > 0) {
    alertas.push({
      id: 'work-rupturas-precoces',
      titulo: `${dados.rupturasPrecoces} ruptura(s) precoce(s) (< 90 dias)`,
      descricao: 'Bolsistas desligados antes de 90 dias',
      nivel: 'vermelho',
      modulo: 'work',
      tipo: 'ruptura_precoce',
      prioridade: 8,
      timestamp: new Date(),
      acaoRecomendada: 'Investigar causas e ações corretivas',
      link: '/work/bolsistas?status=ruptura_precoce',
      dados: { total: dados.rupturasPrecoces },
    })
  }

  return alertas.sort((a, b) => b.prioridade - a.prioridade)
}

/**
 * Gerar alertas para Edu (frequência e evasão)
 */
export function gerarAlertasEdu(
  dados: {
    escolasBaixaFrequencia: Array<{ nome: string; frequencia: number }>
    cursosAltaEvasao: Array<{ curso: string; evasao: number }>
    aulasSemPresenca: number
    professoresSemFrequencia: number
  }
): Alert[] {
  const alertas: Alert[] = []

  // Escolas com baixa frequência
  dados.escolasBaixaFrequencia.forEach((escola) => {
    const nivel = determinarNivelAlerta(escola.frequencia, 'percentual', 'edu', false)
    if (nivel !== 'verde') {
      alertas.push({
        id: `edu-escola-${escola.nome}`,
        titulo: `Escola: ${escola.nome} - Frequência baixa`,
        descricao: `Frequência de ${escola.frequencia.toFixed(1)}% (abaixo de 60%)`,
        nivel,
        modulo: 'edu',
        tipo: 'frequencia_baixa',
        prioridade: nivel === 'critico' ? 9 : nivel === 'vermelho' ? 7 : 5,
        timestamp: new Date(),
        acaoRecomendada: 'Revisar estratégia de engajamento e contatar escola',
        link: `/edu/escolas?busca=${escola.nome}`,
        dados: escola,
      })
    }
  })

  // Cursos com alta evasão
  dados.cursosAltaEvasao.forEach((curso) => {
    if (curso.evasao > 20) {
      alertas.push({
        id: `edu-curso-${curso.curso}`,
        titulo: `Curso: ${curso.curso} - Evasão alta`,
        descricao: `Evasão de ${curso.evasao.toFixed(1)}% (acima de 20%)`,
        nivel: curso.evasao > 40 ? 'critico' : 'vermelho',
        modulo: 'edu',
        tipo: 'evasao_alta',
        prioridade: curso.evasao > 40 ? 9 : 7,
        timestamp: new Date(),
        acaoRecomendada: 'Investigar causas da evasão e criar ações de retenção',
        link: `/edu/cursos?busca=${curso.curso}`,
        dados: curso,
      })
    }
  })

  // Aulas sem presença registrada
  if (dados.aulasSemPresenca > 0) {
    alertas.push({
      id: 'edu-aulas-sem-presenca',
      titulo: `${dados.aulasSemPresenca} aula(s) sem presença registrada`,
      descricao: 'Aulas cadastradas sem registro de presença até 23:59',
      nivel: 'amarelo',
      modulo: 'edu',
      tipo: 'aula_sem_presenca',
      prioridade: 6,
      timestamp: new Date(),
      acaoRecomendada: 'Solicitar registro de presença dos professores',
      link: '/edu/aulas?status=sem_presenca',
      dados: { total: dados.aulasSemPresenca },
    })
  }

  return alertas.sort((a, b) => b.prioridade - a.prioridade)
}

/**
 * Gerar alertas para Trilhas (conclusão e engajamento)
 */
export function gerarAlertasTrilhas(
  dados: {
    trilhasBaixaConclusao: Array<{ trilha: string; conclusao: number }>
    modulosAbandonados: number
    trilhasQueda: Array<{ trilha: string; queda: number }>
  }
): Alert[] {
  const alertas: Alert[] = []

  // Trilhas com baixa conclusão
  dados.trilhasBaixaConclusao.forEach((trilha) => {
    const nivel = determinarNivelAlerta(trilha.conclusao, 'percentual', 'trilhas', false)
    if (nivel !== 'verde') {
      alertas.push({
        id: `trilhas-${trilha.trilha}`,
        titulo: `Trilha: ${trilha.trilha} - Conclusão baixa`,
        descricao: `Taxa de conclusão de ${trilha.conclusao.toFixed(1)}%`,
        nivel,
        modulo: 'trilhas',
        tipo: 'conclusao_baixa',
        prioridade: nivel === 'critico' ? 8 : nivel === 'vermelho' ? 6 : 4,
        timestamp: new Date(),
        acaoRecomendada: 'Revisar conteúdo e estratégia de engajamento',
        link: `/trilhas?busca=${trilha.trilha}`,
        dados: trilha,
      })
    }
  })

  // Trilhas com queda de performance
  dados.trilhasQueda.forEach((trilha) => {
    if (trilha.queda > 40) {
      alertas.push({
        id: `trilhas-queda-${trilha.trilha}`,
        titulo: `Trilha: ${trilha.trilha} - Queda de ${trilha.queda.toFixed(1)}%`,
        descricao: `Queda de mais de 40% na performance`,
        nivel: 'vermelho',
        modulo: 'trilhas',
        tipo: 'queda_performance',
        prioridade: 7,
        timestamp: new Date(),
        acaoRecomendada: 'Investigar causas da queda e criar ações de retenção',
        link: `/trilhas?busca=${trilha.trilha}`,
        dados: trilha,
      })
    }
  })

  // Módulos abandonados
  if (dados.modulosAbandonados > 0) {
    alertas.push({
      id: 'trilhas-modulos-abandonados',
      titulo: `${dados.modulosAbandonados} módulo(s) abandonado(s) (30+ dias)`,
      descricao: 'Módulos sem conclusão por mais de 30 dias',
      nivel: 'amarelo',
      modulo: 'trilhas',
      tipo: 'modulo_abandonado',
      prioridade: 5,
      timestamp: new Date(),
      acaoRecomendada: 'Enviar notificações de retomada aos alunos',
      link: '/trilhas/modulos?status=abandonado',
      dados: { total: dados.modulosAbandonados },
    })
  }

  return alertas.sort((a, b) => b.prioridade - a.prioridade)
}

/**
 * Obter cor do nível de alerta
 */
export function getAlertColor(nivel: AlertLevel): string {
  const colors = {
    verde: '#10B981', // green-500
    amarelo: '#F59E0B', // yellow-500
    vermelho: '#EF4444', // red-500
    critico: '#DC2626', // red-600
  }
  return colors[nivel]
}

/**
 * Obter ícone do nível de alerta
 */
export function getAlertIcon(nivel: AlertLevel): string {
  const icons = {
    verde: '✅',
    amarelo: '⚠️',
    vermelho: '🔴',
    critico: '🚨',
  }
  return icons[nivel]
}

