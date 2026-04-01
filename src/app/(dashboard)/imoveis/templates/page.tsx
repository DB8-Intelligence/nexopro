import type { Metadata } from 'next'
import { TemplateGallery } from '@/components/imoveis/TemplateGallery'

export const metadata: Metadata = {
  title: 'Templates | NexoOmnix',
  description: 'Modelos de vídeo para imóveis',
}

export default function TemplatesPage() {
  return <TemplateGallery />
}
