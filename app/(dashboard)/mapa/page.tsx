'use client'

import { useGeographicData } from '@/lib/queries/geographic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, TrendingUp, Users, Briefcase, GraduationCap, BookOpen, FlaskConical } from 'lucide-react'
import { formatNumber } from '@/lib/formatters'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { obterCorPorIntensidade, calcularIntensidade } from '@/lib/geographic-analytics'

export default function MapaPage() {
  const { data, isLoading, error } = useGeographicData()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl bg-destructive/10">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            Erro ao carregar dados
          </p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!data?.data) {
    return null
  }

  const { distribuicao, totalMunicipios, maxTotal } = data.data

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Mapa de Calor Geográfico</h1>
        <p className="text-lg text-muted-foreground">
          Distribuição dos programas OxeTech por município em Alagoas
        </p>
      </motion.div>

      {/* Estatísticas */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="h-5 w-5 text-blue-600" />
              Municípios Atendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatNumber(totalMunicipios)}
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Briefcase className="h-5 w-5" style={{ color: '#0A64C2' }} />
              Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#0A64C2' }}>
              {formatNumber(
                distribuicao.reduce((acc, d) => acc + d.work, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-5 w-5" style={{ color: '#F7A600' }} />
              Edu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#F7A600' }}>
              {formatNumber(
                distribuicao.reduce((acc, d) => acc + d.edu, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FlaskConical className="h-5 w-5" style={{ color: '#FF6A00' }} />
              Lab + Trilhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#FF6A00' }}>
              {formatNumber(
                distribuicao.reduce((acc, d) => acc + d.lab + d.trilhas, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Calor (Visualização em Grid) */}
      <Card
        className="border-0 shadow-soft overflow-hidden"
        style={{ borderRadius: '22px' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Distribuição por Município
          </CardTitle>
          <CardDescription>
            {totalMunicipios} municípios de Alagoas atendidos pelos programas OxeTech
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {distribuicao.map((item, index) => {
              const intensidade = calcularIntensidade(item.total, maxTotal)
              const cor = obterCorPorIntensidade(intensidade)
              const porcentagemTotal = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0

              return (
                <motion.div
                  key={item.municipio}
                  className="relative rounded-xl p-4 border-2 transition-all hover:shadow-medium"
                  style={{
                    borderColor: cor,
                    backgroundColor: `${cor}15`,
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm" style={{ color: cor }}>
                      {item.municipio}
                    </h3>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: cor }}
                    >
                      {formatNumber(item.total)}
                    </span>
                  </div>

                  {/* Barras por Programa */}
                  <div className="space-y-1.5">
                    {item.work > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Briefcase className="h-3 w-3" style={{ color: '#0A64C2' }} />
                          Work
                        </span>
                        <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(item.work / item.total) * 100}%`,
                              backgroundColor: '#0A64C2',
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-blue-700">
                          {item.work}
                        </span>
                      </div>
                    )}

                    {item.edu > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" style={{ color: '#F7A600' }} />
                          Edu
                        </span>
                        <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(item.edu / item.total) * 100}%`,
                              backgroundColor: '#F7A600',
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-yellow-700">
                          {item.edu}
                        </span>
                      </div>
                    )}

                    {item.lab > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <FlaskConical className="h-3 w-3" style={{ color: '#FF6A00' }} />
                          Lab
                        </span>
                        <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(item.lab / item.total) * 100}%`,
                              backgroundColor: '#FF6A00',
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-orange-700">
                          {item.lab}
                        </span>
                      </div>
                    )}

                    {item.trilhas > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3" style={{ color: '#C80000' }} />
                          Trilhas
                        </span>
                        <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(item.trilhas / item.total) * 100}%`,
                              backgroundColor: '#C80000',
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-red-700">
                          {item.trilhas}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Porcentagem do total */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        % do Total
                      </span>
                      <span className="text-xs font-bold" style={{ color: cor }}>
                        {porcentagemTotal.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabela Detalhada */}
      <Card
        className="border-0 shadow-soft overflow-hidden"
        style={{ borderRadius: '22px' }}
      >
        <CardHeader>
          <CardTitle>Distribuição Detalhada por Município</CardTitle>
          <CardDescription>
            Números completos por programa e município
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Município
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Work
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Edu
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Lab
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Trilhas
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Total
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    % Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {distribuicao.map((item, index) => {
                  const intensidade = calcularIntensidade(item.total, maxTotal)
                  const porcentagem = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0

                  return (
                    <motion.tr
                      key={item.municipio}
                      className="border-b hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.01 }}
                    >
                      <td className="p-3 font-medium">{item.municipio}</td>
                      <td className="p-3 text-right">
                        {item.work > 0 ? (
                          <span className="font-medium text-blue-700">
                            {formatNumber(item.work)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {item.edu > 0 ? (
                          <span className="font-medium text-yellow-700">
                            {formatNumber(item.edu)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {item.lab > 0 ? (
                          <span className="font-medium text-orange-700">
                            {formatNumber(item.lab)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {item.trilhas > 0 ? (
                          <span className="font-medium text-red-700">
                            {formatNumber(item.trilhas)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold">
                        {formatNumber(item.total)}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={cn(
                            'font-bold',
                            porcentagem >= 10
                              ? 'text-red-600'
                              : porcentagem >= 5
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          )}
                        >
                          {porcentagem.toFixed(1)}%
                        </span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

