import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useSearchParams } from 'react-router'
import { z } from 'zod'
import { Button, ErrorBanner, Field, Input, Select } from '../components/ui'
import { errorMessage } from '../lib/api'
import {
  formatPrice,
  SERVICE_LABELS,
  SERVICE_TYPES,
  useClinicSearch,
  type ClinicResult,
  type ClinicSearch,
  type ServiceType,
} from '../lib/clinics'

const MAX_COST = 100_000

const cost = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) <= MAX_COST), 'Enter an amount like 50 or 49.99')

const schema = z
  .object({
    service: z.enum(SERVICE_TYPES as [ServiceType, ...ServiceType[]]),
    minCost: cost,
    maxCost: cost,
    location: z.string().trim().max(100),
  })
  .refine((v) => v.minCost === '' || v.maxCost === '' || Number(v.minCost) <= Number(v.maxCost), {
    path: ['maxCost'],
    message: 'Max must be at least the min',
  })

const EMPTY_FILTERS: ClinicSearch = { service: 'EXAM', minCost: '', maxCost: '', location: '' }

/** The search in the URL, or null before the first search. Filters live in the URL so they survive refresh. */
function searchFromUrl(params: URLSearchParams): ClinicSearch | null {
  const service = params.get('service')
  if (!service) return null
  return {
    service: SERVICE_TYPES.includes(service as ServiceType) ? (service as ServiceType) : 'EXAM',
    minCost: params.get('minCost') ?? '',
    maxCost: params.get('maxCost') ?? '',
    location: params.get('location') ?? '',
  }
}

export default function Affordability() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchFromUrl(searchParams)

  const onSearch = (filters: ClinicSearch) => {
    const next = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value) next.set(key, value)
    }
    setSearchParams(next)
  }

  return (
    <>
      <Link to="/" className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
        ← Back to home
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">💰 Affordability</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Find vet clinics that fit your budget near you.</p>

      {/* Keyed on the URL so back/forward navigation refills the form with that search. */}
      <FilterForm
        key={searchParams.toString()}
        initial={search ?? EMPTY_FILTERS}
        onSearch={onSearch}
        onClear={() => setSearchParams({})}
      />

      {search && <Results search={search} />}
    </>
  )
}

function FilterForm({
  initial,
  onSearch,
  onClear,
}: {
  initial: ClinicSearch
  onSearch: (filters: ClinicSearch) => void
  onClear: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClinicSearch>({ resolver: zodResolver(schema), defaultValues: initial })

  const clear = () => {
    reset(EMPTY_FILTERS)
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
          <Field label="Service" error={errors.service?.message}>
            <Select {...register('service')}>
              {SERVICE_TYPES.map((service) => (
                <option key={service} value={service}>
                  {SERVICE_LABELS[service]}
                </option>
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
          <Field label="Location" error={errors.location?.message} hint='City, "City, ST" or ZIP code'>
            <Input autoComplete="postal-code" placeholder="e.g. Madison, WI or 53703" {...register('location')} />
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

function Results({ search }: { search: ClinicSearch }) {
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
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{describe(search)}</p>

      {clinics.isPending ? (
        <div className="mt-6 flex justify-center" aria-label="Loading">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
        </div>
      ) : clinics.isError ? (
        <div className="mt-4">
          <ErrorBanner message={errorMessage(clinics.error)} />
        </div>
      ) : clinics.data.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No clinics match. Try widening the price range or clearing the location.
        </div>
      ) : (
        <ul className={`mt-4 space-y-3 transition-opacity ${clinics.isFetching ? 'opacity-60' : ''}`}>
          {clinics.data.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} service={search.service} />
          ))}
        </ul>
      )}
    </section>
  )
}

function ClinicCard({ clinic, service }: { clinic: ClinicResult; service: ServiceType }) {
  const location = useLocation()
  const otherServices = clinic.services.filter((s) => s.service !== service)

  return (
    // The name link stretches over the whole card (after:inset-0); phone/website links sit above it (z-10).
    <li className="relative rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-accent hover:shadow-md dark:border-slate-800 dark:bg-[#172220]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">
            <Link
              to={`/affordability/clinics/${clinic.id}`}
              state={{ backTo: location.pathname + location.search }}
              className="after:absolute after:inset-0 after:rounded-2xl hover:text-accent focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-accent/40 dark:hover:text-teal-300"
            >
              {clinic.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {clinic.addressLine}, {clinic.city}, {clinic.state} {clinic.postalCode}
          </p>
        </div>
        <p className="rounded-full bg-accent-soft px-3 py-1 text-sm whitespace-nowrap text-accent-strong dark:bg-accent/20 dark:text-teal-200">
          {SERVICE_LABELS[service]} · <strong>{formatPrice(clinic.price)}</strong>
        </p>
      </div>

      {otherServices.length > 0 && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Also offers:{' '}
          {otherServices.map((s) => `${SERVICE_LABELS[s.service]} ${formatPrice(s.price)}`).join(' · ')}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {clinic.phone && (
          <a href={`tel:${clinic.phone}`} className="relative z-10 text-accent hover:underline dark:text-teal-300">
            {clinic.phone}
          </a>
        )}
        {clinic.website && (
          <a
            href={clinic.website}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 text-accent hover:underline dark:text-teal-300"
          >
            Website ↗
          </a>
        )}
        <span className="ml-auto font-medium text-accent dark:text-teal-300" aria-hidden>
          Get a price →
        </span>
      </div>
    </li>
  )
}

function describe({ service, minCost, maxCost, location }: ClinicSearch): string {
  let cost = 'any price'
  if (minCost && maxCost) cost = `$${minCost} – $${maxCost}`
  else if (minCost) cost = `$${minCost} and up`
  else if (maxCost) cost = `up to $${maxCost}`
  const summary = `${SERVICE_LABELS[service]}, ${cost}`
  return location ? `${summary} · near ${location}` : summary
}
