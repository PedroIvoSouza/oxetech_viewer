/**
 * Sistema de Auditoria - OxeTech Dashboard
 * Detecta irregularidades e inconsistências
 */

export type AuditSeverity = 'baixa' | 'media' | 'alta' | 'critica'

export interface AuditFinding {
  id: string
  tipo: string
  severidade: AuditSeverity
  titulo: string
  descricao: string
  modulo: 'work' | 'edu' | 'lab' | 'trilhas' | 'geral'
  entidade: {
    tipo: 'empresa' | 'aluno' | 'professor' | 'turma' | 'trilha' | 'documento'
    id: number | string
    nome: string
  }
  evidencia: string[]
  recomendacao: string
  timestamp: Date
  status: 'pendente' | 'em_analise' | 'resolvido' | 'falso_positivo'
  resolucao?: {
    resolvidoPor: string
    resolvidoEm: Date
    acaoTomada: string
  }
}

/**
 * Auditoria para Work (empresas e bolsistas)
 */
export async function auditarWork(
  empresas: Array<{
    id: number
    razao_social: string
    cnpj: string
    email: string
    representantes: Array<{ nome: string; cpf: string; cargo: string }>
    professores?: Array<{ nome: string; cpf: string }>
    alunos?: Array<{ nome: string; cpf: string }>
    vagas: Array<{ id: number; titulo: string }>
    bolsistas: Array<{ id: number; nome: string; cpf: string }>
    documentos?: Array<{ tipo: string; valido: boolean }>
  }>
): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = []

  empresas.forEach((empresa) => {
    // 1. Duplicação de CPF (empresa-professor-aluno)
    const cpfs = new Map<string, { tipo: string; nome: string }>()

    empresa.representantes?.forEach((rep) => {
      if (cpfs.has(rep.cpf)) {
        const existente = cpfs.get(rep.cpf)!
        findings.push({
          id: `work-duplicacao-cpf-${empresa.id}-${rep.cpf}`,
          tipo: 'duplicacao_cpf',
          severidade: 'critica',
          titulo: `CPF duplicado: ${rep.cpf}`,
          descricao: `CPF usado em ${existente.tipo} (${existente.nome}) e Representante (${rep.nome}) na mesma empresa`,
          modulo: 'work',
          entidade: {
            tipo: 'empresa',
            id: empresa.id,
            nome: empresa.razao_social,
          },
          evidencia: [
            `${existente.tipo}: ${existente.nome} - CPF: ${rep.cpf}`,
            `Representante: ${rep.nome} - CPF: ${rep.cpf}`,
          ],
          recomendacao: 'Verificar se é a mesma pessoa ou possível irregularidade',
          timestamp: new Date(),
          status: 'pendente',
        })
      } else {
        cpfs.set(rep.cpf, { tipo: 'Representante', nome: rep.nome })
      }
    })

    empresa.professores?.forEach((prof) => {
      if (cpfs.has(prof.cpf)) {
        const existente = cpfs.get(prof.cpf)!
        findings.push({
          id: `work-duplicacao-cpf-prof-${empresa.id}-${prof.cpf}`,
          tipo: 'duplicacao_cpf',
          severidade: 'alta',
          titulo: `CPF duplicado: ${prof.cpf}`,
          descricao: `Professor ${prof.nome} tem CPF já cadastrado como ${existente.tipo} na empresa`,
          modulo: 'work',
          entidade: {
            tipo: 'empresa',
            id: empresa.id,
            nome: empresa.razao_social,
          },
          evidencia: [
            `${existente.tipo}: ${existente.nome} - CPF: ${prof.cpf}`,
            `Professor: ${prof.nome} - CPF: ${prof.cpf}`,
          ],
          recomendacao: 'Verificar se professor pode ser representante (conflito de interesse)',
          timestamp: new Date(),
          status: 'pendente',
        })
      } else {
        cpfs.set(prof.cpf, { tipo: 'Professor', nome: prof.nome })
      }
    })

    // 2. Documentos faltantes ou inválidos
    const documentosObrigatorios = ['CNPJ', 'Inscrição Estadual', 'Comprovação de Endereço', 'Plano de Trabalho']
    const documentosEnviados = empresa.documentos?.map((d) => d.tipo) || []
    const documentosFaltantes = documentosObrigatorios.filter((doc) => !documentosEnviados.includes(doc))

    if (documentosFaltantes.length > 0) {
      findings.push({
        id: `work-documentos-faltantes-${empresa.id}`,
        tipo: 'documentos_faltantes',
        severidade: 'alta',
        titulo: `Empresa: ${empresa.razao_social} - Documentos faltantes`,
        descricao: `${documentosFaltantes.length} documento(s) obrigatório(s) não enviado(s)`,
        modulo: 'work',
        entidade: {
          tipo: 'empresa',
          id: empresa.id,
          nome: empresa.razao_social,
        },
        evidencia: documentosFaltantes,
        recomendacao: 'Solicitar envio dos documentos faltantes',
        timestamp: new Date(),
        status: 'pendente',
      })
    }

    // 3. Empresa com vínculo professor-aluno (possível conflito)
    if (empresa.professores && empresa.alunos) {
      const cpfsProfessores = new Set(empresa.professores.map((p) => p.cpf))
      const alunosProfessor = empresa.alunos.filter((a) => cpfsProfessores.has(a.cpf))

      if (alunosProfessor.length > 0) {
        findings.push({
          id: `work-vinculo-professor-aluno-${empresa.id}`,
          tipo: 'vinculo_irregular',
          severidade: 'media',
          titulo: `Possível vínculo irregular: Professor como aluno`,
          descricao: `${alunosProfessor.length} pessoa(s) cadastrada(s) como professor e aluno na mesma empresa`,
          modulo: 'work',
          entidade: {
            tipo: 'empresa',
            id: empresa.id,
            nome: empresa.razao_social,
          },
          evidencia: alunosProfessor.map((a) => `${a.nome} - CPF: ${a.cpf}`),
          recomendacao: 'Verificar se é permitido professor ser aluno (pode ser irregular)',
          timestamp: new Date(),
          status: 'pendente',
        })
      }
    }

    // 4. Empresa sem vagas mas com bolsistas
    if (empresa.vagas.length === 0 && empresa.bolsistas.length > 0) {
      findings.push({
        id: `work-empresa-sem-vagas-bolsistas-${empresa.id}`,
        tipo: 'inconsistencia',
        severidade: 'alta',
        titulo: `Empresa sem vagas cadastradas mas com bolsistas`,
        descricao: `Empresa possui ${empresa.bolsistas.length} bolsista(s) mas nenhuma vaga cadastrada`,
        modulo: 'work',
        entidade: {
          tipo: 'empresa',
          id: empresa.id,
          nome: empresa.razao_social,
        },
        evidencia: [
          `Vagas cadastradas: ${empresa.vagas.length}`,
          `Bolsistas: ${empresa.bolsistas.length}`,
        ],
        recomendacao: 'Verificar inconsistência nos dados e corrigir',
        timestamp: new Date(),
        status: 'pendente',
      })
    }
  })

  return findings
}

