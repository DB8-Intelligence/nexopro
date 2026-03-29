import type { Metadata } from 'next'
import { ImoveisUploadView } from '@/components/imoveis/ImoveisUploadView'

export const metadata: Metadata = {
  title: 'Cadastrar Imóvel | NexoOmnix',
}

export default function ImoveisUploadPage() {
  return <ImoveisUploadView />
}
