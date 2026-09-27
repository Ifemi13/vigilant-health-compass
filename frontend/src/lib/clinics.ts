import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiFetch } from './api'

export type Species = 'dog' | 'cat'

export const SPECIES_LABELS: Record<Species, string> = { dog: 'Dog', cat: 'Cat' }

/** A standard procedure for one species, with reference prices (from wi_vet_costs.json "averages"). */
export interface Procedure {
  id: string
  species: Species
  category: string
  name: string
  /** Best available average (see avgBasis); null when no data was found. */
  avgPrice: number | null
  avgBasis: string
  /** U.S. (national) average, when known. */
  usAvg: number | null
  clinicCount: number
}

/** A price a clinic posted for one service for one species. */
export interface ClinicPrice {
  species: Species
  category: string
  service: string
  price: number
  /** Equal to price unless the clinic posted a range. */
  priceHigh: number
  procedureId: string | null
  note: string | null
  priceAsOf: string | null
}

export interface Clinic {
  id: string
  organization: string
  name: string
  providerType: string
  address: string | null
  city: string
  state: string
  postalCode: string | null
  eligibility: string | null
  sourceUrl: string | null
  /** Search results: only the matching prices, cheapest first. Single clinic: every price. */
  prices: ClinicPrice[]
}

export interface ClinicSearch {
  species: Species
  procedure: string
  minCost: string
  maxCost: string
  location: string
}

/** Display order for procedure categories. */
const CATEGORY_ORDER = ['exam', 'vaccine', 'lab test', 'imaging', 'dental', 'spay/neuter', 'microchip', 'medication', 'other']

export function compareCategories(a: string, b: string): number {
  const rank = (c: string) => (CATEGORY_ORDER.indexOf(c) + CATEGORY_ORDER.length + 1) % (CATEGORY_ORDER.length + 1)
  return rank(a) - rank(b) || a.localeCompare(b)
}

export function categoryLabel(category: string): string {
  const label = category.replace('/', ' / ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * The national (U.S.) average for a procedure. A few procedures only have a Wisconsin figure, which is used
 * (and labeled) instead; null when there's no figure at all.
 */
export function averagePrice(procedure: Procedure): { price: number; label: string } | null {
  if (procedure.usAvg != null) return { price: procedure.usAvg, label: 'U.S. average' }
  if (procedure.avgPrice != null) return { price: procedure.avgPrice, label: 'Wisconsin average' }
  return null
}

export function useProcedures() {
  return useQuery({
    queryKey: ['procedures'],
    queryFn: () => apiFetch<Procedure[]>('/api/procedures'),
    staleTime: Infinity,
  })
}

/** Runs GET /api/clinics for the given filters; pass null to skip (no search yet). */
export function useClinicSearch(search: ClinicSearch | null) {
  return useQuery({
    queryKey: ['clinics', search],
    enabled: search !== null,
    placeholderData: keepPreviousData,
    queryFn: () => {
      const { procedure, minCost, maxCost, location } = search!
      const params = new URLSearchParams({ procedure })
      if (minCost) params.set('minCost', minCost)
      if (maxCost) params.set('maxCost', maxCost)
      if (location) params.set('location', location)
      return apiFetch<Clinic[]>(`/api/clinics?${params}`)
    },
  })
}

export function useClinic(id: string) {
  return useQuery({
    queryKey: ['clinic', id],
    queryFn: () => apiFetch<Clinic>(`/api/clinics/${encodeURIComponent(id)}`),
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

/** "$300" or "$300–$350"; $0 shows as "Free". */
export function formatPriceRange(low: number, high: number): string {
  if (high === 0) return 'Free'
  return low === high ? formatPrice(low) : `${formatPrice(low)}–${formatPrice(high)}`
}

/** "https://www.wihumane.org/veterinary/..." → "wihumane.org" */
export function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
