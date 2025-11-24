/**
 * Página de Configurações
 * Inspirada em USAspending.gov - Interface limpa e organizada
 */

'use client'

import { useState } from 'react'
import { GovCard } from '@/components/ui/gov-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Download, 
  Upload,
  Mail,
  Globe,
  Save,
  RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function ConfiguracoesPage() {
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: false,
    relatorios: true,
  })
  const [seguranca, setSeguranca] = useState({
    doisFatores: false,
    sessao: true,
    auditoria: true,
  })
  const [exportacao, setExportacao] = useState({
    formato: 'xlsx',
    incluirDados: true,
    comprimir: false,
  })

  const handleSave = () => {
    toast.success('Configurações salvas com sucesso!')
  }

  const handleReset = () => {
    toast.info('Configurações restauradas aos valores padrão')
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-2 font-body">
            Gerencie as configurações do sistema e suas preferências
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Notificações */}
      <GovCard title="Notificações" span={4}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Notificações por E-mail
              </Label>
              <p className="text-sm text-muted-foreground">
                Receba atualizações e relatórios por e-mail
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={notificacoes.email}
              onCheckedChange={(checked) => 
                setNotificacoes({ ...notificacoes, email: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações Push
              </Label>
              <p className="text-sm text-muted-foreground">
                Receba notificações em tempo real no navegador
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={notificacoes.push}
              onCheckedChange={(checked) => 
                setNotificacoes({ ...notificacoes, push: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="relatorios" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Relatórios Automáticos
              </Label>
              <p className="text-sm text-muted-foreground">
                Receba relatórios periódicos automaticamente
              </p>
            </div>
            <Switch
              id="relatorios"
              checked={notificacoes.relatorios}
              onCheckedChange={(checked) => 
                setNotificacoes({ ...notificacoes, relatorios: checked })
              }
            />
          </div>
        </div>
      </GovCard>

      {/* Segurança */}
      <GovCard title="Segurança" span={4}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dois-fatores" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Autenticação de Dois Fatores
              </Label>
              <p className="text-sm text-muted-foreground">
                Adicione uma camada extra de segurança à sua conta
              </p>
            </div>
            <Switch
              id="dois-fatores"
              checked={seguranca.doisFatores}
              onCheckedChange={(checked) => 
                setSeguranca({ ...seguranca, doisFatores: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sessao" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Gerenciamento de Sessão
              </Label>
              <p className="text-sm text-muted-foreground">
                Controle de sessões ativas e timeout automático
              </p>
            </div>
            <Switch
              id="sessao"
              checked={seguranca.sessao}
              onCheckedChange={(checked) => 
                setSeguranca({ ...seguranca, sessao: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auditoria" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Log de Auditoria
              </Label>
              <p className="text-sm text-muted-foreground">
                Registre todas as ações realizadas no sistema
              </p>
            </div>
            <Switch
              id="auditoria"
              checked={seguranca.auditoria}
              onCheckedChange={(checked) => 
                setSeguranca({ ...seguranca, auditoria: checked })
              }
            />
          </div>
        </div>
      </GovCard>

      {/* Exportação de Dados */}
      <GovCard title="Exportação de Dados" span={4}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="formato" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Formato Padrão de Exportação
            </Label>
            <select
              id="formato"
              value={exportacao.formato}
              onChange={(e) => setExportacao({ ...exportacao, formato: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="xlsx">Excel (XLSX)</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
              <option value="json">JSON</option>
            </select>
            <p className="text-sm text-muted-foreground">
              Formato padrão para exportação de relatórios e dados
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="incluir-dados" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Incluir Dados Sensíveis
              </Label>
              <p className="text-sm text-muted-foreground">
                Incluir informações pessoais nas exportações
              </p>
            </div>
            <Switch
              id="incluir-dados"
              checked={exportacao.incluirDados}
              onCheckedChange={(checked) => 
                setExportacao({ ...exportacao, incluirDados: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comprimir" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Comprimir Arquivos
              </Label>
              <p className="text-sm text-muted-foreground">
                Comprimir arquivos exportados automaticamente
              </p>
            </div>
            <Switch
              id="comprimir"
              checked={exportacao.comprimir}
              onCheckedChange={(checked) => 
                setExportacao({ ...exportacao, comprimir: checked })
              }
            />
          </div>
        </div>
      </GovCard>

      {/* Preferências de Interface */}
      <GovCard title="Preferências de Interface" span={4}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="idioma" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Idioma
            </Label>
            <select
              id="idioma"
              defaultValue="pt-BR"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="timezone">Fuso Horário</Label>
            <select
              id="timezone"
              defaultValue="America/Sao_Paulo"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="America/Sao_Paulo">America/São Paulo (UTC-3)</option>
              <option value="America/Manaus">America/Manaus (UTC-4)</option>
              <option value="America/Rio_Branco">America/Rio Branco (UTC-5)</option>
            </select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="itens-por-pagina">Itens por Página</Label>
            <Input
              id="itens-por-pagina"
              type="number"
              defaultValue={50}
              min={10}
              max={100}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Número padrão de itens exibidos por página em tabelas
            </p>
          </div>
        </div>
      </GovCard>

      {/* Informações do Sistema */}
      <GovCard title="Informações do Sistema" span={4}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Versão do Sistema</Label>
            <p className="text-foreground">v2.1.0</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Última Atualização</Label>
            <p className="text-foreground">19/11/2024</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Banco de Dados</Label>
            <p className="text-foreground">PostgreSQL 15.2</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ambiente</Label>
            <p className="text-foreground">Produção</p>
          </div>
        </div>
      </GovCard>
    </div>
  )
}

