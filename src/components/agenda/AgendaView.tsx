'use client'

import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import { CalendarView } from '@/components/agenda/CalendarView'
import { AppointmentModal } from '@/components/agenda/AppointmentModal'
import { useAppointments } from '@/hooks/useAppointments'
import type { Appointment } from '@/types/database'
import type { AppointmentFormData } from '@/hooks/useAppointments'

export function AgendaView() {
  const {
    appointments,
    clients,
    services,
    loading,
    error,
    fetchByWeek,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [initialDate, setInitialDate] = useState<Date | null>(null)

  const handleWeekChange = useCallback((weekStart: Date) => {
    fetchByWeek(weekStart)
  }, [fetchByWeek])

  function openCreate(date: Date) {
    setSelectedAppointment(null)
    setInitialDate(date)
    setModalOpen(true)
  }

  function openEdit(appointment: Appointment) {
    setSelectedAppointment(appointment)
    setInitialDate(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedAppointment(null)
    setInitialDate(null)
  }

  async function handleSave(data: AppointmentFormData) {
    if (selectedAppointment) {
      await updateAppointment(selectedAppointment.id, data)
    } else {
      await createAppointment(data)
    }
    closeModal()
  }

  async function handleDelete(id: string) {
    await deleteAppointment(id)
    closeModal()
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500">Gerencie seus agendamentos</p>
        </div>
        <button
          onClick={() => openCreate(new Date())}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo agendamento
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Erro ao carregar agendamentos: {error}
        </div>
      )}

      {/* Calendário */}
      <div className="flex-1 min-h-0">
        <CalendarView
          appointments={appointments}
          loading={loading}
          onWeekChange={handleWeekChange}
          onSelectAppointment={openEdit}
          onNewAppointment={openCreate}
        />
      </div>

      {/* Modal */}
      <AppointmentModal
        open={modalOpen}
        appointment={selectedAppointment}
        initialDate={initialDate}
        clients={clients}
        services={services}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={closeModal}
      />
    </div>
  )
}
