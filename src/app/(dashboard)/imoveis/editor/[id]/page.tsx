import type { Metadata } from 'next'
import { ImoveisEditorView } from '@/components/imoveis/ImoveisEditorView'

export const metadata: Metadata = {
  title: 'Editor de Imóvel | NexoOmnix',
}

export default function ImoveisEditorPage() {
  return <ImoveisEditorView />
}
