'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header 
      className="border-b backdrop-blur-md sticky top-0 z-10 shadow-sm"
      style={{ 
        borderColor: 'var(--border)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
      }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 
            className="heading-2"
            style={{ color: 'var(--primary-dark)' }}
          >
            {title}
          </h1>
          {description && (
            <p className="caption mt-1.5">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-40" />
            <Input
              placeholder="Buscar no dashboard..."
              className="pl-9 w-72"
              style={{ 
                borderColor: 'var(--border)',
                backgroundColor: 'rgba(240, 240, 240, 0.5)'
              }}
            />
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span 
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--error)' }}
            />
          </Button>
          
          <div 
            className="flex items-center gap-3 pl-4 border-l"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">SECTI - AL</p>
              <p className="text-xs opacity-60">Administrador</p>
            </div>
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span className="font-semibold text-sm text-white">SA</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
