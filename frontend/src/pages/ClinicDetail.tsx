import { useState, type FormEvent } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import SpeciesToggle from '../components/SpeciesToggle'
import { Button, ErrorBanner, FullPageSpinner } from '../components/ui'
import { ApiError, errorMessage } from '../lib/api'
import {
  averagePrice,
  categoryLabel,
  compareCategories,
  formatPriceRange,
  SPECIES_LABELS,
  sourceHost,
  useClinic,
  useProcedures,
  type Clinic,
  type Procedure,
  type Species,
} from '../lib/clinics'

/** A selectable service: either a price the clinic posted, or a standard procedure at its average price. */
interface PriceTag {
  key: string
  label: string
  category: string
  low: number
  high: number
  source: 'clinic' | 'average'
  /** e.g. "U.S. average" for average tags. */
  averageLabel?: string
  note: string | null
}

export default function ClinicDetail() {
  const { id = '' } = useParams()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const species: Species = searchParams.get('species') === 'cat' ? 'cat' : 'dog'
  // The results page passes its URL so "back" returns to the same search.
  const backTo = (location.state as { backTo?: string } | null)?.backTo ?? '/affordability'
  const clinic = useClinic(id)
  const procedures = useProcedures()

  const backLink = (
    <Link to={backTo} className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
      ← Back to results
    </Link>
  )

  if (clinic.isPending || procedures.isPending) return <FullPageSpinner />
  if (clinic.isError || procedures.isError) {
    const error = clinic.error ?? procedures.error
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <>
        {backLink}
        <div className="mt-6">
          <ErrorBanner message={notFound ? 'Clinic not found.' : errorMessage(error)} />
        </div>
      </>
    )
  }

  const c = clinic.data
  return (
    <>
      {backLink}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#172220]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold">{c.name}</h1>
          <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 capitalize dark:border-slate-700 dark:text-slate-300">
            {c.providerType}
          </span>
        </div>
        {c.organization !== c.name && <p className="mt-1 text-sm">{c.organization}</p>}
        <p className="mt-1 text-slate-500 dark:text-slate-400">{c.address ?? `${c.city}, ${c.state}`}</p>
        {c.eligibility && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">ℹ️ {c.eligibility}</p>}
        {c.sourceUrl && (
          <a
            href={c.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-accent hover:underline dark:text-teal-300"
          >
            Prices from {sourceHost(c.sourceUrl)} ↗
          </a>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#172220]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Get a price</h2>
          <SpeciesToggle
            value={species}
            onChange={(next) => setSearchParams({ species: next }, { replace: true, state: location.state })}
          />
        </div>
        {/* Keyed on species so switching Dog/Cat starts a fresh selection. */}
        <PriceEstimator key={species} tags={buildTags(c, procedures.data, species)} species={species} />
      </section>
    </>
  )
}

/** The clinic's own prices for this species, plus every other standard procedure at its average price. */
function buildTags(clinic: Clinic, procedures: Procedure[], species: Species): PriceTag[] {
  const clinicPrices = clinic.prices.filter((p) => p.species === species)
  const covered = new Set(clinicPrices.map((p) => p.procedureId))

  const clinicTags: PriceTag[] = clinicPrices.map((p) => ({
    key: `clinic:${p.service}`,
    label: p.service,
    category: p.category,
    low: p.price,
    high: p.priceHigh,
    source: 'clinic',
    note: p.note,
  }))
  const averageTags: PriceTag[] = procedures
    .filter((p) => p.species === species && !covered.has(p.id))
    .flatMap((p) => {
      const average = averagePrice(p)
      if (!average) return []
      return [{
        key: `average:${p.id}`,
        label: p.name,
        category: p.category,
        low: average.price,
        high: average.price,
        source: 'average' as const,
        averageLabel: average.label,
        note: null,
      }]
    })

  return [...clinicTags, ...averageTags].sort(
    (a, b) =>
      compareCategories(a.category, b.category) ||
      (a.source === b.source ? 0 : a.source === 'clinic' ? -1 : 1) ||
      a.label.localeCompare(b.label),
  )
}

function PriceEstimator({ tags, species }: { tags: PriceTag[]; species: Species }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [estimate, setEstimate] = useState<PriceTag[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const byCategory = new Map<string, PriceTag[]>()
  for (const tag of tags) byCategory.set(tag.category, [...(byCategory.get(tag.category) ?? []), tag])
  const hasClinicPrices = tags.some((t) => t.source === 'clinic')

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
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
    setEstimate(tags.filter((t) => selected.has(t.key)))
  }

  const clear = () => {
    setSelected(new Set())
    setEstimate(null)
    setError(null)
  }

  const totalLow = estimate?.reduce((sum, t) => sum + t.low, 0) ?? 0
  const totalHigh = estimate?.reduce((sum, t) => sum + t.high, 0) ?? 0
  const usesAverages = estimate?.some((t) => t.source === 'average') ?? false

  return (
    <form onSubmit={onSubmit} noValidate>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select the services you need, then press Enter.</p>
      {!hasClinicPrices && (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
          This clinic hasn't posted any {SPECIES_LABELS[species].toLowerCase()} prices, so every option below uses an
          average price.
        </p>
      )}
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span>
          <span className="mr-1 inline-block h-3 w-5 rounded-full border border-slate-400 align-middle" /> Clinic's posted price
        </span>
      </p>

      <div className="mt-4 space-y-4">
        {[...byCategory].map(([category, categoryTags]) => (
          <fieldset key={category}>
            <legend className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {categoryLabel(category)}
            </legend>
            <div className="flex flex-wrap gap-2">
              {categoryTags.map((tag) => {
                const isSelected = selected.has(tag.key)
                return (
                  <button
                    key={tag.key}
                    type="button"
                    aria-pressed={isSelected}
                    title={tag.source === 'average' ? `${tag.averageLabel} (not posted by this clinic)` : undefined}
                    onClick={() => toggle(tag.key)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors focus:ring-2 focus:ring-accent/30 focus:outline-none ${
                      isSelected
                        ? 'border-accent bg-accent text-white'
                        : 'border-slate-300 bg-white hover:border-accent hover:text-accent dark:border-slate-700 dark:bg-transparent dark:hover:text-teal-300'
                    }`}
                  >
                    {isSelected && <span aria-hidden>✓ </span>}
                    {tag.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={clear} disabled={selected.size === 0}>
          Clear
        </Button>
        <Button type="submit">Enter</Button>
      </div>

      {estimate && (
        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800" aria-live="polite">
          <ul className="space-y-2.5 text-sm">
            {estimate.map((t) => (
              <li key={t.key} className="flex justify-between gap-4">
                <span>
                  {t.label}
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {t.source === 'average' ? `${t.averageLabel}, not posted by this clinic` : (t.note ?? "Clinic's posted price")}
                  </span>
                </span>
                <span className="whitespace-nowrap">{formatPriceRange(t.low, t.high)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between gap-4 rounded-xl bg-accent-soft px-4 py-3 dark:bg-accent/20">
            <span className="font-medium">Estimated total</span>
            <span className="text-2xl font-semibold text-accent-strong dark:text-teal-200">
              {formatPriceRange(totalLow, totalHigh)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {usesAverages && 'Averages are typical prices, not what this clinic charges. '}
            Prices can change. Confirm with the clinic before booking.
          </p>
        </div>
      )}
    </form>
  )
}
