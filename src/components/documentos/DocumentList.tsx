'use client'

import { useState } from 'react'
import { Search, FilePlus, FileText, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Document, DocumentStatus } from '@/types/database'

const STATUS_BADGE: Record<DocumentStatus, string> = {
  rascunho:  'bg-gray-100 text-gray-600',
  enviado:   'bg-blue-100 text-blue-700',
  assinado:  'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
}

const STATUS_LABELS: Record<DocumentStatus, string> = {
  rascunho:  'Rascunho',
  enviado:   'Enviado',
  assinado:  'Assinado',
  cancelado: 'Cancelado',
}

interface DocumentListProps {
  documents: Document[]
  loading: boolean
  onSelectDocument: (doc: Document) => void
  onNewDocument: () => void
}

export function DocumentList({ documents, loading, onSelectDocument, onNewDocument }: DocumentListProps) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all')

  const filtered = documents.filter(d => {
    const matchSearch =
      search.trim() === '' ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase()) ||
      (d.client?.full_name ?? '').toLowerCase().includes(search.toLowerCase())

    const matchStatus = filterStatus === 'all' || d.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Documentos</h1>
          <p className="text-sm text-gray-500">
            {documents.length} documento{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onNewDocument}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <FilePlus className="w-4 h-4" />
          Novo documento
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título, tipo ou cliente..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs">
          {(['all', 'rascunho', 'enviado', 'assinado'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setFilterStatus(opt)}
              className={cn(
                'px-3 py-2 transition-colors',
                filterStatus === opt
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              {opt === 'all' ? 'Todos' : STATUS_LABELS[opt]}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 border border-gray-200 rounded-xl bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-sm text-gray-400">
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-sm text-gray-400">
            <FileText className="w-8 h-8 text-gray-200" />
            <span>{search ? 'Nenhum documento encontrado' : 'Nenhum documento criado'}</span>
            {!search && (
              <button onClick={onNewDocument} className="text-blue-600 hover:underline text-sm">
                Criar primeiro documento
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(doc => (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Ícone */}
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-gray-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                    <span>{doc.type}</span>
                    {doc.client && <span>· {doc.client.full_name}</span>}
                    {doc.expires_at && (
                      <span>
                        · Válido até {new Date(doc.expires_at + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    <span>· {new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Link externo */}
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0"
                    title="Abrir arquivo"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Status */}
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0',
                  STATUS_BADGE[doc.status]
                )}>
                  {STATUS_LABELS[doc.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