/**
 * Auditoria para Lab (presença e frequência)
 */
export async function auditarLab(
  turmas: Array<{
    id: number
    titulo: string
    professor: string
    escola: string
    totalAlunos: number
    presencas: number
    ausencias: number
    frequencia: number
    ultimaAula?: Date
    aulasCadastradas: number
    aulasRealizadas: number
  }>
): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = []

  turmas.forEach((turma) => {
    // 1. Turma com ausência crítica (> 50%)
    if (turma.frequencia < 50) {
      findings.push({
        id: `lab-turma-ausencia-critica-${turma.id}`,
        tipo: 'ausencia_critica',
        severidade: 'critica',
        titulo: `Turma: ${turma.titulo} - Ausência crítica`,
        descricao: `Frequência de apenas ${turma.frequencia.toFixed(1)}% (abaixo de 50%)`,
        modulo: 'lab',
        entidade: {
          tipo: 'turma',
          id: turma.id,
          nome: turma.titulo,
        },
        evidencia: [
          `Frequência: ${turma.frequencia.toFixed(1)}%`,
          `Ausências: ${turma.ausencias} de ${turma.totalAlunos} alunos`,
          `Professor: ${turma.professor}`,
          `Escola: ${turma.escola}`,
        ],
        recomendacao: 'Ação imediata: Investigar causas e tomar medidas corretivas',
        timestamp: new Date(),
        status: 'pendente',
      })
    }

    // 2. Turma sem aulas realizadas
    if (turma.aulasCadastradas > 0 && turma.aulasRealizadas === 0) {
      findings.push({
        id: `lab-turma-sem-aulas-${turma.id}`,
        tipo: 'sem_aulas',
        severidade: 'alta',
        titulo: `Turma: ${turma.titulo} - Sem aulas realizadas`,
        descricao: `${turma.aulasCadastradas} aula(s) cadastrada(s) mas nenhuma realizada`,
        modulo: 'lab',
        entidade: {
          tipo: 'turma',
          id: turma.id,
          nome: turma.titulo,
        },
        evidencia: [
          `Aulas cadastradas: ${turma.aulasCadastradas}`,
          `Aulas realizadas: ${turma.aulasRealizadas}`,
        ],
        recomendacao: 'Verificar se as aulas estão sendo realizadas e registrar presença',
        timestamp: new Date(),
        status: 'pendente',
      })
    }

    // 3. Turma sem presença há mais de 7 dias
    if (turma.ultimaAula) {
      const diasSemAula = (new Date().getTime() - new Date(turma.ultimaAula).getTime()) / (1000 * 60 * 60 * 24)
      if (diasSemAula > 7) {
        findings.push({
          id: `lab-turma-sem-atividade-${turma.id}`,
          tipo: 'inatividade',
          severidade: 'media',
          titulo: `Turma: ${turma.titulo} - Sem atividade há ${Math.floor(diasSemAula)} dias`,
          descricao: `Última aula realizada há mais de 7 dias`,
          modulo: 'lab',
          entidade: {
            tipo: 'turma',
            id: turma.id,
            nome: turma.titulo,
          },
          evidencia: [
            `Última aula: ${new Date(turma.ultimaAula).toLocaleDateString('pt-BR')}`,
            `Dias sem atividade: ${Math.floor(diasSemAula)}`,
          ],
          recomendacao: 'Verificar status da turma e contatar professor',
          timestamp: new Date(),
          status: 'pendente',
        })
      }
    }
  })

  return findings
}

