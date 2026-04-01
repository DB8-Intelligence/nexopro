'use client'

import { useState } from 'react'
import { Search, UserPlus, Phone, Mail, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Client } from '@/types/database'

interface ClientTableProps {
  clients: Client[]
  loading: boolean
  onSelectClient: (client: Client) => void
  onNewClient: () => void
}

export function ClientTable({ clients, loading, onSelectClient, onNewClient }: ClientTableProps) {
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active')

  const filtered = clients.filter(c => {
    const matchSearch =
      search.trim() === '' ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? '').includes(search) ||
      (c.whatsapp ?? '').includes(search)

    const matchActive =
      filterActive === 'all' ||
      (filterActive === 'active' && c.is_active) ||
      (filterActive === 'inactive' && !c.is_active)

    return matchSearch && matchActive
  })

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">{clients.filter(c => c.is_active).length} clientes ativos</p>
        </div>
        <button
          onClick={onNewClient}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Novo cliente
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
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs">
          {(['all', 'active', 'inactive'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setFilterActive(opt)}
              className={cn(
                'px-3 py-2 transition-colors',
                filterActive === opt
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              {opt === 'all' ? 'Todos' : opt === 'active' ? 'Ativos' : 'Inativos'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-xl bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-sm text-gray-400">
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-sm text-gray-400">
            <span>{search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</span>
            {!search && (
              <button
                onClick={onNewClient}
                className="text-blue-600 hover:underline text-sm"
              >
                Cadastrar primeiro cliente
              </button>
            )}
          </div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nome
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contato
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Tags
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total gasto
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Visitas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(client => (
                <tr
                  key={client.id}
                  onClick={() => onSelectClient(client)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-blue-700">
                          {client.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className={cn(
                          'text-sm font-medium',
                          client.is_active ? 'text-gray-900' : 'text-gray-400 line-through'
                        )}>
                          {client.full_name}
                        </p>
                        {client.last_visit_at && (
                          <p className="text-xs text-gray-400">
                            Última visita:{' '}
                            {new Date(client.last_visit_at).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {client.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(client.tags ?? []).slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                      {(client.tags ?? []).length > 3 && (
                        <span className="text-[10px] text-gray-400">
                          +{client.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-gray-700">
                      R$ {(client.total_spent ?? 0).toFixed(2)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-gray-600">
                      {client.visits_count ?? 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
