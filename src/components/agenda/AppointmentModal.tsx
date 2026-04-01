'use client'

import { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { Appointment, AppointmentStatus, Client, Service } from '@/types/database'
import type { AppointmentFormData } from '@/hooks/useAppointments'

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'em_atendimento', label: 'Em Atendimento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'falta', label: 'Falta' },
]

const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'cartao_debito', label: 'Cartão Débito' },
  { value: 'cartao_credito', label: 'Cartão Crédito' },
]

function toDatetimeLocal(isoString: string): string {
  const d = new Date(isoString)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString()
}

function buildDefaultForm(initialDate: Date | null): AppointmentFormData {
  const start = initialDate ?? new Date()
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + 60)
  return {
    client_id: null,
    service_id: null,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    status: 'agendado',
    price: null,
    discount: 0,
    payment_method: null,
    notes: null,
    internal_notes: null,
  }
}

interface AppointmentModalProps {
  open: boolean
  appointment: Appointment | null
  initialDate: Date | null
  clients: Client[]
  services: Service[]
  onSave: (data: AppointmentFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

export function AppointmentModal({
  open,
  appointment,
  initialDate,
  clients,
  services,
  onSave,
  onDelete,
  onClose,
}: AppointmentModalProps) {
  const isEditing = appointment !== null
  const [form, setForm] = useState<AppointmentFormData>(() => buildDefaultForm(initialDate))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (appointment) {
      setForm({
        client_id: appointment.client_id,
        service_id: appointment.service_id,
        starts_at: appointment.starts_at,
        ends_at: appointment.ends_at,
        status: appointment.status,
        price: appointment.price,
        discount: appointment.discount,
        payment_method: appointment.payment_method,
        notes: appointment.notes,
        internal_notes: appointment.internal_notes,
      })
    } else {
      setForm(buildDefaultForm(initialDate))
    }
  }, [appointment, initialDate])

  function handleServiceChange(serviceId: string | null) {
    const service = services.find(s => s.id === serviceId) ?? null
    setForm(prev => {
      const start = new Date(prev.starts_at)
      const end = new Date(start)
      end.setMinutes(end.getMinutes() + (service?.duration_min ?? 60))
      return {
        ...prev,
        service_id: serviceId,
        price: service ? service.price : prev.price,
        ends_at: end.toISOString(),
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  async function handleDelete() {
    if (!appointment) return
    if (!confirm('Excluir este agendamento?')) return
    setDeleting(true)
    await onDelete(appointment.id)
    setDeleting(false)
  }

  if (!open) return null

  const total = (form.price ?? 0) - (form.discount ?? 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-base font-semibold text-gray-800">
            {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
            <select
              value={form.client_id ?? ''}
              onChange={e => setForm(prev => ({ ...prev, client_id: e.target.value || null }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              <option value="">Selecionar cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          {/* Serviço */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Serviço</label>
            <select
              value={form.service_id ?? ''}
              onChange={e => handleServiceChange(e.target.value || null)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              <option value="">Selecionar serviço...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — R$ {s.price.toFixed(2)} ({s.duration_min}min)
                </option>
              ))}
            </select>
          </div>

          {/* Data / Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Início</label>
              <input
                type="datetime-local"
                required
                value={toDatetimeLocal(form.starts_at)}
                onChange={e =>
                  setForm(prev => ({ ...prev, starts_at: fromDatetimeLocal(e.target.value) }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fim</label>
              <input
                type="datetime-local"
                required
                value={toDatetimeLocal(form.ends_at)}
                onChange={e =>
                  setForm(prev => ({ ...prev, ends_at: fromDatetimeLocal(e.target.value) }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e =>
                setForm(prev => ({ ...prev, status: e.target.value as AppointmentStatus }))
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Valor e Desconto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price ?? ''}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    price: e.target.value !== '' ? Number(e.target.value) : null,
                  }))
                }
                placeholder="0,00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Desconto (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discount}
                onChange={e =>
                  setForm(prev => ({ ...prev, discount: Number(e.target.value) }))
                }
                placeholder="0,00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Forma de pagamento */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Forma de Pagamento
            </label>
            <select
              value={form.payment_method ?? ''}
              onChange={e =>
                setForm(prev => ({ ...prev, payment_method: e.target.value || null }))
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              <option value="">Selecionar...</option>
              {PAYMENT_METHODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
            <textarea
              rows={2}
              value={form.notes ?? ''}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value || null }))}
              placeholder="Visível ao cliente..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
            />
          </div>

          {/* Total preview */}
          {form.price !== null && (
            <div className="bg-gray-50 rounded-lg px-4 py-2.5 flex justify-between items-center">
              <span className="text-xs text-gray-500">Total a receber</span>
              <span className="text-sm font-semibold text-gray-800">
                R$ {total.toFixed(2)}
              </span>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center gap-3 pt-1">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                title="Excluir agendamento"
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : isEditing ? 'Salvar' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
