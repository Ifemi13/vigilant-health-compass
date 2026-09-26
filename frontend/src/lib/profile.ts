import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { ApiError, apiFetch } from './api'

export type Role = 'GUARDIAN' | 'VET'
export type Sex = 'MALE' | 'FEMALE' | 'UNKNOWN'

export interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  sex: Sex
  neutered: boolean
  birthDate: string | null
  weightKg: number | null
  healthHistory: string | null
  vaccinationHistory: string | null
  allergies: string | null
}

export interface Me {
  id: string
  role: Role
  email: string
  guardian: { phone: string } | null
  vet: { clinicName: string; address: string; email: string } | null
  pets: Pet[]
}

export type PetInput = Omit<Pet, 'id'>

export type OnboardingRequest =
  | { role: 'GUARDIAN'; phone: string; pet: PetInput }
  | { role: 'VET'; clinicName: string; address: string; email: string }

/** The signed-in user's profile; `null` means they haven't finished onboarding. */
export function useMe() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: ['me', userId],
    enabled: !!userId,
    queryFn: async () => {
      try {
        return await apiFetch<Me>('/api/me')
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null
        throw e
      }
    },
  })
}

export function useOnboard() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: (body: OnboardingRequest) =>
      apiFetch<Me>('/api/onboarding', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: (me) => queryClient.setQueryData(['me', session?.user.id], me),
  })
}
