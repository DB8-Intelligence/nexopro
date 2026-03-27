'use client'

import { useState, useEffect } from 'react'
import { Plus, Palette, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { BrandTemplate } from '@/types/database'

interface TemplateFormState {
  name: string
  primary_color: string
  secondary_color: string
  logo_url: string
}

const DEFAULT_FORM: TemplateFormState = {
  name: '',
  primary_color: '#1d4ed8',
  secondary_color: '#ffffff',
  logo_url: '',
}

export function TemplateGallery() {
  const supabase = createClient()
  const [templates, setTemplates] = useState<BrandTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<TemplateFormState>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTemplates()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchTemplates() {
    setLoading(true)
    const { data } = await supabase
      .from('brand_templates')
      .select('*')
      .order('created_at', { ascending: false })
    setTemplates(data ?? [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)

    const config = {
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      logo_url: form.logo_url || null,
    }

    const { data, error } = await supabase
      .from('brand_templates')
      .insert({ name: form.name, config })
      .select('*')
      .single()

    if (!error && data) {
      setTemplates(prev => [data, ...prev])
      setForm(DEFAULT_FORM)
      setShowForm(false)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('brand_templates').delete().eq('id', id)
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Templates de Marca</h2>
          <p className="text-sm text-gray-500">Configure as cores e logo para os vídeos gerados pela IA.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo template
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4 max-w-lg">
          <p className="text-sm font-semibold text-gray-800">Novo Template</p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome do template</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Imobiliária Silva"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cor primária</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))}
                  className="w-6 h-6 rounded cursor-pointer border-0"
                />
                <span className="text-sm text-gray-700 font-mono">{form.primary_color}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cor secundária</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <input
                  type="color"
                  value={form.secondary_color}
                  onChange={e => setForm(p => ({ ...p, secondary_color: e.target.value }))}
                  className="w-6 h-6 rounded cursor-pointer border-0"
                />
                <span className="text-sm text-gray-700 font-mono">{form.secondary_color}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">URL do logo (opcional)</label>
            <input
              type="url"
              value={form.logo_url}
              onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowForm(false); setForm(DEFAULT_FORM) }}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar template'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32 text-sm text-gray-400">
          Carregando...
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <Palette className="w-10 h-10 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhum template criado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => {
            const config = (template.config ?? {}) as {
              primary_color?: string
              secondary_color?: string
              logo_url?: string | null
            }
            return (
              <div key={template.id} className="card">
                {/* Color preview */}
                <div className="h-16 rounded-lg overflow-hidden mb-3 flex">
                  <div
                    className="flex-1"
                    style={{ backgroundColor: config.primary_color ?? '#1d4ed8' }}
                  />
                  <div
                    className="flex-1"
                    style={{ backgroundColor: config.secondary_color ?? '#ffffff' }}
                  />
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{template.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="inline-block w-3 h-3 rounded-full border border-gray-200"
                        style={{ backgroundColor: config.primary_color ?? '#1d4ed8' }}
                      />
                      <span className="text-xs text-gray-400 font-mono">{config.primary_color}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {config.logo_url && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <img
                      src={config.logo_url}
                      alt="Logo"
                      className="h-8 object-contain"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
