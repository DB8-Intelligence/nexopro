import type { Metadata } from 'next'
import { ContentWizard } from '@/components/content-ai/ContentWizard'

export const metadata: Metadata = {
  title: 'ContentAI | NexoPro',
  description: 'Crie conteúdo viral para redes sociais com inteligência artificial',
}

export default function ConteudoPage() {
  return <ContentWizard />
}
