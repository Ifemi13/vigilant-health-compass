import { useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { Button, ErrorBanner, FullPageSpinner } from '../components/ui'
import { ApiError, errorMessage } from '../lib/api'
import { formatPrice, SERVICE_LABELS, useClinic, type ServicePrice, type ServiceType } from '../lib/clinics'

export default function ClinicDetail() {
  const { id = '' } = useParams()
  const location = useLocation()
  // The results page passes its URL so "back" returns to the same search.
  const backTo = (location.state as { backTo?: string } | null)?.backTo ?? '/affordability'
  const clinic = useClinic(id)

  const backLink = (
    <Link to={backTo} className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
      ← Back to results
    </Link>
  )

  if (clinic.isPending) return <FullPageSpinner />
  if (clinic.isError) {
    const notFound = clinic.error instanceof ApiError && clinic.error.status === 404
    return (
      <>
        {backLink}
        <div className="mt-6">
          <ErrorBanner message={notFound ? 'Clinic not found.' : errorMessage(clinic.error)} />
        </div>
      </>
    )
  }

  const c = clinic.data
  return (
    <>
      {backLink}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#172220]">
        <h1 className="text-2xl font-semibold">{c.name}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {c.addressLine}, {c.city}, {c.state} {c.postalCode}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {c.phone && (
            <a href={`tel:${c.phone}`} className="text-accent hover:underline dark:text-teal-300">
              {c.phone}
            </a>
          )}
          {c.email && (
            <a href={`mailto:${c.email}`} className="text-accent hover:underline dark:text-teal-300">
              {c.email}
            </a>
          )}
          {c.website && (
            <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline dark:text-teal-300">
              Website ↗
            </a>
          )}
        </div>
      </section>

      <PriceEstimator services={c.services} />
    </>
  )
}

function PriceEstimator({ services }: { services: ServicePrice[] }) {
  const [selected, setSelected] = useState<Set<ServiceType>>(new Set())
  const [estimate, setEstimate] = useState<ServicePrice[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggle = (service: ServiceType) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(service)) next.delete(service)
      else next.add(service)
      return next
    })
    // The shown price must always match the selection, so a changed selection needs Enter again.
    setEstimate(null)
    setError(null)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (selected.size === 0) {
      setError('Select at least one service.')
      return
    }
    setEstimate(services.filter((s) => selected.has(s.service)))
  }

  const clear = () => {
    setSelected(new Set())
    setEstimate(null)
    setError(null)
  }

  const total = estimate?.reduce((sum, s) => sum + s.price, 0) ?? 0

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#172220]">
      <h2 className="text-lg font-semibold">Get a price</h2>
      {services.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">This clinic hasn't listed any prices yet.</p>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select the services you need, then press Enter.</p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Services">
            {services.map(({ service }) => {
              const isSelected = selected.has(service)
              return (
                <button
                  key={service}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggle(service)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-accent/30 focus:outline-none ${
                    isSelected
                      ? 'border-accent bg-accent text-white'
                      : 'border-slate-300 bg-white hover:border-accent hover:text-accent dark:border-slate-700 dark:bg-transparent dark:hover:text-teal-300'
                  }`}
                >
                  {isSelected && <span aria-hidden>✓ </span>}
                  {SERVICE_LABELS[service]}
                </button>
              )
            })}
          </div>
          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={clear} disabled={selected.size === 0}>
              Clear
            </Button>
            <Button type="submit">Enter</Button>
          </div>
        </form>
      )}

      {estimate && (
        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800" aria-live="polite">
          <ul className="space-y-2 text-sm">
            {estimate.map((s) => (
              <li key={s.service} className="flex justify-between gap-4">
                <span>{SERVICE_LABELS[s.service]}</span>
                <span>{formatPrice(s.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between gap-4 rounded-xl bg-accent-soft px-4 py-3 dark:bg-accent/20">
            <span className="font-medium">Estimated total</span>
            <span className="text-2xl font-semibold text-accent-strong dark:text-teal-200">{formatPrice(total)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Typical prices listed by the clinic. Confirm with them before booking.
          </p>
        </div>
      )}
    </section>
  )
}
