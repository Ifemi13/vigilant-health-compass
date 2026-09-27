import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './api'

export type AuthorRole = 'PATIENT' | 'PHYSICIAN'

export const ROLE_LABELS: Record<AuthorRole, string> = { PATIENT: 'Patient', PHYSICIAN: 'Physician' }

export interface Hospital {
  id: string
  topicId: string
  name: string
  specialty: string
  address: string
  city: string
  state: string
  postalCode: string | null
  phone: string | null
  website: string | null
  description: string | null
}

/** A forum comment. The author only appears as an anonymous nickname and role. */
export interface HospitalComment {
  id: string
  authorName: string
  authorRole: AuthorRole
  body: string
  createdAt: string
  /** Whether the signed-in user wrote it. */
  mine: boolean
}

export const MAX_COMMENT_LENGTH = 2000

export function useTopicHospitals(topicId: string) {
  return useQuery({
    queryKey: ['topic-hospitals', topicId],
    queryFn: () => apiFetch<Hospital[]>(`/api/topics/${encodeURIComponent(topicId)}/hospitals`),
  })
}

export function useHospital(id: string) {
  return useQuery({
    queryKey: ['hospital', id],
    queryFn: () => apiFetch<Hospital>(`/api/hospitals/${encodeURIComponent(id)}`),
  })
}

export function useHospitalComments(hospitalId: string) {
  return useQuery({
    queryKey: ['hospital-comments', hospitalId],
    queryFn: () => apiFetch<HospitalComment[]>(`/api/hospitals/${encodeURIComponent(hospitalId)}/comments`),
  })
}

export function usePostComment(hospitalId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: string) =>
      apiFetch<HospitalComment>(`/api/hospitals/${encodeURIComponent(hospitalId)}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hospital-comments', hospitalId] }),
  })
}

/** How the signed-in user appears in the forum. */
export function useCommunityMe() {
  return useQuery({
    queryKey: ['community-me'],
    queryFn: () => apiFetch<{ nickname: string; role: AuthorRole }>('/api/community/me'),
    staleTime: Infinity,
  })
}

/** "just now", "5 minutes ago", "3 days ago"… */
export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}
