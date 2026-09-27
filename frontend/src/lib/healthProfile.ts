import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, apiFetch } from './api'

export type HealthProfileSex = 'FEMALE' | 'MALE' | 'INTERSEX' | 'PREFER_NOT_TO_SAY'

export const SEX_LABELS: Record<HealthProfileSex, string> = {
  FEMALE: 'Female',
  MALE: 'Male',
  INTERSEX: 'Intersex',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
}

export interface HealthProfileInput {
  age: number
  sex: HealthProfileSex
  currentConditions: string
  vaccinationHistory: string | null
  familyHistory: string | null
}

export interface HealthProfile extends HealthProfileInput {
  updatedAt: string
}

/** The signed-in user's Health Profile; `null` until they've saved one. */
export function useHealthProfile() {
  return useQuery({
    queryKey: ['health-profile'],
    queryFn: async () => {
      try {
        return await apiFetch<HealthProfile>('/api/health-profile')
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null
        throw e
      }
    },
  })
}

export function useSaveHealthProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (profile: HealthProfileInput) =>
      apiFetch<HealthProfile>('/api/health-profile', { method: 'PUT', body: JSON.stringify(profile) }),
    onSuccess: (saved) => {
      queryClient.setQueryData(['health-profile'], saved)
      // Age and sex appear on the user's forum posts.
      return queryClient.invalidateQueries({ queryKey: ['hospital-comments'] })
    },
  })
}
