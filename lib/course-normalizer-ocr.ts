/**
 * Normalizador de Cursos com Correção OCR
 * Integra correções de OCR do script de limpeza
 */

// Importar dados de cursos limpos
let cursosLimpos: CursoLimpo[] = []

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  cursosLimpos = require('./data/cursos-ocr-limpos.json') as CursoLimpo[]
} catch (error) {
  // Arquivo não encontrado, usar array vazio
  console.warn('Arquivo cursos-ocr-limpos.json não encontrado')
}

interface CursoLimpo {
  original: string
  cursoCorrigido: string
  agrupamento: string
}

// Mapeamento de cursos OCR corrigidos
const mapeamentoOCR = new Map<string, string>()

// Carregar mapeamento
if (Array.isArray(cursosLimpos)) {
  cursosLimpos.forEach((curso: CursoLimpo) => {
    mapeamentoOCR.set(curso.original.toLowerCase(), curso.cursoCorrigido)
  })
}

/**
 * Corrige erros comuns de OCR no nome do curso
 */
export function corrigirOCR(nome: string): string {
  const nomeLower = nome.toLowerCase().trim()
  
  // Verificar se existe correção direta
  if (mapeamentoOCR.has(nomeLower)) {
    return mapeamentoOCR.get(nomeLower)!
  }
  
  // Aplicar correções heurísticas gerais
  let corrigido = nome
  
  // ============================================
  // CORREÇÕES DE INFORMÁTICA (prioridade alta)
  // ============================================
  corrigido = corrigido
    .replace(/Horaica Básicaura/gi, 'Informática Básica')
    .replace(/Horaica Básica/gi, 'Informática Básica')
    .replace(/Iforáica Básicaura/gi, 'Informática Básica')
    .replace(/Iforáica Básica/gi, 'Informática Básica')
    .replace(/Iforá?ica/gi, 'Informática')
    .replace(/Inforáica/gi, 'Informática')
    .replace(/Infora/gi, 'Informa')
    .replace(/Horaica/gi, 'Informática')
    .replace(/Básicaura/gi, 'Básica')
    .replace(/Básicaurici/gi, 'Básica')
  
  // ============================================
  // CORREÇÕES DE PYTHON (prioridade alta)
  // ============================================
    .replace(/Pyhodescoplicado/gi, 'Python Descomplicado')
    .replace(/Pyhopara Auoação/gi, 'Python para Automação')
    .replace(/Pyhopara/gi, 'Python para')
    .replace(/Pyho Básico/gi, 'Python Básico')
    .replace(/Pyho\+/gi, 'Python+')
    .replace(/Copyhoekier/gi, 'Python')
    .replace(/Copyho/gi, 'Python')
    .replace(/Epyho/gi, 'Python')
    .replace(/Pyho/gi, 'Python')
    .replace(/Pythoncom/gi, 'Python com')
    .replace(/Pythonpara/gi, 'Python para')
    .replace(/Pythondescoplicado/gi, 'Python Descomplicado')
  
  // ============================================
  // CORREÇÕES DE PROGRAMAÇÃO
  // ============================================
    .replace(/Prograação Copyho/gi, 'Programação Python')
    .replace(/Prograação Epyho/gi, 'Programação Python')
    .replace(/Prograação Básica Epyho/gi, 'Programação Básica Python')
    .replace(/Lógica De Prograação Copyho/gi, 'Lógica De Programação Python')
    .replace(/Lógica De Prograação \+ Irodução À Pyho/gi, 'Lógica De Programação + Introdução À Python')
    .replace(/Lógica De Prograação/gi, 'Lógica De Programação')
    .replace(/Prograação/gi, 'Programação')
    .replace(/Prograador Web/gi, 'Programador Web')
    .replace(/Prograador/gi, 'Programador')
    .replace(/Prograa/gi, 'Programa')
  
  // ============================================
  // CORREÇÕES DE CIBERSEGURANÇA
  // ============================================
    .replace(/Fudaeos De Ciberseguraçaça/gi, 'Fundamentos De Cibersegurança')
    .replace(/Ciberseguraçaça/gi, 'Cibersegurança')
    .replace(/Cibersegurançança/gi, 'Cibersegurança')
    .replace(/Cibersegura/gi, 'Cibersegurança')
  
  // ============================================
  // CORREÇÕES DE INTRODUÇÃO
  // ============================================
    .replace(/Irodução À Pyho/gi, 'Introdução À Python')
    .replace(/Irodução A Prograação Copyho/gi, 'Introdução A Programação Python')
    .replace(/Irodução A Baco De Dados/gi, 'Introdução A Banco De Dados')
    .replace(/Irodução A Informática Básica/gi, 'Introdução A Informática Básica')
    .replace(/Irodução A/gi, 'Introdução A')
    .replace(/Irodução À/gi, 'Introdução À')
    .replace(/Irodução/gi, 'Introdução')
    .replace(/Irodu/gi, 'Introdu')
  
  // ============================================
  // CORREÇÕES DE ANÁLISE
  // ============================================
    .replace(/Aalise De Dados Copyho/gi, 'Análise De Dados Python')
    .replace(/Aalise De Dados Epyho/gi, 'Análise De Dados Python')
    .replace(/Aalise/gi, 'Análise')
    .replace(/Aálise/gi, 'Análise')
  
  // ============================================
  // CORREÇÕES DE BANCO DE DADOS
  // ============================================
    .replace(/Baco De Dados/gi, 'Banco De Dados')
    .replace(/Baco/gi, 'Banco')
  
  // ============================================
  // CORREÇÕES DE LINGUAGENS
  // ============================================
    .replace(/Workshop De Liguages Dearcação/gi, 'Workshop De Linguagens De Programação')
    .replace(/Liguages Dearcação/gi, 'Linguagens De Programação')
    .replace(/Liguages/gi, 'Linguagens')
    .replace(/Liguage/gi, 'Linguagem')
    .replace(/Dearcação/gi, 'De Programação')
  
  // ============================================
  // CORREÇÕES DE DESENVOLVIMENTO
  // ============================================
    .replace(/Desevolvico Epyho/gi, 'Desenvolvido Python')
    .replace(/Desevolvico Web/gi, 'Desenvolvimento Web')
    .replace(/Desevolvico/gi, 'Desenvolvido')
    .replace(/Desevolvie/gi, 'Desenvolve')
  
  // ============================================
  // CORREÇÕES DE FUNDAMENTOS
  // ============================================
    .replace(/Fudaeos/gi, 'Fundamentos')
  
  // ============================================
  // CORREÇÕES DE HACKATHON
  // ============================================
    .replace(/Hackahoehoeageaoês Daulher/gi, 'Hackathon Desafios Daulher')
    .replace(/Hackahoehoeageaoês/gi, 'Hackathon')
    .replace(/Daulher/gi, 'Desafios Daulher')
    .replace(/Paraulheres/gi, 'Para Mulheres')
  
  // ============================================
  // CORREÇÕES DE AUTOMAÇÃO
  // ============================================
    .replace(/Auoação/gi, 'Automação')
    .replace(/Para Auoação/gi, 'Para Automação')
  
  // ============================================
  // CORREÇÕES DE MÓDULO
  // ============================================
    .replace(/Coardulo/gi, 'Módulo')
    .replace(/Coarduío/gi, 'Arduino')
  
  // ============================================
  // CORREÇÕES DE COPYWRITING
  // ============================================
    .replace(/Copyhobeedio Bees/gi, 'Copywriting Para Redes Sociais')
    .replace(/Análise De Dados Copywriting Para Redes Sociais/gi, 'Copywriting Para Redes Sociais')
    .replace(/Copyhobeedio/gi, 'Copywriting')
    .replace(/Copyhoekier/gi, 'Copywriter')
    .replace(/beedio/gi, ' e ')
    .replace(/Bees/gi, 'Redes Sociais')
  
  // ============================================
  // CORREÇÕES DE DEVOPS
  // ============================================
    .replace(/De Cava/gi, 'DevOps')
    .replace(/Cava/gi, 'Java')
  
  // ============================================
  // CORREÇÕES DE GIT
  // ============================================
    .replace(/Gie Gihub/gi, 'Git GitHub')
    .replace(/Gie/gi, 'Git')
    .replace(/Gihub/gi, 'GitHub')
  
  // ============================================
  // CORREÇÕES DE OUTROS
  // ============================================
    .replace(/Prieiros/gi, 'Primeiros')
    .replace(/Passosa/gi, 'Passos em')
    .replace(/Avaçado/gi, 'Avançado')
    .replace(/Aplicações Práicas/gi, 'Aplicações Práticas')
    .replace(/\s*Poo\s*/gi, ' ')
    .replace(/^De\s+/gi, '')
    .replace(/^De Iforáica Básica$/gi, 'Informática Básica')
    .replace(/^De Power B\.i\.?$/gi, 'Power BI')
    .replace(/Power B\.i/gi, 'Power BI')
    .replace(/Power B\.i\./gi, 'Power BI')
    .replace(/\s+/g, ' ')
    .trim()
  
  return corrigido
}

