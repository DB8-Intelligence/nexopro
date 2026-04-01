'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/database'

export interface ProductFormData {
  name: string
  sku: string | null
  category: string | null
  description: string | null
  price: number
  cost: number
  stock_quantity: number
  min_quantity: number
  unit: string
  is_active: boolean
}

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  createProduct: (data: ProductFormData) => Promise<Product | null>
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  adjustStock: (id: string, delta: number) => Promise<boolean>
}

export function useProducts(): UseProductsReturn {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles').select('tenant_id').eq('id', user.id).single()
      const tid = profile?.tenant_id ?? null
      setTenantId(tid)

      if (tid) {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('products').select('*').order('name')
        if (fetchError) setError(fetchError.message)
        else setProducts((data ?? []) as Product[])
        setLoading(false)
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createProduct = useCallback(async (data: ProductFormData): Promise<Product | null> => {
    if (!tenantId) { setError('Tenant não identificado.'); return null }
    const { data: created, error: err } = await supabase
      .from('products').insert({ ...data, tenant_id: tenantId }).select('*').single()
    if (err) { setError(err.message); return null }
    setProducts(prev => [...prev, created as Product].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
    return created as Product
  }, [supabase, tenantId])

  const updateProduct = useCallback(async (id: string, data: Partial<ProductFormData>): Promise<boolean> => {
    const { data: updated, error: err } = await supabase
      .from('products').update(data).eq('id', id).select('*').single()
    if (err) { setError(err.message); return false }
    setProducts(prev => prev.map(p => p.id === id ? updated as Product : p))
    return true
  }, [supabase])

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    const { error: err } = await supabase.from('products').delete().eq('id', id)
    if (err) { setError(err.message); return false }
    setProducts(prev => prev.filter(p => p.id !== id))
    return true
  }, [supabase])

  const adjustStock = useCallback(async (id: string, delta: number): Promise<boolean> => {
    const product = products.find(p => p.id === id)
    if (!product) return false
    const newQty = Math.max(0, product.stock_quantity + delta)
    return updateProduct(id, { stock_quantity: newQty })
  }, [products, updateProduct])

  return { products, loading, error, createProduct, updateProduct, deleteProduct, adjustStock }
}
