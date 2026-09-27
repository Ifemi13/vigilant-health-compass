import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import StarRating from '../../components/StarRating'
import { Button, ErrorBanner, Input, Select } from '../../components/ui'
import { errorMessage } from '../../lib/api'
import { hospitalTypeLabel } from '../../lib/community'
import { directionsUrl, RADIUS_OPTIONS, useNearMe, type CareKind, type NearbyPlace, type NearMeSearch } from '../../lib/nearMe'

const TYPE_FILTERS: { value: CareKind | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'HOSPITAL', label: 'Hospitals' },
  { value: 'CLINIC', label: 'Clinics' },
]

/** The search lives in the URL so refresh and back/forward keep it. */
function searchFromUrl(params: URLSearchParams): NearMeSearch | null {
  const lat = params.get('lat')
  const lng = params.get('lng')
  const location = params.get('location') ?? ''
  if (!location && !(lat && lng)) return null
  const radius = Number(params.get('radius'))
  const type = params.get('type')
  return {
    location,
    lat: lat && lng ? Number(lat) : null,
    lng: lat && lng ? Number(lng) : null,
    radiusMiles: RADIUS_OPTIONS.includes(radius) ? radius : 25,
    type: type === 'HOSPITAL' || type === 'CLINIC' ? type : null,
  }
}

export default function HealthcareNearMe() {
  const [params, setParams] = useSearchParams()
  const search = searchFromUrl(params)
  const radiusMiles = search?.radiusMiles ?? (Number(params.get('radius')) || 25)
  const type = search?.type ?? null
  const [draft, setDraft] = useState(search?.lat == null ? (search?.location ?? '') : '')
  const [geoError, setGeoError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next)
  }

  const searchTyped = (event: FormEvent) => {
    event.preventDefault()
    setGeoError(null)
    if (!draft.trim()) return
    update({ location: draft.trim(), lat: null, lng: null })
  }

  const useMyLocation = () => {
    setGeoError(null)
    if (!navigator.geolocation) {
      setGeoError("Your browser can't share your location. Type a city or ZIP code instead.")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        setDraft('')
        update({
          lat: position.coords.latitude.toFixed(4),
          lng: position.coords.longitude.toFixed(4),
          location: null,
        })
      },
      () => {
        setLocating(false)
        setGeoError("We couldn't get your location. Check your browser's permission, or type a city or ZIP code.")
      },
      { timeout: 10_000 },
    )
  }

  return (
    <>
      <Link to="/general" className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
        ← Back to General
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">📍 Healthcare Near Me</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Find hospitals and community health clinics in Wisconsin.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#172220]">
        <form onSubmit={searchTyped} role="search" className="flex flex-wrap gap-2">
          <label htmlFor="near-me-location" className="sr-only">
            City or ZIP code
          </label>
          <Input
            id="near-me-location"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="City or ZIP code, e.g. Madison or 53703"
            maxLength={100}
            className="min-w-0 flex-1 basis-60"
          />
          <Button type="submit">Search</Button>
          <Button type="button" variant="secondary" onClick={useMyLocation} disabled={locating}>
            {locating ? 'Locating…' : '📍 Use my location'}
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex items-center gap-2 text-sm">
            Within
            <Select value={radiusMiles} onChange={(e) => update({ radius: e.target.value })} className="w-auto">
              {RADIUS_OPTIONS.map((miles) => (
                <option key={miles} value={miles}>
                  {miles} miles
                </option>
              ))}
            </Select>
          </label>
          <div role="radiogroup" aria-label="Show" className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                role="radio"
                aria-checked={type === filter.value}
                onClick={() => update({ type: filter.value })}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  type === filter.value ? 'bg-accent text-white' : 'text-slate-600 hover:text-accent dark:text-slate-300 dark:hover:text-teal-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        {geoError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{geoError}</p>}
      </div>

      {search && <Results search={search} />}
    </>
  )
}

function Results({ search }: { search: NearMeSearch }) {
  const nearMe = useNearMe(search)

  if (nearMe.isPending) {
    return (
      <div className="mt-8 flex justify-center" aria-label="Loading">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
      </div>
    )
  }
  if (nearMe.isError) {
    return (
      <div className="mt-6">
        <ErrorBanner message={errorMessage(nearMe.error)} />
      </div>
    )
  }

  const { origin, radiusMiles, results } = nearMe.data
  return (
    <section className="mt-8" aria-live="polite" aria-busy={nearMe.isFetching}>
      <h2 className="text-lg font-semibold">
        {results.length === 100 ? '100+' : results.length} place{results.length === 1 ? '' : 's'} within {radiusMiles} miles of{' '}
        {origin.label}
      </h2>
      {results.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nothing found within {radiusMiles} miles. Try a larger distance.
        </p>
      ) : (
        <ul className={`mt-4 space-y-3 transition-opacity ${nearMe.isFetching ? 'opacity-60' : ''}`}>
          {results.map((place) => (
            <PlaceCard key={`${place.kind}-${place.id}`} place={place} />
          ))}
        </ul>
      )}
    </section>
  )
}

function PlaceCard({ place }: { place: NearbyPlace }) {
  const isHospital = place.kind === 'HOSPITAL'
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#172220]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold">{place.name}</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {isHospital ? hospitalTypeLabel(place.category) : 'Community health center'}
            {!isHospital && place.organization && place.organization !== place.name && ` · ${place.organization}`}
            {isHospital && place.emergencyServices && ' · Emergency department'}
          </p>
        </div>
        <span
          className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium whitespace-nowrap text-accent-strong dark:bg-accent/20 dark:text-teal-200"
          title={place.locationApproximate ? 'Approximate: measured to the center of its ZIP code or city' : undefined}
        >
          {place.locationApproximate ? '≈ ' : ''}
          {place.distanceMiles} mi
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
        {place.address}, {place.city}, {place.state} {place.postalCode}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {isHospital && <StarRating rating={place.starRating} />}
        {place.phone && (
          <a href={`tel:${place.phone}`} className="text-accent hover:underline dark:text-teal-300">
            {place.phone}
          </a>
        )}
        {place.website && (
          <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline dark:text-teal-300">
            Website ↗
          </a>
        )}
        <a href={directionsUrl(place)} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline dark:text-teal-300">
          Directions ↗
        </a>
      </div>
    </li>
  )
}