/**
 * Classifica curso em agrupamento padrão
 */
export function classificarAgrupamento(curso: string): string {
  const cursoLower = curso.toLowerCase()
  
  // Verificar se existe classificação direta
  if (Array.isArray(cursosLimpos)) {
    const cursoEncontrado = cursosLimpos.find(
      (c: CursoLimpo) => c.cursoCorrigido.toLowerCase() === cursoLower
    )
    if (cursoEncontrado) {
      return cursoEncontrado.agrupamento
    }
  }
  
  // Classificação heurística
  if (
    cursoLower.includes('informática básica') ||
    cursoLower.includes('inclusão digital') ||
    (cursoLower.includes('introdução') && cursoLower.includes('informática')) ||
    (cursoLower.includes('informática') && cursoLower.includes('mulheres'))
  ) {
    return 'Informática Básica'
  }
  
  if (
    cursoLower.includes('python') ||
    cursoLower.includes('java') ||
    cursoLower.includes('javascript') ||
    cursoLower.includes('node') ||
    cursoLower.includes('c++') ||
    cursoLower.includes('c#') ||
    cursoLower.match(/\bc\b/) ||
    cursoLower.includes('go') ||
    cursoLower.includes('mobile') ||
    cursoLower.includes('backend') ||
    cursoLower.includes('lógica') ||
    cursoLower.includes('programação') ||
    cursoLower.includes('programador') ||
    cursoLower.includes('desenvolvimento') ||
    cursoLower.includes('linguagem') ||
    cursoLower.includes('linguagens')
  ) {
    return 'Lógica e Programação'
  }
  
  if (
    cursoLower.includes('cibersegurança') ||
    cursoLower.includes('segurança') ||
    cursoLower.includes('hacking') ||
    cursoLower.includes('hackathon')
  ) {
    return 'Cibersegurança'
  }
  
  if (
    cursoLower.includes('data science') ||
    cursoLower.includes('análise de dados') ||
    cursoLower.includes('power bi') ||
    cursoLower.includes('visualização') ||
    cursoLower.includes('banco de dados') ||
    cursoLower.includes('ia') ||
    cursoLower.includes('inteligência artificial') ||
    cursoLower.includes('business intelligence')
  ) {
    return 'Análise de Dados'
  }
  
  if (
    cursoLower.includes('html') ||
    cursoLower.includes('css') ||
    cursoLower.includes('web design') ||
    cursoLower.includes('ux') ||
    cursoLower.includes('ui') ||
    cursoLower.includes('design') ||
    cursoLower.includes('front-end')
  ) {
    return 'Design e Web'
  }
  
  if (
    cursoLower.includes('linux') ||
    cursoLower.includes('redes') ||
    cursoLower.includes('hardware') ||
    cursoLower.includes('git') ||
    cursoLower.includes('github')
  ) {
    return 'Infraestrutura'
  }
  
  return 'Outros'
}

