import { AgendaView } from '@/components/agenda/AgendaView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agenda — NexoPro',
}

export default function AgendaPage() {
  return <AgendaView />
}
