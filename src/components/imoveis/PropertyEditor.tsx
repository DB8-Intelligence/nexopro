'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles, Copy, Check, Trash2, Save, ArrowLeft,
  ChevronDown, ChevronUp, Loader2, AlertCircle,
} from 'lucide-react'
import type { Property, PropertyStatus } from '@/types/database'
import type { PropertyFormData } from '@/hooks/useProperties'
import { VideoGenerator } from './VideoGenerator'
import { cn } from '@/lib/utils'

const PROPERTY_TYPES = ['Apartamento', 'Casa', 'Comercial', 'Terreno', 'Sala', 'Galpão', 'Chácara', 'Outro']
const PROPERTY_STANDARDS = [
  { value: 'economico', label: 'Econômico' },
  { value: 'padrao', label: 'Padrão' },
  { value: 'alto', label: 'Alto Padrão' },
  { value: 'luxo', label: 'Luxo' },
]

interface PropertyEditorProps {
  property: Property
  onUpdate: (id: string, data: Partial<PropertyFormData & { status: PropertyStatus }>) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
  onGenerateCaption: (propertyId: string) => Promise<boolean>
  onGenerateVideo: (propertyId: string, formData: FormData) => Promise<boolean>
}

export function PropertyEditor({
  property,
  onUpdate,
  onDelete,
  onGenerateCaption,
  onGenerateVideo,
}: PropertyEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [copied, setCopied] = useState<'caption' | 'post' | null>(null)
  const [showFullCaption, setShowFullCaption] = useState(false)

  const [form, setForm] = useState<Partial<PropertyFormData>>({
    title: property.title,
    description: property.description,
    price: property.price,
    city: property.city,
    neighborhood: property.neighborhood,
    property_type: property.property_type,
    property_standard: property.property_standard,
    built_area_m2: property.built_area_m2,
    highlights: property.highlights,
    investment_value: property.investment_value,
  })

  function set<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    await onUpdate(property.id, form)
    setSaving(false)
  }

  async function handleGenerateCaption() {
    setGeneratingCaption(true)
    await onGenerateCaption(property.id)
    setGeneratingCaption(false)
  }

  async function handleDelete() {
    const ok = await onDelete(property.id)
    if (ok) router.push('/imoveis/inbox')
  }

  async function handleCopy(text: string, type: 'caption' | 'post') {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const isProcessing = property.status === 'processing' || property.status === 'uploading'
  const hasCaption = !!property.generated_caption

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/imoveis/inbox')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <span className="text-xs text-red-600">Confirmar exclusão?</span>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700"
              >
                Excluir
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Salvar
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-6 flex-1 min-h-0 overflow-auto">
        {/* Left: editable form */}
        <div className="flex-1 space-y-4 overflow-auto pb-4">
          {property.cover_url && (
            <div className="relative rounded-xl overflow-hidden h-48 flex-shrink-0">
              <img src={property.cover_url} alt={property.title ?? 'Imóvel'} className="w-full h-full object-cover" />
              {property.status === 'error' && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-xs px-3 py-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {property.error_message ?? 'Ocorreu um erro no processamento'}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
              <input
                type="text"
                value={form.title ?? ''}
                onChange={e => set('title', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
              <select
                value={form.property_type ?? ''}
                onChange={e => set('property_type', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                <option value="">Selecionar...</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Padrão</label>
              <select
                value={form.property_standard ?? ''}
                onChange={e => set('property_standard', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                <option value="">Selecionar...</option>
                {PROPERTY_STANDARDS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
              <input
                type="text"
                value={form.city ?? ''}
                onChange={e => set('city', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bairro</label>
              <input
                type="text"
                value={form.neighborhood ?? ''}
                onChange={e => set('neighborhood', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Preço / Valor</label>
              <input
                type="text"
                value={form.price ?? ''}
                onChange={e => set('price', e.target.value || null)}
                placeholder="R$ 450.000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Área (m²)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.built_area_m2 ?? ''}
                onChange={e => set('built_area_m2', e.target.value ? Number(e.target.value) : null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Destaques (para a IA)</label>
              <textarea
                rows={2}
                value={form.highlights ?? ''}
                onChange={e => set('highlights', e.target.value || null)}
                placeholder="Vista mar, 2 vagas, churrasqueira, condomínio fechado..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Descrição completa</label>
              <textarea
                rows={3}
                value={form.description ?? ''}
                onChange={e => set('description', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right: AI content */}
        <div className="w-72 flex-shrink-0 space-y-4 overflow-auto pb-4">
          {/* Caption */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                Legenda IA
              </p>
              <button
                onClick={handleGenerateCaption}
                disabled={generatingCaption || isProcessing}
                className={cn(
                  'flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40',
                  hasCaption
                    ? 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                )}
              >
                {generatingCaption ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Gerando...</>
                ) : hasCaption ? (
                  'Regerar'
                ) : (
                  <><Sparkles className="w-3 h-3" /> Gerar</>
                )}
              </button>
            </div>

            {hasCaption ? (
              <div className="space-y-2">
                <p className={cn(
                  'text-xs text-gray-700 leading-relaxed whitespace-pre-wrap',
                  !showFullCaption && 'line-clamp-5'
                )}>
                  {property.generated_caption}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFullCaption(v => !v)}
                    className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600"
                  >
                    {showFullCaption ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showFullCaption ? 'Recolher' : 'Ver mais'}
                  </button>
                  <button
                    onClick={() => handleCopy(property.generated_caption!, 'caption')}
                    className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 ml-auto"
                  >
                    {copied === 'caption' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === 'caption' ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                {property.generated_post_text && (
                  <div className="border-t border-gray-100 pt-2 space-y-1">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Texto do post</p>
                    <p className="text-xs text-gray-600 line-clamp-3">{property.generated_post_text}</p>
                    <button
                      onClick={() => handleCopy(property.generated_post_text!, 'post')}
                      className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700"
                    >
                      {copied === 'post' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied === 'post' ? 'Copiado!' : 'Copiar post'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                {isProcessing ? 'Processando...' : 'Nenhuma legenda gerada'}
              </p>
            )}
          </div>

          {/* Video */}
          <VideoGenerator
            property={property}
            onGenerateVideo={onGenerateVideo}
          />
        </div>
      </div>
    </div>
  )
}
