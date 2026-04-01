'use client'

import { useState } from 'react'
import { FileText, Loader2, X } from 'lucide-react'
import type { Client } from '@/types/database'

interface NFSeFormData {
  client_id: string
  descricao_servico: string
  valor_servico: number
  aliquota_iss: number
  codigo_servico: string
  tomador_cpf_cnpj: string
  tomador_nome: string
  tomador_email: string
}

interface NFSeFormProps {
  clients: Client[]
  onSubmit: (data: NFSeFormData) => Promise<void>
  onClose: () => void
}

export function NFSeForm({ clients, onSubmit, onClose }: NFSeFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<NFSeFormData>({
    client_id: '',
    descricao_servico: '',
    valor_servico: 0,
    aliquota_iss: 2,
    codigo_servico: '',
    tomador_cpf_cnpj: '',
    tomador_nome: '',
    tomador_email: '',
  })

  function handleClientChange(clientId: string) {
    const client = clients.find(c => c.id === clientId)
    setForm(f => ({
      ...f,
      client_id: clientId,
      tomador_nome: client?.full_name ?? '',
      tomador_email: client?.email ?? '',
      tomador_cpf_cnpj: client?.cpf ?? '',
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const valorIss = (form.valor_servico * form.aliquota_iss) / 100
  const valorLiquido = form.valor_servico - valorIss

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Emitir NFS-e</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tomador (cliente)</label>
            <select
              value={form.client_id}
              onChange={e => handleClientChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecionar cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
              <input
                type="text"
                value={form.tomador_cpf_cnpj}
                onChange={e => setForm(f => ({ ...f, tomador_cpf_cnpj: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail tomador</label>
              <input
                type="email"
                value={form.tomador_email}
                onChange={e => setForm(f => ({ ...f, tomador_email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do serviço</label>
            <textarea
              value={form.descricao_servico}
              onChange={e => setForm(f => ({ ...f, descricao_servico: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
              placeholder="Ex: Consultoria em gestão empresarial..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.valor_servico || ''}
                onChange={e => setForm(f => ({ ...f, valor_servico: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alíquota ISS %</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="5"
                value={form.aliquota_iss}
                onChange={e => setForm(f => ({ ...f, aliquota_iss: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cód. serviço</label>
              <input
                type="text"
                value={form.codigo_servico}
                onChange={e => setForm(f => ({ ...f, codigo_servico: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="17.01"
              />
            </div>
          </div>

          {/* Cálculo */}
          {form.valor_servico > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>ISS ({form.aliquota_iss}%)</span>
                <span>- R$ {valorIss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-1 mt-1">
                <span>Valor líquido</span>
                <span>R$ {valorLiquido.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Emitir nota
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
