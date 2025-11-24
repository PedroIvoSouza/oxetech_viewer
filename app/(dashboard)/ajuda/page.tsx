/**
 * Página de Ajuda e Documentação
 * Inspirada em USAspending.gov - Centro de ajuda organizado
 */

'use client'

import { useState } from 'react'
import { GovCard } from '@/components/ui/gov-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  HelpCircle, 
  Book, 
  Video, 
  FileText, 
  MessageCircle, 
  Search,
  ChevronRight,
  Download,
  ExternalLink,
  PlayCircle,
  CheckCircle2
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const categoriasAjuda = [
  {
    id: 'inicio',
    titulo: 'Primeiros Passos',
    icone: PlayCircle,
    descricao: 'Guia para começar a usar o sistema',
    artigos: [
      { titulo: 'Como fazer login', link: '/ajuda/login' },
      { titulo: 'Navegação básica', link: '/ajuda/navegacao' },
      { titulo: 'Criar seu primeiro relatório', link: '/ajuda/relatorio' },
    ],
  },
  {
    id: 'dados',
    titulo: 'Gerenciamento de Dados',
    icone: FileText,
    descricao: 'Como visualizar e exportar dados',
    artigos: [
      { titulo: 'Visualizar dados de alunos', link: '/ajuda/alunos' },
      { titulo: 'Exportar relatórios', link: '/ajuda/exportar' },
      { titulo: 'Filtrar e buscar dados', link: '/ajuda/filtros' },
    ],
  },
  {
    id: 'relatorios',
    titulo: 'Relatórios e Análises',
    icone: Book,
    descricao: 'Criar e personalizar relatórios',
    artigos: [
      { titulo: 'Criar relatório personalizado', link: '/ajuda/relatorio-personalizado' },
      { titulo: 'Entender os gráficos', link: '/ajuda/graficos' },
      { titulo: 'Análise de tendências', link: '/ajuda/tendencias' },
    ],
  },
  {
    id: 'configuracao',
    titulo: 'Configurações',
    icone: CheckCircle2,
    descricao: 'Ajustar preferências do sistema',
    artigos: [
      { titulo: 'Configurar notificações', link: '/ajuda/notificacoes' },
      { titulo: 'Gerenciar segurança', link: '/ajuda/seguranca' },
      { titulo: 'Preferências de exportação', link: '/ajuda/exportacao' },
    ],
  },
]

const perguntasFrequentes = [
  {
    pergunta: 'Como faço para exportar dados?',
    resposta: 'Você pode exportar dados através da página de relatórios. Selecione os dados desejados e clique no botão "Exportar". Os dados podem ser exportados em formato Excel, CSV ou PDF.',
  },
  {
    pergunta: 'Como visualizo dados de um aluno específico?',
    resposta: 'Navegue até a página de Alunos e use a barra de busca para encontrar o aluno. Você também pode filtrar por módulo, status ou período.',
  },
  {
    pergunta: 'Como crio um relatório personalizado?',
    resposta: 'Acesse a página de Reports e use o botão "Novo Relatório". Selecione os dados, filtros e visualizações desejadas.',
  },
  {
    pergunta: 'Como altero minhas configurações?',
    resposta: 'Acesse a página de Configurações no menu lateral. Lá você pode ajustar notificações, segurança e preferências de exportação.',
  },
  {
    pergunta: 'Os dados são atualizados em tempo real?',
    resposta: 'Os dados são atualizados automaticamente a cada 5 minutos. Você também pode atualizar manualmente usando o botão de refresh.',
  },
]

export default function AjudaPage() {
  const [busca, setBusca] = useState('')

  const resultadosBusca = categoriasAjuda.flatMap(categoria =>
    categoria.artigos.filter(artigo =>
      artigo.titulo.toLowerCase().includes(busca.toLowerCase())
    )
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold font-heading text-foreground">
            Centro de Ajuda
          </h1>
          <p className="text-muted-foreground mt-2 font-body text-lg">
            Encontre respostas para suas dúvidas e aprenda a usar o sistema
          </p>
        </motion.div>

        {/* Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar ajuda, artigos, tutoriais..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          {busca && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                {resultadosBusca.length} resultado(s) encontrado(s)
              </p>
              {resultadosBusca.map((resultado, index) => (
                <Link
                  key={index}
                  href={resultado.link}
                  className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <p className="font-medium text-foreground">{resultado.titulo}</p>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Categorias de Ajuda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categoriasAjuda.map((categoria, index) => {
          const Icon = categoria.icone
          return (
            <motion.div
              key={categoria.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <GovCard title={categoria.titulo} span={2}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-4">
                        {categoria.descricao}
                      </p>
                      <ul className="space-y-2">
                        {categoria.artigos.map((artigo, artIndex) => (
                          <li key={artIndex}>
                            <Link
                              href={artigo.link}
                              className="flex items-center justify-between group hover:text-primary transition-colors"
                            >
                              <span className="text-sm font-medium text-foreground group-hover:text-primary">
                                {artigo.titulo}
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </GovCard>
            </motion.div>
          )
        })}
      </div>

      {/* Perguntas Frequentes */}
      <GovCard title="Perguntas Frequentes" span={4}>
        <div className="space-y-4">
          {perguntasFrequentes.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {faq.pergunta}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.resposta}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </GovCard>

      {/* Recursos Adicionais */}
      <GovCard title="Recursos Adicionais" span={4}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Tutoriais em Vídeo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Assista a tutoriais em vídeo para aprender a usar o sistema
              </p>
              <Button variant="outline" className="w-full">
                <PlayCircle className="h-4 w-4 mr-2" />
                Assistir Vídeos
              </Button>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documentação Completa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Acesse a documentação completa do sistema
              </p>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Suporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Entre em contato com nossa equipe de suporte
              </p>
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Contatar Suporte
              </Button>
            </CardContent>
          </Card>
        </div>
      </GovCard>
    </div>
  )
}

