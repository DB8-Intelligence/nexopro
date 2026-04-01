'use client'

import { useState } from 'react'
import { DocumentList } from '@/components/documentos/DocumentList'
import { DocumentForm } from '@/components/documentos/DocumentForm'
import { useDocuments } from '@/hooks/useDocuments'
import type { Document } from '@/types/database'
import type { DocumentFormData } from '@/hooks/useDocuments'

export function DocumentosView() {
  const {
    documents,
    clients,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    markAsSigned,
  } = useDocuments()

  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Document | null>(null)

  function openCreate() { setSelected(null); setModalOpen(true) }
  function openEdit(doc: Document) { setSelected(doc); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setSelected(null) }

  async function handleSave(data: DocumentFormData) {
    if (selected) {
      await updateDocument(selected.id, data)
    } else {
      await createDocument(data)
    }
    closeModal()
  }

  async function handleDelete(id: string) {
    await deleteDocument(id)
    closeModal()
  }

  async function handleMarkSigned(id: string) {
    await markAsSigned(id)
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Erro: {error}
        </div>
      )}

      <DocumentList
        documents={documents}
        loading={loading}
        onSelectDocument={openEdit}
        onNewDocument={openCreate}
      />

      <DocumentForm
        open={modalOpen}
        document={selected}
        clients={clients}
        onSave={handleSave}
        onDelete={handleDelete}
        onMarkSigned={handleMarkSigned}
        onClose={closeModal}
      />
    </div>
  )
}
