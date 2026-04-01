'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Client, Appointment, Transaction } from '@/types/database'
import { ArrowLeft, User, Phone, Mail, MapPin, Tag, FileText, Calendar, DollarSign, Edit2, Trash2, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { ClientForm } from '@/components/clientes/ClientForm'
import type { ClientFormData } from '@/hooks/useClients'

const STATUS_COLORS: Record<string, string> = {
  agendado:       'bg-blue-100 text-blue-700',
  confirmado:     'bg-green-100 text-green-700',
  em_atendimento: 'bg-amber-100 text-amber-700',
  concluido:      'bg-gray-100 text-gray-600',
  cancelado:      'bg-red-100 text-red-700',
  falta:          'bg-orange-100 text-orange-700',
}

export default function ClienteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const id = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const [clientRes, apptRes, txRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).single(),
        supabase.from('appointments').select('*, service:services(name)').eq('client_id', id).order('starts_at', { ascending: false }).limit(5),
        supabase.from('transactions').select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(5),
      ])

      setClient(clientRes.data as Client | null)
      setAppointments((apptRes.data ?? []) as Appointment[])
      setTransactions((txRes.data ?? []) as Transaction[])
      setLoading(false)
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(data: ClientFormData) {
    if (!client) return
    const { data: updated } = await supabase
      .from('clients')
      .update(data)
      .eq('id', client.id)
      .select('*')
      .single()
    if (updated) setClient(updated as Client)
    setEditOpen(false)
  }

  async function handleDelete(_id: string) {
    if (!client) return
    if (!confirm(`Excluir o cliente "${client.full_name}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    await supabase.from('clients').delete().eq('id', client.id)
    router.push('/clientes')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="mb-4">Cliente não encontrado.</p>
        <Link href="/clientes" className="text-blue-600 hover:underline text-sm">← Voltar para clientes</Link>
      </div>
    )
  }

  const initials = client.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Ficha do Cliente</h1>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Editar
        </button>
        <button
          type="button"
          onClick={() => handleDelete(client.id)}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-2 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Excluir
        </button>
      </div>

      {/* Identity card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-blue-600">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{client.full_name}</h2>
              {!client.is_active && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Inativo</span>
              )}
            </div>
            {client.source && (
              <p className="text-xs text-gray-400 mt-0.5">Origem: {client.source}</p>
            )}
            {client.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {client.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-0.5">Total gasto</p>
            <p className="text-base font-bold text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.total_spent)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-0.5">Visitas</p>
            <p className="text-base font-bold text-gray-900">{client.visits_count}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-0.5">Última visita</p>
            <p className="text-base font-bold text-gray-900">
              {client.last_visit_at
                ? format(parseISO(client.last_visit_at), 'dd/MM/yy', { locale: ptBR })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact + Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contact */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <User className="w-4 h-4 text-gray-400" />
            Contato
          </h3>
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
          {client.whatsapp && client.whatsapp !== client.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span>{client.whatsapp} (WhatsApp)</span>
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.cpf && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>CPF: {client.cpf}</span>
            </div>
          )}
          {client.birth_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{format(parseISO(client.birth_date), "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
          )}
          {!client.phone && !client.email && (
            <p className="text-xs text-gray-400">Sem dados de contato</p>
          )}
        </div>

        {/* Address */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            Endereço
          </h3>
          {client.address_street ? (
            <div className="text-sm text-gray-600 space-y-1">
              <p>{client.address_street}{client.address_number ? `, ${client.address_number}` : ''}</p>
              {(client.address_city || client.address_state) && (
                <p>{[client.address_city, client.address_state].filter(Boolean).join(' — ')}</p>
              )}
              {client.address_zip && <p className="text-gray-400">CEP {client.address_zip}</p>}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Sem endereço cadastrado</p>
          )}
          {client.notes && (
            <>
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs font-medium text-gray-500 mb-1">Observações</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent appointments */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            Últimos agendamentos
          </h3>
          <Link href="/agenda" className="text-xs text-blue-600 hover:underline">Ver agenda</Link>
        </div>
        {appointments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Nenhum agendamento encontrado</p>
        ) : (
          <div className="space-y-2">
            {appointments.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {(a.service as { name?: string } | undefined)?.name ?? 'Serviço'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(parseISO(a.starts_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {a.status}
                </span>
                {a.total != null && (
                  <span className="text-sm font-semibold text-gray-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(a.total)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-gray-400" />
            Últimas transações
          </h3>
          <Link href="/financeiro" className="text-xs text-blue-600 hover:underline">Ver financeiro</Link>
        </div>
        {transactions.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Nenhuma transação encontrada</p>
        ) : (
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
                  <p className="text-xs text-gray-400">
                    {format(parseISO(t.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'receita' ? '+' : '-'}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <ClientForm
        open={editOpen}
        client={client}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setEditOpen(false)}
      />
    </div>
  )
}
