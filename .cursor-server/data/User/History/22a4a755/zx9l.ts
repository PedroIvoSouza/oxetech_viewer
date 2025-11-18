/**
 * Script de Limpeza de Cursos OCR
 * Corrige erros comuns de OCR e classifica em agrupamentos padrão
 */

interface CursoProcessado {
  original: string
  cursoCorrigido: string
  agrupamento: string
}

// Mapeamento de correções comuns de OCR
const correcoesOCR: Record<string, string> = {
  // Letras nasais
  'Iforáica': 'Informática',
  'Iforaica': 'Informática',
  'Iforáica Básicaura': 'Informática Básica',
  'Iforáica Básicaurici': 'Informática Básica',
  'Iforáica Básica': 'Informática Básica',
  'Iforaica Paraulheres': 'Informática Para Mulheres',
  
  // Python
  'Pyho': 'Python',
  'Pyhopara': 'Python para',
  'Pyhodescoplicado': 'Python Descomplicado',
  'Pyho Básico': 'Python Básico',
  'Pyho: Do Básico Ao Avaçado Poo': 'Python: Do Básico Ao Avançado',
  'Pyho+ Poo': 'Python+',
  'Prograação Epyho': 'Programação em Python',
  'Prograação Copyho': 'Programação com Python',
  'Prograação Básica Epyho': 'Programação Básica em Python',
  'Desevolvieo Epyho': 'Desenvolvimento em Python',
  'Aálise De Dados Copyho': 'Análise de Dados com Python',
  'Aálise De Dados Copyhobeedio Bees': 'Análise de Dados com Python e Pandas',
  'Irodução A Pyho': 'Introdução a Python',
  'Lógica De Prograação + Irodução À Pyho': 'Lógica de Programação + Introdução a Python',
  
  // Programação
  'Prograação': 'Programação',
  'Prograador': 'Programador',
  'Lógica De Prograação': 'Lógica de Programação',
  'Lógica De Prograação Copyho': 'Lógica de Programação com Python',
  'Irodução A Prograação Copyho': 'Introdução a Programação com Python',
  'Prograador Web': 'Programador Web',
  'Workshop Prieiros Passosa Prograação': 'Workshop Primeiros Passos em Programação',
  
  // Desenvolvimento
  'Desevolvieo': 'Desenvolvimento',
  'Desevolvieo Web': 'Desenvolvimento Web',
  'Workshop: Desevolvieo Web': 'Workshop: Desenvolvimento Web',
  
  // Análise de Dados
  'Aálise De Dados': 'Análise de Dados',
  'Irodução A Baco De Dados': 'Introdução a Banco de Dados',
  'Power B.i.': 'Power BI',
  'Power B.i': 'Power BI',
  'De Power B.i.': 'Power BI',
  'Workshop De Visualização De Dados Coarduío E Pyho': 'Workshop de Visualização de Dados com Arduino e Python',
  
  // Cibersegurança
  'Ciberseguraça': 'Cibersegurança',
  'Fudaeos De Ciberseguraça': 'Fundamentos de Cibersegurança',
  'Hackahoehoeageaoês Daulher': 'Hackathon Mulheres da Tech',
  
  // Infraestrutura
  'Gie Gihub': 'Git e GitHub',
  'Linux/Redes': 'Linux/Redes',
  
  // Design
  'Design/UX/UI': 'Design/UX/UI',
  
  // Mobile
  'Mobile': 'Mobile',
  
  // Workshops
  'Workshop De Liguages Dearcação': 'Workshop de Linguagens de Programação',
  'Crie Seu Próprio App Copyhoekier': 'Crie Seu Próprio App com Python',
  
  // Outros
  'De Cava': 'Java',
  'De Iforáica Básica': 'Informática Básica',
  'Liguagec: Fudaeos E Aplicações Práicas': 'Linguagens: Fundamentos e Aplicações Práticas',
}

// Função para corrigir texto usando mapeamento e heurísticas
function corrigirTextoOCR(texto: string): string {
  // Normalizar espaços
  let corrigido = texto.trim().replace(/\s+/g, ' ')
  
  // Aplicar correções conhecidas
  for (const [erro, correcao] of Object.entries(correcoesOCR)) {
    if (corrigido.includes(erro)) {
      corrigido = corrigido.replace(new RegExp(erro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), correcao)
    }
  }
  
  // Correções heurísticas gerais
  corrigido = corrigido
    // Letras nasais comuns
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
    // Remover "De" no início
    .replace(/^De\s+/gi, '')
    // Limpar espaços duplos e normalizar
    .replace(/\s+/g, ' ')
    .trim()
  
  return corrigido
}

