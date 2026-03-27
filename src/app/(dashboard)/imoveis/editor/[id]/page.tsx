import type { Metadata } from 'next'
import { ImoveisEditorView } from '@/components/imoveis/ImoveisEditorView'

export const metadata: Metadata = {
  title: 'Editor de Imóvel | NexoPro',
}

export default function ImoveisEditorPage() {
  return <ImoveisEditorView />
}
