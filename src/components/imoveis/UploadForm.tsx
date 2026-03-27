'use client'

import { useRef, useState } from 'react'
import { X, Upload, ImagePlus, Loader2 } from 'lucide-react'
import type { PropertyFormData } from '@/hooks/useProperties'

const PROPERTY_TYPES = ['Apartamento', 'Casa', 'Comercial', 'Terreno', 'Sala', 'Galpão', 'Chácara', 'Outro']
const PROPERTY_STANDARDS = [
  { value: 'economico',  label: 'Econômico' },
  { value: 'padrao',     label: 'Padrão' },
  { value: 'alto',       label: 'Alto Padrão' },
  { value: 'luxo',       label: 'Luxo' },
]

interface UploadFormProps {
  onSubmit: (data: PropertyFormData, coverFile: File | null, imageFiles: File[]) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export function UploadForm({ onSubmit, onCancel, submitting = false }: UploadFormProps) {
  const coverInputRef = useRef<HTMLInputElement>(null)
  const imagesInputRef = useRef<HTMLInputElement>(null)

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [form, setForm] = useState<PropertyFormData>({
    title: null,
    description: null,
    price: null,
    city: null,
    neighborhood: null,
    property_type: null,
    property_standard: null,
    investment_value: null,
    built_area_m2: null,
    highlights: null,
    cover_url: null,
    images: [],
  })

  function set<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setImageFiles(prev => [...prev, ...files])
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  function removeImage(index: number) {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(form, coverFile, imageFiles)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Cadastrar Imóvel</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Preencha os dados e adicione fotos para geração de legenda e vídeo com IA.
        </p>
      </div>

      {/* Capa */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Foto de capa</p>
        <div
          className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
          style={{ height: 200 }}
          onClick={() => coverInputRef.current?.click()}
        >
          {coverPreview ? (
            <>
              <img src={coverPreview} alt="Capa" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null) }}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm">Clique para adicionar a foto de capa</span>
            </div>
          )}
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>
      </div>

      {/* Dados básicos */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Dados do Imóvel</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
            <input
              type="text"
              value={form.title ?? ''}
              onChange={e => set('title', e.target.value || null)}
              placeholder="Ex: Apartamento 2 quartos com vista mar"
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
              placeholder="Ex: Vista mar, 2 vagas, churrasqueira, condomínio fechado..."
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

      {/* Fotos adicionais */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Fotos adicionais ({imageFiles.length})
          </p>
          <button
            type="button"
            onClick={() => imagesInputRef.current?.click()}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <Upload className="w-3 h-3" /> Adicionar
          </button>
        </div>
        <input
          ref={imagesInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImagesChange}
        />
        {imagePreviews.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center gap-2 text-gray-400 text-sm cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => imagesInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Arrastar ou selecionar fotos
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Cadastrando...</>
          ) : (
            'Cadastrar imóvel'
          )}
        </button>
      </div>
    </form>
  )
}
