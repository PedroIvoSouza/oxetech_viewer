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
  
  // Correções comuns de OCR
  corrigido = corrigido
    .replace(/Iforá?ica/gi, 'Informática')
    .replace(/Pyho/gi, 'Python')
    .replace(/Prograa/gi, 'Programa')
    .replace(/Desevolvie/gi, 'Desenvolve')
    .replace(/Aálise/gi, 'Análise')
    .replace(/Irodu/gi, 'Introdu')
    .replace(/Baco/gi, 'Banco')
    .replace(/Cibersegurançança/gi, 'Cibersegurança')
    .replace(/Cibersegura/gi, 'Cibersegurança')
    .replace(/Fudaeos/gi, 'Fundamentos')
    .replace(/Liguage/gi, 'Linguagem')
    .replace(/Prieiros/gi, 'Primeiros')
    .replace(/Passosa/gi, 'Passos em')
    .replace(/Coarduío/gi, 'Arduino')
    .replace(/Copyhoekier/gi, 'com Python')
    .replace(/Copyho/gi, 'com Python')
    .replace(/Epyho/gi, 'em Python')
    .replace(/Avaçado/gi, 'Avançado')
    .replace(/Aplicações Práicas/gi, 'Aplicações Práticas')
    .replace(/Dearcação/gi, 'de Programação')
    .replace(/Gie/gi, 'Git')
    .replace(/Gihub/gi, 'GitHub')
    .replace(/Hackahoehoeageaoês/gi, 'Hackathon')
    .replace(/Daulher/gi, 'Mulheres')
    .replace(/Paraulheres/gi, 'Para Mulheres')
    .replace(/Básicaura/gi, 'Básica')
    .replace(/Básicaurici/gi, 'Básica')
    .replace(/\s*Poo\s*/gi, ' ')
    .replace(/Bees/gi, 'Pandas')
    .replace(/beedio/gi, ' e ')
    .replace(/Copyhobeedio/gi, 'com Python e')
    .replace(/Pythoncom/gi, 'Python com')
    .replace(/Pythonpara/gi, 'Python para')
    .replace(/Pythondescoplicado/gi, 'Python Descomplicado')
    .replace(/Cava/gi, 'Java')
    .replace(/^De Cava$/gi, 'Java')
    .replace(/^De Iforáica Básica$/gi, 'Informática Básica')
    .replace(/^De Power B\.i\.?$/gi, 'Power BI')
    .replace(/Power B\.i/gi, 'Power BI')
    .replace(/Power B\.i\./gi, 'Power BI')
    .replace(/^De\s+/gi, '')
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

