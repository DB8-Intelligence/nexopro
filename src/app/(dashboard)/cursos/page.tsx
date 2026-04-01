'use client'

import { useState } from 'react'
import { BookOpen, Plus, Users, Clock, DollarSign, Calendar, X, Save, Loader2, MapPin } from 'lucide-react'
import { useCourses } from '@/hooks/useCourses'
import type { Course } from '@/types/database'
import type { CourseFormData } from '@/hooks/useCourses'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MODALITY_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  online:     'Online',
  hibrido:    'Híbrido',
}
const MODALITY_COLORS: Record<string, string> = {
  presencial: 'bg-blue-100 text-blue-700',
  online:     'bg-green-100 text-green-700',
  hibrido:    'bg-purple-100 text-purple-700',
}

function buildDefault(): CourseFormData {
  return { name: '', description: null, category: null, instructor: null, price: 0, duration_hours: null, capacity: null, starts_at: null, ends_at: null, schedule: null, modality: 'presencial', is_active: true }
}

function CourseModal({ course, onSave, onDelete, onClose }: {
  course: Course | null
  onSave: (data: CourseFormData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<CourseFormData>(course ? {
    name: course.name, description: course.description, category: course.category,
    instructor: course.instructor, price: course.price, duration_hours: course.duration_hours,
    capacity: course.capacity, starts_at: course.starts_at, ends_at: course.ends_at,
    schedule: course.schedule, modality: course.modality, is_active: course.is_active,
  } : buildDefault())
  const [saving, setSaving] = useState(false)

  function field<K extends keyof CourseFormData>(key: K) {
    return (val: CourseFormData[K]) => setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{course ? 'Editar curso' : 'Novo curso / turma'}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do curso *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={e => field('name')(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Inglês Básico — Turma A"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input
                type="text"
                value={form.category ?? ''}
                onChange={e => field('category')(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Idiomas, Música..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instrutor</label>
              <input
                type="text"
                value={form.instructor ?? ''}
                onChange={e => field('instructor')(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={e => field('price')(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carga (h)</label>
              <input
                type="number" min="0"
                value={form.duration_hours ?? ''}
                onChange={e => field('duration_hours')(parseInt(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vagas</label>
              <input
                type="number" min="0"
                value={form.capacity ?? ''}
                onChange={e => field('capacity')(parseInt(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
              <input
                type="date"
                value={form.starts_at ?? ''}
                onChange={e => field('starts_at')(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Término</label>
              <input
                type="date"
                value={form.ends_at ?? ''}
                onChange={e => field('ends_at')(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário / Dias</label>
            <input
              type="text"
              value={form.schedule ?? ''}
              onChange={e => field('schedule')(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seg e Qua, 19h–21h"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
            <div className="flex gap-2">
              {(['presencial', 'online', 'hibrido'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => field('modality')(m)}
                  className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
                    form.modality === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {MODALITY_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              rows={2}
              value={form.description ?? ''}
              onChange={e => field('description')(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {course && onDelete ? (
              <button type="button" onClick={() => onDelete(course.id)} className="text-sm text-red-600 hover:text-red-800">
                Excluir curso
              </button>
            ) : <span />}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CursosPage() {
  const { courses, loading, error, createCourse, updateCourse, deleteCourse } = useCourses()
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Course | null>(null)

  const active = courses.filter(c => c.is_active)
  const totalEnrolled = active.reduce((s, c) => s + c.enrolled, 0)

  async function handleSave(data: CourseFormData) {
    if (selected) await updateCourse(selected.id, data)
    else await createCourse(data)
    setModalOpen(false)
    setSelected(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este curso?')) return
    await deleteCourse(id)
    setModalOpen(false)
    setSelected(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-gray-600" />
            Cursos / Turmas
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{active.length} turmas ativas · {totalEnrolled} alunos matriculados</p>
        </div>
        <button
          type="button"
          onClick={() => { setSelected(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nova turma
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">Erro: {error}</div>
      )}

      {/* Summary cards */}
      {active.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{active.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Turmas ativas</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalEnrolled}</p>
            <p className="text-xs text-gray-500 mt-0.5">Alunos matriculados</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
                .format(active.reduce((s, c) => s + c.price * c.enrolled, 0))}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Receita potencial</p>
          </div>
        </div>
      )}

      {/* Course grid */}
      {courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Nenhum curso cadastrado</p>
          <button
            onClick={() => { setSelected(null); setModalOpen(true) }}
            className="text-blue-600 hover:underline text-sm mt-1"
          >
            Criar primeira turma
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map(course => {
            const occupancy = course.capacity ? Math.round((course.enrolled / course.capacity) * 100) : null
            const isFull = occupancy !== null && occupancy >= 100
            return (
              <div
                key={course.id}
                onClick={() => { setSelected(course); setModalOpen(true) }}
                className={`bg-white border rounded-2xl p-5 cursor-pointer hover:shadow-sm transition-shadow ${course.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{course.name}</p>
                    {course.category && <p className="text-xs text-gray-400 mt-0.5">{course.category}</p>}
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${MODALITY_COLORS[course.modality]}`}>
                    {MODALITY_LABELS[course.modality]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                  {course.instructor && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />{course.instructor}
                    </span>
                  )}
                  {course.duration_hours && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{course.duration_hours}h
                    </span>
                  )}
                  {course.price > 0 && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(course.price)}
                    </span>
                  )}
                  {course.schedule && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{course.schedule}
                    </span>
                  )}
                </div>

                {/* Dates */}
                {(course.starts_at || course.ends_at) && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <Calendar className="w-3 h-3" />
                    {course.starts_at && format(parseISO(course.starts_at), 'dd/MM/yyyy', { locale: ptBR })}
                    {course.starts_at && course.ends_at && ' → '}
                    {course.ends_at && format(parseISO(course.ends_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                )}

                {/* Enrollment bar */}
                {course.capacity && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">{course.enrolled} / {course.capacity} vagas</span>
                      <span className={`font-medium ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                        {isFull ? 'Lotado' : `${course.capacity - course.enrolled} disponíveis`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, occupancy ?? 0)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <CourseModal
          course={selected}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => { setModalOpen(false); setSelected(null) }}
        />
      )}
    </div>
  )
}
