import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './api'
import type { HealthProfileSex } from './healthProfile'

export type AuthorRole = 'PATIENT' | 'PHYSICIAN'

export const ROLE_LABELS: Record<AuthorRole, string> = { PATIENT: 'Patient', PHYSICIAN: 'Physician' }

/** A Wisconsin hospital from CMS Hospital General Information. */
export interface Hospital {
  id: string
  name: string
  address: string
  city: string
  state: string
  postalCode: string | null
  county: string | null
  phone: string | null
  hospitalType: string
  ownership: string | null
  emergencyServices: boolean
  /** CMS overall star rating (1–5); null when CMS has none. */
  starRating: number | null
}

const HOSPITAL_TYPE_LABELS: Record<string, string> = {
  'Acute Care Hospitals': 'Acute care hospital',
  'Critical Access Hospitals': 'Critical access hospital',
  Psychiatric: 'Psychiatric hospital',
  Childrens: "Children's hospital",
  'Acute Care - Veterans Administration': 'VA medical center',
}

export function hospitalTypeLabel(type: string): string {
  return HOSPITAL_TYPE_LABELS[type] ?? type
}

/** A forum comment. The author only appears as an anonymous nickname and role. */
export interface HospitalComment {
  id: string
  authorName: string
  authorRole: AuthorRole
  /** From the author's Health Profile, when they've filled one in. */
  authorAge: number | null
  authorSex: HealthProfileSex | null
  body: string
  createdAt: string
  /** When the author last edited it, or null. */
  editedAt: string | null
  /** Whether the signed-in user wrote it (and so may edit or delete it). */
  mine: boolean
}

export const MAX_COMMENT_LENGTH = 2000

/** A hospital's forum for one Awareness topic. */
function commentsUrl(topicId: string, hospitalId: string) {
  return `/api/topics/${encodeURIComponent(topicId)}/hospitals/${encodeURIComponent(hospitalId)}/comments`
}

/** Hospitals for a topic, optionally near a city / "City, WI" / ZIP. */
export function useTopicHospitals(topicId: string, location: string) {
  return useQuery({
    queryKey: ['topic-hospitals', topicId, location],
    queryFn: () => {
      const params = new URLSearchParams()
      if (location) params.set('location', location)
      return apiFetch<Hospital[]>(`/api/topics/${encodeURIComponent(topicId)}/hospitals?${params}`)
    },
    placeholderData: keepPreviousData,
  })
}

export function useHospital(id: string) {
  return useQuery({
    queryKey: ['hospital', id],
    queryFn: () => apiFetch<Hospital>(`/api/hospitals/${encodeURIComponent(id)}`),
  })
}

export function useHospitalComments(topicId: string, hospitalId: string) {
  return useQuery({
    queryKey: ['hospital-comments', topicId, hospitalId],
    queryFn: () => apiFetch<HospitalComment[]>(commentsUrl(topicId, hospitalId)),
  })
}

function useInvalidateComments(topicId: string, hospitalId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['hospital-comments', topicId, hospitalId] })
}

export function usePostComment(topicId: string, hospitalId: string) {
  const invalidate = useInvalidateComments(topicId, hospitalId)
  return useMutation({
    mutationFn: (body: string) =>
      apiFetch<HospitalComment>(commentsUrl(topicId, hospitalId), { method: 'POST', body: JSON.stringify({ body }) }),
    onSuccess: invalidate,
  })
}

export function useEditComment(topicId: string, hospitalId: string) {
  const invalidate = useInvalidateComments(topicId, hospitalId)
  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
      apiFetch<HospitalComment>(`${commentsUrl(topicId, hospitalId)}/${encodeURIComponent(commentId)}`, {
        method: 'PUT',
        body: JSON.stringify({ body }),
      }),
    onSuccess: invalidate,
  })
}

export function useDeleteComment(topicId: string, hospitalId: string) {
  const invalidate = useInvalidateComments(topicId, hospitalId)
  return useMutation({
    mutationFn: (commentId: string) =>
      apiFetch<void>(`${commentsUrl(topicId, hospitalId)}/${encodeURIComponent(commentId)}`, { method: 'DELETE' }),
    onSuccess: invalidate,
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
