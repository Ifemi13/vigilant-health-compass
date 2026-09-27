import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useSearchParams } from 'react-router'
import { z } from 'zod'
import SpeciesToggle from '../components/SpeciesToggle'
import { Button, ErrorBanner, Field, Input, Select } from '../components/ui'
import { errorMessage } from '../lib/api'
import {
  categoryLabel,
  compareCategories,
  formatPriceRange,
  SPECIES_LABELS,
  sourceHost,
  useClinicSearch,
  useProcedures,
  type Clinic,
  type ClinicSearch,
  type Procedure,
  type Species,
} from '../lib/clinics'
import { useMe } from '../lib/profile'

const MAX_COST = 100_000

const cost = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) <= MAX_COST), 'Enter an amount like 50 or 49.99')

const schema = z
  .object({
    species: z.enum(['dog', 'cat']),
    procedure: z.string().min(1, 'Choose a procedure'),
    minCost: cost,
    maxCost: cost,
    location: z.string().trim().max(100),
  })
  .refine((v) => v.minCost === '' || v.maxCost === '' || Number(v.minCost) <= Number(v.maxCost), {
    path: ['maxCost'],
    message: 'Max must be at least the min',
  })

/** The search in the URL, or null before the first search. Filters live in the URL so they survive refresh. */
function searchFromUrl(params: URLSearchParams): ClinicSearch | null {
  const procedure = params.get('procedure')
  if (!procedure) return null
  return {
    species: params.get('species') === 'cat' ? 'cat' : 'dog',
    procedure,
    minCost: params.get('minCost') ?? '',
    maxCost: params.get('maxCost') ?? '',
    location: params.get('location') ?? '',
  }
}

export default function Affordability() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchFromUrl(searchParams)
  const procedures = useProcedures()
  const { data: me } = useMe()
  const petSpecies: Species = me?.pets[0]?.species.toLowerCase() === 'cat' ? 'cat' : 'dog'

  const onSearch = (filters: ClinicSearch) => {
    const next = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value) next.set(key, value)
    }
    setSearchParams(next)
  }

  return (
    <>
      <Link to="/pets" className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
        ← Back to Pets
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">💰 Affordability</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Compare prices posted by Wisconsin vet clinics, shelters and low-cost clinics.
      </p>

      {procedures.isPending ? (
        <div className="mt-10 flex justify-center" aria-label="Loading">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
        </div>
      ) : procedures.isError ? (
        <div className="mt-6">
          <ErrorBanner message={errorMessage(procedures.error)} />
        </div>
      ) : (
        // Keyed on the URL so back/forward navigation refills the form with that search.
        <FilterForm
          key={searchParams.toString()}
          initial={search ?? { species: petSpecies, procedure: '', minCost: '', maxCost: '', location: '' }}
          procedures={procedures.data}
          onSearch={onSearch}
          onClear={() => setSearchParams({})}
        />
      )}

      {search && <Results search={search} procedure={procedures.data?.find((p) => p.id === search.procedure)} />}
    </>
  )
}

