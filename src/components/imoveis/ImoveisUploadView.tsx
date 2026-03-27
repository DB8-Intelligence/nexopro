'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadForm } from './UploadForm'
import { useProperties } from '@/hooks/useProperties'
import { createClient } from '@/lib/supabase/client'
import type { PropertyFormData } from '@/hooks/useProperties'

export function ImoveisUploadView() {
  const router = useRouter()
  const { createProperty } = useProperties()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(data: PropertyFormData, coverFile: File | null, imageFiles: File[]) {
    setSubmitting(true)
    const supabase = createClient()

    try {
      let coverUrl: string | null = null
      const imageUrls: string[] = []

      // Upload cover image
      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `covers/${Date.now()}-cover.${ext}`
        const { data: uploaded, error } = await supabase.storage
          .from('properties')
          .upload(path, coverFile, { upsert: false })
        if (!error && uploaded) {
          const { data: urlData } = supabase.storage.from('properties').getPublicUrl(uploaded.path)
          coverUrl = urlData.publicUrl
        }
      }

      // Upload additional images
      for (const file of imageFiles) {
        const ext = file.name.split('.').pop()
        const path = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: uploaded, error } = await supabase.storage
          .from('properties')
          .upload(path, file, { upsert: false })
        if (!error && uploaded) {
          const { data: urlData } = supabase.storage.from('properties').getPublicUrl(uploaded.path)
          imageUrls.push(urlData.publicUrl)
        }
      }

      const property = await createProperty({
        ...data,
        cover_url: coverUrl,
        images: imageUrls,
      })

      if (property) {
        router.push(`/imoveis/editor/${property.id}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <UploadForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/imoveis/inbox')}
        submitting={submitting}
      />
    </div>
  )
}
