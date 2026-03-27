'use client'

import { useState } from 'react'
import { Search, Plus, Building2, MapPin, Sparkles, Video, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Property, PropertyStatus } from '@/types/database'

const STATUS_CONFIG: Record<PropertyStatus, { label: string; icon: React.ReactNode; color: string }> = {
  new:              { label: 'Novo',            icon: <Clock className="w-3 h-3" />,        color: 'bg-gray-100 text-gray-600' },
  uploading:        { label: 'Enviando',        icon: <Clock className="w-3 h-3 animate-spin" />, color: 'bg-blue-100 text-blue-700' },
  processing:       { label: 'Processando',     icon: <Sparkles className="w-3 h-3" />,     color: 'bg-yellow-100 text-yellow-700' },
  caption_ready:    { label: 'Legenda pronta',  icon: <Sparkles className="w-3 h-3" />,     color: 'bg-purple-100 text-purple-700' },
  video_processing: { label: 'Gerando vídeo',  icon: <Video className="w-3 h-3" />,         color: 'bg-orange-100 text-orange-700' },
  ready:            { label: 'Pronto',          icon: <CheckCircle2 className="w-3 h-3" />, color: 'bg-green-100 text-green-700' },
  published:        { label: 'Publicado',       icon: <CheckCircle2 className="w-3 h-3" />, color: 'bg-teal-100 text-teal-700' },
  error:            { label: 'Erro',            icon: <AlertCircle className="w-3 h-3" />,  color: 'bg-red-100 text-red-700' },
}

const FILTER_OPTIONS: { value: PropertyStatus | 'all'; label: string }[] = [
  { value: 'all',           label: 'Todos' },
  { value: 'new',           label: 'Novos' },
  { value: 'caption_ready', label: 'Com legenda' },
  { value: 'ready',         label: 'Prontos' },
  { value: 'published',     label: 'Publicados' },
  { value: 'error',         label: 'Com erro' },
]

interface InboxTableProps {
  properties: Property[]
  loading: boolean
  onSelectProperty: (property: Property) => void
  onNewProperty: () => void
  onFilterChange: (status: PropertyStatus | 'all') => void
}

export function InboxTable({
  properties,
  loading,
  onSelectProperty,
  onNewProperty,
  onFilterChange,
}: InboxTableProps) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<PropertyStatus | 'all'>('all')

  function handleFilter(value: PropertyStatus | 'all') {
    setActiveFilter(value)
    onFilterChange(value)
  }

  const filtered = properties.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (p.title ?? '').toLowerCase().includes(q) ||
      (p.city ?? '').toLowerCase().includes(q) ||
      (p.neighborhood ?? '').toLowerCase().includes(q) ||
      (p.property_type ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Imóveis</h1>
          <p className="text-sm text-gray-500">{properties.length} imóvel(eis) cadastrado(s)</p>
        </div>
        <button
          onClick={onNewProperty}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo imóvel
        </button>
      </div>

      {/* Filtros + Busca */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título, cidade ou bairro..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border',
                activeFilter === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de imóveis */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-sm text-gray-400">
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Building2 className="w-10 h-10 text-gray-200" />
            <p className="text-sm text-gray-400">
              {search ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel cadastrado'}
            </p>
            {!search && (
              <button onClick={onNewProperty} className="text-blue-600 hover:underline text-sm">
                Cadastrar primeiro imóvel
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(property => {
              const statusCfg = STATUS_CONFIG[property.status]
              return (
                <div
                  key={property.id}
                  onClick={() => onSelectProperty(property)}
                  className="card cursor-pointer hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Imagem */}
                  <div className="h-40 bg-gray-100 relative overflow-hidden">
                    {property.cover_url ? (
                      <img
                        src={property.cover_url}
                        alt={property.title ?? 'Imóvel'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {/* Status badge */}
                    <div className={cn(
                      'absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                      statusCfg.color
                    )}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {property.title ?? 'Sem título'}
                    </p>
                    {(property.city ?? property.neighborhood) && (
                      <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {[property.neighborhood, property.city].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {property.price && (
                        <span className="text-sm font-bold text-gray-900">{property.price}</span>
                      )}
                      {property.property_type && (
                        <span className="text-xs text-gray-400 capitalize">{property.property_type}</span>
                      )}
                    </div>
                    {property.generated_video_url && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                        <Video className="w-3 h-3" />
                        Vídeo disponível
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
