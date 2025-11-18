/**
 * OxeTech Reports - Data Storytelling Page
 * Relatórios semestrais de impacto
 */

'use client'

import { HeroSection } from '@/components/reports/hero-section'
import { ChapterSection } from '@/components/reports/chapter-section'
import { ScrollyTellingSection } from '@/components/reports/scrolly-telling-section'
import { AnimatedCounter } from '@/components/reports/animated-counter'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts'
import { GovCard } from '@/components/ui/gov-card'

// Cores ODS/ONU
const ODS_COLORS = {
  educacao: '#C5192D', // ODS 4 - Quality Education
  inovacao: '#FD6925', // ODS 9 - Industry, Innovation
  trabalho: '#A21942', // ODS 8 - Decent Work
  sustentabilidade: '#3F7E44', // ODS 13 - Climate Action
}

// Dados de exemplo (substituir por dados reais)
const evolucaoAlunos = [
  { ano: '2020', alunos: 500 },
  { ano: '2021', alunos: 1200 },
  { ano: '2022', alunos: 2500 },
  { ano: '2023', alunos: 4500 },
  { ano: '2024', alunos: 8000 },
]

const distribuicaoPorPrograma = [
  { programa: 'Lab', valor: 3200 },
  { programa: 'Work', valor: 2800 },
  { programa: 'Edu', valor: 1500 },
  { programa: 'Trilhas', valor: 500 },
]

export default function ReportsPage() {
  const textBlocks = [
    {
      id: 'block-1',
      title: 'O Desafio',
      content: (
        <p>
          Em 2020, Alagoas enfrentava um cenário crítico: <strong>alta taxa de desemprego juvenil</strong> e 
          falta de qualificação técnica adequada ao mercado de trabalho. O acesso à educação digital 
          era limitado, especialmente nas regiões mais remotas do estado.
        </p>
      ),
    },
    {
      id: 'block-2',
      title: 'A Evolução',
      content: (
        <p>
          Nos últimos 5 anos, o programa OxeTech transformou o cenário. O número de alunos atendidos 
          cresceu exponencialmente, saltando de <AnimatedCounter value={500} /> em 2020 para mais de 
          <AnimatedCounter value={8000} /> em 2024.
        </p>
      ),
    },
    {
      id: 'block-3',
      title: 'O Impacto',
      content: (
        <p>
          Com <AnimatedCounter value={85} suffix="%" /> de taxa de conclusão e mais de 
          <AnimatedCounter value={6000} /> certificados emitidos, o programa demonstra resultados 
          concretos na qualificação profissional dos jovens alagoanos.
        </p>
      ),
    },
  ]

  const visualComponents = [
    {
      id: 'visual-1',
      component: (
        <div className="w-full max-w-2xl">
          <h3 className="mb-6 text-2xl font-bold font-display text-foreground">
            Evolução de Alunos (2020-2024)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={evolucaoAlunos}>
              <XAxis dataKey="ano" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Line
                type="monotone"
                dataKey="alunos"
                stroke={ODS_COLORS.educacao}
                strokeWidth={3}
                dot={{ fill: ODS_COLORS.educacao, r: 6 }}
                animationDuration={2000}
                animationBegin={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ),
    },
    {
      id: 'visual-2',
      component: (
        <div className="w-full max-w-2xl">
          <h3 className="mb-6 text-2xl font-bold font-display text-foreground">
            Alunos Atendidos
          </h3>
          <div className="space-y-8">
            <div className="text-center">
              <div className="mb-2 text-6xl font-bold font-mono-numeric" style={{ color: ODS_COLORS.educacao }}>
                <AnimatedCounter value={8000} />
              </div>
              <p className="text-xl font-body text-muted-foreground">Alunos em 2024</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'visual-3',
      component: (
        <div className="w-full max-w-2xl">
          <h3 className="mb-6 text-2xl font-bold font-display text-foreground">
            Distribuição por Programa
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={distribuicaoPorPrograma}>
              <XAxis dataKey="programa" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Bar
                dataKey="valor"
                fill={ODS_COLORS.inovacao}
                animationDuration={2000}
                animationBegin={0}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ),
    },
  ]

  return (
    <div className="bg-off-white">
      {/* Hero Section */}
      <HeroSection
        title="Relatório de Impacto 2024"
        subtitle="Transformando vidas através da educação e tecnologia em Alagoas"
      />

      {/* Intro Section */}
      <ChapterSection
        number="01"
        title="O Problema"
        content={
          <p>
            Em 2020, Alagoas enfrentava desafios estruturais que limitavam o desenvolvimento 
            dos jovens: alta taxa de desemprego, falta de qualificação técnica e acesso 
            limitado à educação digital. O programa OxeTech nasceu como resposta a esses desafios.
          </p>
        }
        themeColor={ODS_COLORS.educacao}
      />

      {/* Scrollytelling Section */}
      <ScrollyTellingSection
        textBlocks={textBlocks}
        visualComponents={visualComponents}
        themeColor={ODS_COLORS.educacao}
      />

      {/* Chapter 2 */}
      <ChapterSection
        number="02"
        title="A Solução"
        content={
          <p>
            Através de quatro programas principais — Lab, Work, Edu e Trilhas — o OxeTech 
            oferece qualificação profissional, inserção no mercado de trabalho e desenvolvimento 
            de competências digitais para jovens alagoanos.
          </p>
        }
        themeColor={ODS_COLORS.inovacao}
      />

      {/* Grid de Métricas */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold font-display md:text-5xl">
            Resultados em Números
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <GovCard>
              <div className="text-center">
                <div className="mb-2 text-5xl font-bold font-mono-numeric" style={{ color: ODS_COLORS.educacao }}>
                  <AnimatedCounter value={8000} />
                </div>
                <p className="text-lg font-body text-muted-foreground">Alunos Atendidos</p>
              </div>
            </GovCard>
            <GovCard>
              <div className="text-center">
                <div className="mb-2 text-5xl font-bold font-mono-numeric" style={{ color: ODS_COLORS.inovacao }}>
                  <AnimatedCounter value={6000} />
                </div>
                <p className="text-lg font-body text-muted-foreground">Certificados Emitidos</p>
              </div>
            </GovCard>
            <GovCard>
              <div className="text-center">
                <div className="mb-2 text-5xl font-bold font-mono-numeric" style={{ color: ODS_COLORS.trabalho }}>
                  <AnimatedCounter value={85} suffix="%" />
                </div>
                <p className="text-lg font-body text-muted-foreground">Taxa de Conclusão</p>
              </div>
            </GovCard>
            <GovCard>
              <div className="text-center">
                <div className="mb-2 text-5xl font-bold font-mono-numeric" style={{ color: ODS_COLORS.sustentabilidade }}>
                  <AnimatedCounter value={102} />
                </div>
                <p className="text-lg font-body text-muted-foreground">Municípios Atendidos</p>
              </div>
            </GovCard>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-foreground py-24 text-center text-white">
        <div className="mx-auto max-w-4xl px-6 md:px-12 lg:px-24">
          <h2 className="mb-6 text-4xl font-bold font-display md:text-5xl">
            Baixe o Relatório Completo
          </h2>
          <p className="mb-8 text-xl font-body leading-relaxed text-white/80">
            Acesse dados detalhados, análises aprofundadas e histórias de transformação.
          </p>
          <button
            className="rounded-lg bg-primary-vivid px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-vivid/90"
            onClick={() => {
              // Implementar download do PDF
              alert('Download do relatório completo será implementado')
            }}
          >
            Baixar PDF Completo
          </button>
        </div>
      </section>
    </div>
  )
}

