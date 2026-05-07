import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Roaster, Coffee } from '@/db/schema'
import type { RoasterInsert, RoasterPatch, CoffeeInsert, CoffeePatch } from '@/lib/validation'

export type RoasterWithStats = Roaster & { coffeeCount: number; avgRating: string | null }
export type CoffeeWithRoaster = Coffee & { roasterName: string | null }

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(err.error || 'Error de red')
  }
  return res.json()
}

// ── Roasters ─────────────────────────────────────────────────────────────────

export function useRoasters() {
  return useQuery({
    queryKey: ['roasters'],
    queryFn: () => apiFetch<RoasterWithStats[]>('/api/roasters'),
  })
}

export function useRoaster(id: string) {
  return useQuery({
    queryKey: ['roasters', id],
    queryFn: () => apiFetch<Roaster>(`/api/roasters/${id}`),
    enabled: !!id,
  })
}

export function useCreateRoaster() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RoasterInsert) =>
      apiFetch<Roaster>('/api/roasters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roasters'] }),
  })
}

export function useUpdateRoaster(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RoasterPatch) =>
      apiFetch<Roaster>(`/api/roasters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roasters'] })
      qc.invalidateQueries({ queryKey: ['roasters', id] })
    },
  })
}

export function useDeleteRoaster() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/roasters/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roasters'] }),
  })
}

// ── Coffees ───────────────────────────────────────────────────────────────────

export function useCoffees(options?: { roasterId?: string }) {
  const params = options?.roasterId ? `?roasterId=${options.roasterId}` : ''
  return useQuery({
    queryKey: ['coffees', { roasterId: options?.roasterId }],
    queryFn: () => apiFetch<CoffeeWithRoaster[]>(`/api/coffees${params}`),
  })
}

export function useCoffee(id: string) {
  return useQuery({
    queryKey: ['coffees', id],
    queryFn: () => apiFetch<CoffeeWithRoaster>(`/api/coffees/${id}`),
    enabled: !!id,
  })
}

export function useCreateCoffee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CoffeeInsert) =>
      apiFetch<Coffee>('/api/coffees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['coffees'] })
      qc.invalidateQueries({ queryKey: ['roasters'] })
      qc.invalidateQueries({ queryKey: ['roasters', vars.roasterId] })
    },
  })
}

export function useUpdateCoffee(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CoffeePatch) =>
      apiFetch<Coffee>(`/api/coffees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coffees'] })
      qc.invalidateQueries({ queryKey: ['coffees', id] })
      qc.invalidateQueries({ queryKey: ['roasters'] })
    },
  })
}

export function useDeleteCoffee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/coffees/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coffees'] })
      qc.invalidateQueries({ queryKey: ['roasters'] })
    },
  })
}

export function useCoffeeFilterOptions() {
  const { data: coffees } = useCoffees()
  return useMemo(() => {
    if (!coffees) return { origins: [], processes: [] }
    const origins = [...new Set(coffees.map((c) => c.origin).filter(Boolean))] as string[]
    const processes = [...new Set(coffees.map((c) => c.process).filter(Boolean))] as string[]
    return { origins, processes }
  }, [coffees])
}
