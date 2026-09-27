import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiFetch } from './api'

export type CareKind = 'HOSPITAL' | 'CLINIC'

/** A hospital (CMS) or community health center (HRSA) near the searched location. */
export interface NearbyPlace {
  kind: CareKind
  id: string
  name: string
  /** Hospital type or health center type. */
  category: string
  /** The health center organization running a clinic; null for hospitals. */
  organization: string | null
  address: string
  city: string
  state: string
  postalCode: string | null
  phone: string | null
  website: string | null
  distanceMiles: number
  /** True when the location is a ZIP or city center rather than the building (hospitals). */
  locationApproximate: boolean
  starRating: number | null
  emergencyServices: boolean | null
}

export interface NearMeResult {
  origin: { label: string; latitude: number; longitude: number }
  radiusMiles: number
  results: NearbyPlace[]
}

export interface NearMeSearch {
  /** City, "City, WI" or ZIP; ignored when lat/lng are set. */
  location: string
  lat: number | null
  lng: number | null
  radiusMiles: number
  type: CareKind | null
}

export const RADIUS_OPTIONS = [5, 10, 25, 50, 100]

export function useNearMe(search: NearMeSearch | null) {
  return useQuery({
    queryKey: ['care-near-me', search],
    enabled: search !== null,
    placeholderData: keepPreviousData,
    retry: false,
    queryFn: () => {
      const { location, lat, lng, radiusMiles, type } = search!
      const params = new URLSearchParams({ radiusMiles: String(radiusMiles) })
      if (lat != null && lng != null) {
        params.set('lat', String(lat))
        params.set('lng', String(lng))
      } else {
        params.set('location', location)
      }
      if (type) params.set('type', type)
      return apiFetch<NearMeResult>(`/api/care-near-me?${params}`)
    },
  })
}

/** Google Maps directions to a place's street address. */
export function directionsUrl(place: NearbyPlace): string {
  const destination = `${place.name}, ${place.address}, ${place.city}, ${place.state} ${place.postalCode ?? ''}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.trim())}`
}