// Função para classificar em agrupamentos
function classificarAgrupamento(curso: string): string {
  const cursoLower = curso.toLowerCase()
  
  // Informática Básica
  if (
    cursoLower.includes('informática básica') ||
    cursoLower.includes('inclusão digital') ||
    (cursoLower.includes('introdução') && cursoLower.includes('informática')) ||
    (cursoLower.includes('informática') && cursoLower.includes('mulheres'))
  ) {
    return 'Informática Básica'
  }
  
  // Lógica e Programação
  if (
    cursoLower.includes('python') ||
    cursoLower.includes('java') ||
    cursoLower.includes('javascript') ||
    cursoLower.includes('node') ||
    cursoLower.includes('c++') ||
    cursoLower.includes('c#') ||
    cursoLower.match(/\bc\b/) || // C isolado (linguagem)
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
  
  // Cibersegurança
  if (
    cursoLower.includes('cibersegurança') ||
    cursoLower.includes('segurança') ||
    cursoLower.includes('hacking') ||
    cursoLower.includes('hackathon')
  ) {
    return 'Cibersegurança'
  }
  
  // Análise de Dados
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
  
  // Design e Web
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
  
  // Infraestrutura
  if (
    cursoLower.includes('linux') ||
    cursoLower.includes('redes') ||
    cursoLower.includes('hardware') ||
    cursoLower.includes('git') ||
    cursoLower.includes('github')
  ) {
    return 'Infraestrutura'
  }
  
  // Outros (workshops genéricos, hackathons)
  if (
    cursoLower.includes('workshop') ||
    cursoLower.includes('hackathon')
  ) {
    return 'Outros'
  }
  
  return 'Outros'
}

// Lista crua de entrada
const listaCrua = `
Iforáica Básica
Lógica De Prograação
Data Science/IA
Java
HTML/CSS/Web Design
Análise de Dados/Business Intelligence
Go
Design/UX/UI
Linux/Redes
Pyho
Ciberseguraça
Prograação Epyho
Aálise De Dados Copyho
Irodução A Baco De Dados
JavaScript/Node.js
Power B.i.
Lógica De Prograação Copyho
Irodução A Prograação Copyho
Pyhopara Auoação
Prograação Básica Epyho
Desevolvieo Epyho
Pyhodescoplicado
Pyho Básico
Fudaeos De Ciberseguraça
Iforáica Básicaura
Prograação Copyho
Prograador Web
Hackahoehoeageaoês Daulher
Mobile
Workshop De Liguages Dearcação
Lógica De Prograação + Irodução À Pyho
Irodução A Iforáica Básicaura B
Gie Gihub
Workshop De Visualização De Dados Coarduío E Pyho
De Power B.i.
Crie Seu Próprio App Copyhoekier
C
De Cava
Pyho: Do Básico Ao Avaçado Poo
De Iforáica Básica
Desevolvieo Web
Aálise De Dados Copyhobeedio Bees
Pyho+ Poo
Power B.i
Iforaica Paraulheres
Workshop Prieiros Passosa Prograação
Iforáica Básicaurici
Irodução A Pyho
Liguagec: Fudaeos E Aplicações Práicas
Workshop: Desevolvieo Web
`.trim().split('\n').map(s => s.trim()).filter(s => s.length > 0)

// Processar lista
const cursosProcessados: CursoProcessado[] = listaCrua.map(original => {
  const cursoCorrigido = corrigirTextoOCR(original)
  const agrupamento = classificarAgrupamento(cursoCorrigido)
  
  return {
    original,
    cursoCorrigido,
    agrupamento,
  }
})

// Remover duplicatas (mesmo curso corrigido)
const cursosUnicos = new Map<string, CursoProcessado>()
cursosProcessados.forEach(curso => {
  const key = curso.cursoCorrigido.toLowerCase()
  if (!cursosUnicos.has(key)) {
    cursosUnicos.set(key, curso)
  }
})

// Gerar tabela Markdown
console.log('\n# Tabela de Cursos Processados\n')
console.log('| Original | Curso Corrigido | Agrupamento |')
console.log('|----------|----------------|-------------|')

Array.from(cursosUnicos.values()).forEach(curso => {
  console.log(`| ${curso.original} | ${curso.cursoCorrigido} | ${curso.agrupamento} |`)
})

// Resumo por agrupamento
console.log('\n## Resumo por Agrupamento\n')

const contagemPorAgrupamento = new Map<string, number>()
Array.from(cursosUnicos.values()).forEach(curso => {
  const count = contagemPorAgrupamento.get(curso.agrupamento) || 0
  contagemPorAgrupamento.set(curso.agrupamento, count + 1)
})

const agrupamentosOrdenados = Array.from(contagemPorAgrupamento.entries())
  .sort((a, b) => b[1] - a[1])

agrupamentosOrdenados.forEach(([agrupamento, count]) => {
  console.log(`- **${agrupamento}**: ${count} curso(s)`)
})

console.log(`\n**Total de cursos únicos**: ${cursosUnicos.size}`)
console.log(`**Total de cursos processados**: ${cursosProcessados.length}`)

// Exportar como JSON para uso no sistema
import { writeFileSync } from 'fs'
import { join } from 'path'

const outputPath = join(process.cwd(), 'lib', 'data', 'cursos-ocr-limpos.json')
writeFileSync(
  outputPath,
  JSON.stringify(Array.from(cursosUnicos.values()), null, 2),
  'utf-8'
)

console.log(`\n✅ Dados exportados para: ${outputPath}`)

