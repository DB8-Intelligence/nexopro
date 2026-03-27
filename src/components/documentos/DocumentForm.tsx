'use client'

import { useEffect, useState } from 'react'
import { X, Trash2, ExternalLink } from 'lucide-react'
import type { Document, DocumentStatus, Client } from '@/types/database'
import type { DocumentFormData } from '@/hooks/useDocuments'

const STATUS_OPTIONS: { value: DocumentStatus; label: string }[] = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'enviado',  label: 'Enviado' },
  { value: 'assinado', label: 'Assinado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const TYPE_OPTIONS = [
  'Contrato de Prestação de Serviços',
  'Orçamento',
  'Proposta Comercial',
  'Termo de Aceite',
  'Recibo',
  'Procuração',
  'Declaração',
  'Outro',
]

function buildDefaultForm(): DocumentFormData {
  return {
    title: '',
    type: 'Contrato de Prestação de Serviços',
    content: null,
    file_url: null,
    status: 'rascunho',
    client_id: null,
    expires_at: null,
  }
}

interface DocumentFormProps {
  open: boolean
  document: Document | null
  clients: Client[]
  onSave: (data: DocumentFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onMarkSigned: (id: string) => Promise<void>
  onClose: () => void
}

export function DocumentForm({
  open, document, clients, onSave, onDelete, onMarkSigned, onClose
}: DocumentFormProps) {
  const isEditing = document !== null
  const [form, setForm] = useState<DocumentFormData>(buildDefaultForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (document) {
      setForm({
        title: document.title,
        type: document.type,
        content: document.content,
        file_url: document.file_url,
        status: document.status,
        client_id: document.client_id,
        expires_at: document.expires_at,
      })
    } else {
      setForm(buildDefaultForm())
    }
  }, [document])

  function set<K extends keyof DocumentFormData>(key: K, value: DocumentFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  async function handleDelete() {
    if (!document) return
    if (!confirm(`Excluir "${document.title}"?`)) return
    setDeleting(true)
    await onDelete(document.id)
    setDeleting(false)
  }

  async function handleMarkSigned() {
    if (!document) return
    await onMarkSigned(document.id)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-base font-semibold text-gray-800">
            {isEditing ? 'Editar Documento' : 'Novo Documento'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Ex: Contrato João Silva — Março 2026"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* Tipo e Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                {TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as DocumentStatus)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cliente e Validade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
              <select
                value={form.client_id ?? ''}
                onChange={e => set('client_id', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                <option value="">Nenhum</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Validade</label>
              <input
                type="date"
                value={form.expires_at ?? ''}
                onChange={e => set('expires_at', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
          </div>

          {/* URL do arquivo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Link do arquivo (Google Drive, Dropbox...)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.file_url ?? ''}
                onChange={e => set('file_url', e.target.value || null)}
                placeholder="https://..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
              {form.file_url && (
                <a
                  href={form.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Conteúdo / Notas</label>
            <textarea
              rows={4}
              value={form.content ?? ''}
              onChange={e => set('content', e.target.value || null)}
              placeholder="Texto do documento ou observações..."
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
                title="Excluir"
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {isEditing && document?.status === 'enviado' && (
              <button
                type="button"
                onClick={handleMarkSigned}
                className="px-3 py-2.5 rounded-xl border border-green-300 bg-green-50 text-sm text-green-700 font-medium hover:bg-green-100 transition-colors"
              >
                Marcar assinado
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
              {saving ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
