'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Course } from '@/types/database'

export interface CourseFormData {
  name: string
  description: string | null
  category: string | null
  instructor: string | null
  price: number
  duration_hours: number | null
  capacity: number | null
  starts_at: string | null
  ends_at: string | null
  schedule: string | null
  modality: 'presencial' | 'online' | 'hibrido'
  is_active: boolean
}

interface UseCoursesReturn {
  courses: Course[]
  loading: boolean
  error: string | null
  createCourse: (data: CourseFormData) => Promise<Course | null>
  updateCourse: (id: string, data: Partial<CourseFormData>) => Promise<boolean>
  deleteCourse: (id: string) => Promise<boolean>
}

export function useCourses(): UseCoursesReturn {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles').select('tenant_id').eq('id', user.id).single()
      const tid = profile?.tenant_id ?? null
      setTenantId(tid)

      if (tid) {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('courses').select('*').order('created_at', { ascending: false })
        if (fetchError) setError(fetchError.message)
        else setCourses((data ?? []) as Course[])
        setLoading(false)
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createCourse = useCallback(async (data: CourseFormData): Promise<Course | null> => {
    if (!tenantId) { setError('Tenant não identificado.'); return null }
    const { data: created, error: err } = await supabase
      .from('courses').insert({ ...data, tenant_id: tenantId }).select('*').single()
    if (err) { setError(err.message); return null }
    setCourses(prev => [created as Course, ...prev])
    return created as Course
  }, [supabase, tenantId])

  const updateCourse = useCallback(async (id: string, data: Partial<CourseFormData>): Promise<boolean> => {
    const { data: updated, error: err } = await supabase
      .from('courses').update(data).eq('id', id).select('*').single()
    if (err) { setError(err.message); return false }
    setCourses(prev => prev.map(c => c.id === id ? updated as Course : c))
    return true
  }, [supabase])

  const deleteCourse = useCallback(async (id: string): Promise<boolean> => {
    const { error: err } = await supabase.from('courses').delete().eq('id', id)
    if (err) { setError(err.message); return false }
    setCourses(prev => prev.filter(c => c.id !== id))
    return true
  }, [supabase])

  return { courses, loading, error, createCourse, updateCourse, deleteCourse }
}