/**
 * Auditoria geral (cross-module)
 */
export async function auditarGeral(
  dados: {
    alunosDuplicados?: Array<{ cpf: string; nomes: string[]; programas: string[] }>
    empresasSuspensas?: Array<{ id: number; nome: string; motivo: string }>
    inconsistenciasData?: Array<{ tipo: string; descricao: string }>
  }
): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = []

  // Alunos duplicados em múltiplos programas
  dados.alunosDuplicados?.forEach((aluno) => {
    if (aluno.programas.length > 3) {
      findings.push({
        id: `geral-aluno-duplicado-${aluno.cpf}`,
        tipo: 'aluno_multiplos_programas',
        severidade: 'baixa',
        titulo: `Aluno em múltiplos programas: ${aluno.nomes[0]}`,
        descricao: `CPF ${aluno.cpf} cadastrado em ${aluno.programas.length} programas diferentes`,
        modulo: 'geral',
        entidade: {
          tipo: 'aluno',
          id: aluno.cpf,
          nome: aluno.nomes[0],
        },
        evidencia: [
          `CPF: ${aluno.cpf}`,
          `Programas: ${aluno.programas.join(', ')}`,
          `Nomes cadastrados: ${aluno.nomes.join(', ')}`,
        ],
        recomendacao: 'Verificar se é o mesmo aluno ou possível duplicação',
        timestamp: new Date(),
        status: 'pendente',
      })
    }
  })

  // Empresas suspensas
  dados.empresasSuspensas?.forEach((empresa) => {
    findings.push({
      id: `geral-empresa-suspensa-${empresa.id}`,
      tipo: 'empresa_suspensa',
      severidade: 'alta',
      titulo: `Empresa suspensa: ${empresa.nome}`,
      descricao: empresa.motivo,
      modulo: 'work',
      entidade: {
        tipo: 'empresa',
        id: empresa.id,
        nome: empresa.nome,
      },
      evidencia: [empresa.motivo],
      recomendacao: 'Revisar situação e tomar ações necessárias',
      timestamp: new Date(),
      status: 'pendente',
    })
  })

  // Inconsistências de dados
  dados.inconsistenciasData?.forEach((inc) => {
    findings.push({
      id: `geral-inconsistencia-${inc.tipo}`,
      tipo: 'inconsistencia_dados',
      severidade: 'media',
      titulo: `Inconsistência: ${inc.tipo}`,
      descricao: inc.descricao,
      modulo: 'geral',
      entidade: {
        tipo: 'documento',
        id: inc.tipo,
        nome: inc.tipo,
      },
      evidencia: [inc.descricao],
      recomendacao: 'Verificar e corrigir inconsistência nos dados',
      timestamp: new Date(),
      status: 'pendente',
    })
  })

  return findings
}

/**
 * Obter cor da severidade
 */
export function getSeverityColor(severidade: AuditSeverity): string {
  const colors = {
    baixa: '#6B7280', // gray-500
    media: '#F59E0B', // yellow-500
    alta: '#EF4444', // red-500
    critica: '#DC2626', // red-600
  }
  return colors[severidade]
}

