'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { KPICard } from '@/components/dashboard/kpi-card'
import { Users, Briefcase, FlaskConical, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <Header 
          title="Dashboard Principal" 
          description="Visão geral do Ecossistema OxeTech"
        />
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <KPICard
              title="Total de Alunos"
              value="10,000"
              change={12.5}
              trend="up"
              icon={Users}
              color="work"
              subtitle="Inscritos"
            />
            
            <KPICard
              title="OxeTech Work"
              value="247"
              change={8.3}
              trend="up"
              icon={Briefcase}
              color="work"
              subtitle="Contratações"
            />
            
            <KPICard
              title="OxeTech Lab"
              value="3,366"
              change={15.2}
              trend="up"
              icon={FlaskConical}
              color="lab"
              subtitle="Formados"
            />
            
            <KPICard
              title="Taxa"
              value="71%"
              change={5.1}
              trend="up"
              icon={TrendingUp}
              color="edu"
              subtitle="Conclusão"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
