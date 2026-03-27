'use client'

import { useRouter } from 'next/navigation'
import { InboxTable } from './InboxTable'
import { useProperties } from '@/hooks/useProperties'
import type { Property, PropertyStatus } from '@/types/database'

export function ImoveisInboxView() {
  const router = useRouter()
  const { properties, loading, fetchProperties } = useProperties()

  function handleSelectProperty(property: Property) {
    router.push(`/imoveis/editor/${property.id}`)
  }

  function handleNewProperty() {
    router.push('/imoveis/upload')
  }

  function handleFilterChange(status: PropertyStatus | 'all') {
    fetchProperties(status)
  }

  return (
    <InboxTable
      properties={properties}
      loading={loading}
      onSelectProperty={handleSelectProperty}
      onNewProperty={handleNewProperty}
      onFilterChange={handleFilterChange}
    />
  )
}
