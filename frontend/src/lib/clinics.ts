import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiFetch } from './api'

/** Display labels, in display order (matches the backend's ServiceType). */
export const SERVICE_LABELS = {
  EXAM: 'Exam / checkup',
  CONSULT: 'Consult',
  VACCINATION: 'Vaccination',
  BLOOD_WORK: 'Blood work',
  XRAY: 'X-ray',
  ULTRASOUND: 'Ultrasound',
  CT_SCAN: 'CT scan',
  MRI: 'MRI',
  DENTAL: 'Dental cleaning',
  SPAY_NEUTER: 'Spay / neuter',
  EMERGENCY: 'Emergency visit',
} as const

export type ServiceType = keyof typeof SERVICE_LABELS

export const SERVICE_TYPES = Object.keys(SERVICE_LABELS) as ServiceType[]

export interface ServicePrice {
  service: ServiceType
  price: number
}

export interface ClinicDetail {
  id: string
  name: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  phone: string | null
  email: string | null
  website: string | null
  services: ServicePrice[]
}

export interface ClinicResult {
  id: string
  name: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  phone: string | null
  email: string | null
  website: string | null
  /** Price of the searched service. */
  price: number
  services: ServicePrice[]
}

export interface ClinicSearch {
  service: ServiceType
  minCost: string
  maxCost: string
  location: string
}

/** Runs GET /api/clinics for the given filters; pass null to skip (no search yet). */
export function useClinicSearch(search: ClinicSearch | null) {
  return useQuery({
    queryKey: ['clinics', search],
    enabled: search !== null,
    placeholderData: keepPreviousData,
    queryFn: () => {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(search!)) {
        if (value) params.set(key, value)
      }
      return apiFetch<ClinicResult[]>(`/api/clinics?${params}`)
    },
  })
}

export function useClinic(id: string) {
  return useQuery({
    queryKey: ['clinic', id],
    queryFn: () => apiFetch<ClinicDetail>(`/api/clinics/${encodeURIComponent(id)}`),
  })
}

/** e.g. 65 → "$65", 49.5 → "$49.50", 2600 → "$2,600". */
export function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
  })
}
