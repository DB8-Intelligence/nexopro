'use client'

import { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { Client } from '@/types/database'
import type { ClientFormData } from '@/hooks/useClients'

const GENDER_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
]

const SOURCE_OPTIONS = [
  { value: 'indicacao', label: 'Indicação' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google', label: 'Google' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'site', label: 'Site' },
  { value: 'outro', label: 'Outro' },
]

function buildDefaultForm(): ClientFormData {
  return {
    full_name: '',
    email: null,
    phone: null,
    whatsapp: null,
    cpf: null,
    birth_date: null,
    gender: null,
    address_street: null,
    address_number: null,
    address_city: null,
    address_state: null,
    address_zip: null,
    tags: [],
    notes: null,
    source: null,
    is_active: true,
  }
}

interface ClientFormProps {
  open: boolean
  client: Client | null
  onSave: (data: ClientFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

export function ClientForm({ open, client, onSave, onDelete, onClose }: ClientFormProps) {
  const isEditing = client !== null
  const [form, setForm] = useState<ClientFormData>(buildDefaultForm)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (client) {
      setForm({
        full_name: client.full_name,
        email: client.email,
        phone: client.phone,
        whatsapp: client.whatsapp,
        cpf: client.cpf,
        birth_date: client.birth_date,
        gender: client.gender,
        address_street: client.address_street,
        address_number: client.address_number,
        address_city: client.address_city,
        address_state: client.address_state,
        address_zip: client.address_zip,
        tags: client.tags ?? [],
        notes: client.notes,
        source: client.source,
        is_active: client.is_active,
      })
    } else {
      setForm(buildDefaultForm())
    }
    setTagInput('')
  }, [client])

  function set<K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) {
      set('tags', [...form.tags, tag])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    set('tags', form.tags.filter(t => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  async function handleDelete() {
    if (!client) return
    if (!confirm(`Excluir o cliente "${client.full_name}"?`)) return
    setDeleting(true)
    await onDelete(client.id)
    setDeleting(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-base font-semibold text-gray-800">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="Nome do cliente"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* Contato */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contato</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email ?? ''}
                  onChange={e => set('email', e.target.value || null)}
                  placeholder="email@exemplo.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={form.phone ?? ''}
                  onChange={e => set('phone', e.target.value || null)}
                  placeholder="(11) 99999-9999"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={form.whatsapp ?? ''}
                  onChange={e => set('whatsapp', e.target.value || null)}
                  placeholder="(11) 99999-9999"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CPF</label>
                <input
                  type="text"
                  value={form.cpf ?? ''}
                  onChange={e => set('cpf', e.target.value || null)}
                  placeholder="000.000.000-00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Dados pessoais */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dados Pessoais</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data de nascimento</label>
                <input
                  type="date"
                  value={form.birth_date ?? ''}
                  onChange={e => set('birth_date', e.target.value || null)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gênero</label>
                <select
                  value={form.gender ?? ''}
                  onChange={e => set('gender', e.target.value || null)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  <option value="">Selecionar...</option>
                  {GENDER_OPTIONS.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Endereço</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Rua</label>
                <input
                  type="text"
                  value={form.address_street ?? ''}
                  onChange={e => set('address_street', e.target.value || null)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Número</label>
                <input
                  type="text"
                  value={form.address_number ?? ''}
                  onChange={e => set('address_number', e.target.value || null)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
                <input
                  type="text"
                  value={form.address_city ?? ''}
                  onChange={e => set('address_city', e.target.value || null)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                <input
                  type="text"
                  maxLength={2}
                  value={form.address_state ?? ''}
                  onChange={e => set('address_state', e.target.value.toUpperCase() || null)}
                  placeholder="SP"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CEP</label>
                <input
                  type="text"
                  value={form.address_zip ?? ''}
                  onChange={e => set('address_zip', e.target.value || null)}
                  placeholder="00000-000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {form.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Adicionar tag..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Como conheceu / Observações */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Como conheceu</label>
              <select
                value={form.source ?? ''}
                onChange={e => set('source', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                <option value="">Selecionar...</option>
                {SOURCE_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => set('is_active', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">Cliente ativo</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
            <textarea
              rows={2}
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value || null)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
            />
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3 pt-1">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                title="Excluir cliente"
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
              {saving ? 'Salvando...' : isEditing ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
