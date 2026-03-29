import { DocumentosView } from '@/components/documentos/DocumentosView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentos — NexoOmnix',
}

export default function DocumentosPage() {
  return <DocumentosView />
}
