import { ClientsView } from '@/components/clientes/ClientsView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clientes — NexoPro',
}

export default function ClientesPage() {
  return <ClientsView />
}
