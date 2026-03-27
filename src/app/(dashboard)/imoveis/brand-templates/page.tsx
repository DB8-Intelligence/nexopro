import type { Metadata } from 'next'
import { TemplateGallery } from '@/components/imoveis/TemplateGallery'

export const metadata: Metadata = {
  title: 'Templates de Marca | NexoPro',
}

export default function BrandTemplatesPage() {
  return <TemplateGallery />
}