function FilterForm({
  initial,
  procedures,
  onSearch,
  onClear,
}: {
  initial: ClinicSearch
  procedures: Procedure[]
  onSearch: (filters: ClinicSearch) => void
  onClear: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ClinicSearch>({ resolver: zodResolver(schema), defaultValues: initial })
  const species = useWatch({ control, name: 'species' })

  // Only procedures some clinic has posted a price for, grouped by category.
  const byCategory = new Map<string, Procedure[]>()
  for (const p of procedures
    .filter((p) => p.species === species && p.clinicCount > 0)
    .sort((a, b) => compareCategories(a.category, b.category) || a.name.localeCompare(b.name))) {
    byCategory.set(p.category, [...(byCategory.get(p.category) ?? []), p])
  }

  const changeSpecies = (next: Species) => {
    setValue('species', next)
    setValue('procedure', '') // procedures are per species
  }

  const clear = () => {
    reset({ species, procedure: '', minCost: '', maxCost: '', location: '' })
    onClear()
  }

  return (
    <form
      onSubmit={handleSubmit(onSearch)}
      noValidate
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#172220]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Pet</span>
          <SpeciesToggle value={species} onChange={changeSpecies} />
        </div>
        <div className="sm:col-span-2">
          <Field label="Procedure" error={errors.procedure?.message}>
            <Select {...register('procedure')}>
              <option value="">Choose…</option>
              {[...byCategory].map(([category, list]) => (
                <optgroup key={category} label={categoryLabel(category)}>
                  {list.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.clinicCount} clinic{p.clinicCount === 1 ? '' : 's'})
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </Field>
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1 block text-sm font-medium">Cost</legend>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min ($)" error={errors.minCost?.message}>
              <Input inputMode="decimal" placeholder="0" {...register('minCost')} />
            </Field>
            <Field label="Max ($)" error={errors.maxCost?.message}>
              <Input inputMode="decimal" placeholder="Any" {...register('maxCost')} />
            </Field>
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <Field label="Location" error={errors.location?.message} hint='City, "City, WI" or ZIP code'>
            <Input autoComplete="postal-code" placeholder="e.g. Madison or 53719" {...register('location')} />
          </Field>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={clear}>
          Clear
        </Button>
        <Button type="submit">Enter</Button>
      </div>
    </form>
  )
}

function Results({ search, procedure }: { search: ClinicSearch; procedure: Procedure | undefined }) {
  const clinics = useClinicSearch(search)

  return (
    <section className="mt-8" aria-live="polite" aria-busy={clinics.isFetching}>
      <h2 className="text-lg font-semibold">
        Results
        {clinics.data && (
          <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
            {clinics.data.length} clinic{clinics.data.length === 1 ? '' : 's'}
          </span>
        )}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{describe(search, procedure)}</p>

      {clinics.isPending ? (
        <div className="mt-6 flex justify-center" aria-label="Loading">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
        </div>
      ) : clinics.isError ? (
        <div className="mt-4">
          <ErrorBanner message={errorMessage(clinics.error)} />
        </div>
      ) : clinics.data.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No clinics match. Try widening the price range or clearing the location.
        </div>
      ) : (
        <ul className={`mt-4 space-y-3 transition-opacity ${clinics.isFetching ? 'opacity-60' : ''}`}>
          {clinics.data.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} species={search.species} />
          ))}
        </ul>
      )}
    </section>
  )
}

function ClinicCard({ clinic, species }: { clinic: Clinic; species: Species }) {
  const location = useLocation()

  return (
    // The name link stretches over the whole card (after:inset-0); the source link sits above it (z-10).
    <li className="relative rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-accent hover:shadow-md dark:border-slate-800 dark:bg-[#172220]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold">
            <Link
              to={`/affordability/clinics/${clinic.id}?species=${species}`}
              state={{ backTo: location.pathname + location.search }}
              className="after:absolute after:inset-0 after:rounded-2xl hover:text-accent focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-accent/40 dark:hover:text-teal-300"
            >
              {clinic.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {clinic.address ?? `${clinic.city}, ${clinic.state}`}
          </p>
        </div>
        <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 capitalize dark:border-slate-700 dark:text-slate-300">
          {clinic.providerType}
        </span>
      </div>

      <ul className="mt-3 space-y-1">
        {clinic.prices.map((price) => (
          <li key={price.service} className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
            <span>
              {price.service}
              {price.note && <span className="text-xs text-slate-500 dark:text-slate-400"> · {price.note}</span>}
            </span>
            <span className="font-semibold text-accent-strong dark:text-teal-200">{formatPriceRange(price.price, price.priceHigh)}</span>
          </li>
        ))}
      </ul>

      {clinic.eligibility && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">ℹ️ {clinic.eligibility}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {clinic.sourceUrl && (
          <a
            href={clinic.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 text-accent hover:underline dark:text-teal-300"
          >
            Source: {sourceHost(clinic.sourceUrl)} ↗
          </a>
        )}
        <span className="ml-auto font-medium text-accent dark:text-teal-300" aria-hidden>
          Get a price →
        </span>
      </div>
    </li>
  )
}

function describe({ species, minCost, maxCost, location }: ClinicSearch, procedure: Procedure | undefined): string {
  let cost = 'any price'
  if (minCost && maxCost) cost = `$${minCost} – $${maxCost}`
  else if (minCost) cost = `$${minCost} and up`
  else if (maxCost) cost = `up to $${maxCost}`
  const summary = `${procedure?.name ?? 'Procedure'} (${SPECIES_LABELS[species]}), ${cost}`
  return location ? `${summary} · near ${location}` : summary
}
