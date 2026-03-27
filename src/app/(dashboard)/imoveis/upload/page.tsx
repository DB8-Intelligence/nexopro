import type { Metadata } from 'next'
import { ImoveisUploadView } from '@/components/imoveis/ImoveisUploadView'

export const metadata: Metadata = {
  title: 'Cadastrar Imóvel | NexoPro',
}

export default function ImoveisUploadPage() {
  return <ImoveisUploadView />
}
