'use client'

import { useState } from 'react'
import { Package, Plus, Search, AlertTriangle, X, Save, Loader2, Minus } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import type { Product } from '@/types/database'
import type { ProductFormData } from '@/hooks/useProducts'

const UNITS = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'm', 'm²', 'par', 'pç']
const CATEGORIES = ['Peças', 'Insumos', 'Ferramentas', 'Medicamentos', 'Rações', 'Acessórios', 'Higiene', 'Outros']

function buildDefault(): ProductFormData {
  return { name: '', sku: null, category: null, description: null, price: 0, cost: 0, stock_quantity: 0, min_quantity: 5, unit: 'un', is_active: true }
}

function ProductModal({ product, onSave, onDelete, onClose }: {
  product: Product | null
  onSave: (data: ProductFormData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<ProductFormData>(product ? {
    name: product.name, sku: product.sku, category: product.category,
    description: product.description, price: product.price, cost: product.cost,
    stock_quantity: product.stock_quantity, min_quantity: product.min_quantity,
    unit: product.unit, is_active: product.is_active,
  } : buildDefault())
  const [saving, setSaving] = useState(false)

  function field<K extends keyof ProductFormData>(key: K) {
    return (val: ProductFormData[K]) => setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{product ? 'Editar produto' : 'Novo produto'}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={e => field('name')(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Código</label>
              <input
                type="text"
                value={form.sku ?? ''}
                onChange={e => field('sku')(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={form.category ?? ''}
                onChange={e => field('category')(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecionar...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={e => field('price')(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custo (R$)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.cost}
                onChange={e => field('cost')(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select
                value={form.unit}
                onChange={e => field('unit')(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque atual</label>
              <input
                type="number" min="0"
                value={form.stock_quantity}
                onChange={e => field('stock_quantity')(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque mínimo</label>
              <input
                type="number" min="0"
                value={form.min_quantity}
                onChange={e => field('min_quantity')(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              rows={2}
              value={form.description ?? ''}
              onChange={e => field('description')(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {product && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(product.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Excluir produto
              </button>
            ) : <span />}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EstoquePage() {
  const { products, loading, error, createProduct, updateProduct, deleteProduct, adjustStock } = useProducts()
  const [search, setSearch] = useState('')
  const [filterLow, setFilterLow] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)

  const filtered = products.filter(p => {
    const matchSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? '').toLowerCase().includes(search.toLowerCase())
    const matchLow = !filterLow || p.stock_quantity <= p.min_quantity
    return matchSearch && matchLow
  })

  const lowStockCount = products.filter(p => p.stock_quantity <= p.min_quantity && p.is_active).length

  async function handleSave(data: ProductFormData) {
    if (selected) {
      await updateProduct(selected.id, data)
    } else {
      await createProduct(data)
    }
    setModalOpen(false)
    setSelected(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este produto?')) return
    await deleteProduct(id)
    setModalOpen(false)
    setSelected(null)
  }

  function openEdit(p: Product) {
    setSelected(p)
    setModalOpen(true)
  }

  function openCreate() {
    setSelected(null)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-gray-600" />
            Estoque
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.filter(p => p.is_active).length} produtos cadastrados</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo produto
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">Erro: {error}</div>
      )}

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            <strong>{lowStockCount} produto{lowStockCount !== 1 ? 's' : ''}</strong> com estoque abaixo do mínimo
          </p>
          <button
            type="button"
            onClick={() => setFilterLow(true)}
            className="text-xs text-amber-700 font-semibold hover:underline"
          >
            Filtrar
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, SKU ou categoria..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <button
          type="button"
          onClick={() => setFilterLow(f => !f)}
          className={`px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${filterLow ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          Estoque baixo
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">{search || filterLow ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</p>
            {!search && !filterLow && (
              <button onClick={openCreate} className="text-blue-600 hover:underline text-sm mt-1">
                Cadastrar primeiro produto
              </button>
            )}
          </div>
        ) : (
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Preço</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estoque</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ajuste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => {
                const isLow = p.stock_quantity <= p.min_quantity
                return (
                  <tr
                    key={p.id}
                    onClick={() => openEdit(p)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      {p.sku && <p className="text-xs text-gray-400">SKU: {p.sku}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{p.category ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {isLow && <AlertTriangle className="w-3 h-3" />}
                        {p.stock_quantity} {p.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => adjustStock(p.id, -1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustStock(p.id, 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <ProductModal
          product={selected}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => { setModalOpen(false); setSelected(null) }}
        />
      )}
    </div>
  )
}
