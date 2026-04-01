'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClientTable } from '@/components/clientes/ClientTable'
import { ClientForm } from '@/components/clientes/ClientForm'
import { useClients } from '@/hooks/useClients'
import type { Client } from '@/types/database'
import type { ClientFormData } from '@/hooks/useClients'

export function ClientsView() {
  const router = useRouter()
  const {
    clients,
    loading,
    error,
    createClient_,
    deleteClient,
  } = useClients()

  const [modalOpen, setModalOpen] = useState(false)

  function openCreate() {
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  async function handleSave(data: ClientFormData) {
    const created = await createClient_(data)
    if (created) router.push(`/clientes/${created.id}`)
    closeModal()
  }

  async function handleDelete(id: string) {
    await deleteClient(id)
    closeModal()
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Erro: {error}
        </div>
      )}

      <ClientTable
        clients={clients}
        loading={loading}
        onSelectClient={(client: Client) => router.push(`/clientes/${client.id}`)}
        onNewClient={openCreate}
      />

      <ClientForm
        open={modalOpen}
        client={null}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={closeModal}
      />
    </div>
  )
}
