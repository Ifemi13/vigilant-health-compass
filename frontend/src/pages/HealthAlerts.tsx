import { useMemo, useState } from 'react'
import { Link } from 'react-router'

type AlertCategory = 'ticks' | 'bites' | 'recalls'
type Filter = 'all' | AlertCategory

interface HealthAlert {
  id: string
  title: string
  date: string
  category: AlertCategory
  label: string
  location: string
  summary: string
  petImpact: string
  action: string
  sourceLabel: string
  sourceUrl: string
  secondarySourceLabel?: string
  secondarySourceUrl?: string
}

const alerts: HealthAlert[] = [
  {
    id: 'dane-tick-season-2026',
    title: 'Tick season started early in Dane County',
    date: '2026-04-30',
    category: 'ticks',
    label: 'Seasonal tick advisory',
    location: 'Dane County',
    summary: 'Public Health Madison & Dane County reported at least 35 tick-related urgent-care visits in the prior week, compared with 17 during the same period the year before.',
    petImpact: 'The notice says ticks can spread illness to pets as well as people. The urgent-care numbers are for people, not a count of pet infections.',
    action: 'Check your pet after time outdoors and ask your veterinarian which tick prevention is appropriate. Review the state tracker for changing activity.',
    sourceLabel: 'Read the local health notice',
    sourceUrl: 'https://publichealthmdc.com/blog/2026-04-30/tick-season-is-off-to-a-bad-start',
    secondarySourceLabel: 'Wisconsin tick activity tracker',
    secondarySourceUrl: 'https://www.dhs.wisconsin.gov/tick/wisconsin.htm',
  },
  {
    id: 'dane-dog-bites-2026',
    title: 'Spring dog-bite and rabies-prevention reminder',
    date: '2026-04-07',
    category: 'bites',
    label: 'Animal safety advisory',
    location: 'Dane County',
    summary: 'The local health department reported 764 calls involving dog bites to Animal Services in the prior year and shared seasonal prevention guidance.',
    petImpact: 'Most of the post’s bite statistics concern people bitten by dogs. It also reminds Dane County residents to keep dogs vaccinated and report bites involving a pet so officials can assess rabies exposure.',
    action: 'Keep rabies vaccinations current. If an animal bites your pet, contact your veterinarian; report bites in Dane County to Animal Services for guidance at (608) 255-2345.',
    sourceLabel: 'Read the local health notice',
    sourceUrl: 'https://publichealthmdc.com/blog/2026-04-07/when-the-dog-bites',
    secondarySourceLabel: 'Dane County animal bite and rabies guidance',
    secondarySourceUrl: 'https://publichealthmdc.com/home-environment/animal-bites-rabies',
  },
  {
    id: 'fi-dog-supplements-2026',
    title: 'FI dog supplements recalled over possible Salmonella contamination',
    date: '2026-09-08',
    category: 'recalls',
    label: 'FDA product recall',
    location: 'U.S. online sales',
    summary: 'The FDA published a recall for two 180 g supplements: Fi Calming Supplement for Dogs, lot 26118, and Fi 8-in-1 Formula Supplement for Dogs, lot 26159.',
    petImpact: 'Salmonella can make pets sick, and infected pets may also spread it to people or other animals. The products were sold directly and through Amazon and Chewy.',
    action: 'Check the package and lot number. Stop using an affected product, seal and discard it, and contact your veterinarian if your dog becomes ill.',
    sourceLabel: 'Read the FDA recall notice',
    sourceUrl: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fi-recalls-supplements-dogs-because-possible-salmonella-contamination',
  },
  {
    id: 'northwest-naturals-2026',
    title: 'Northwest Naturals raw chicken recipes recalled',
    date: '2026-08-28',
    category: 'recalls',
    label: 'FDA product recall',
    location: 'Nationwide distribution',
    summary: 'The recall covers Northwest Naturals Frozen Chicken Recipe cat food / dog topper, 2 lb, lot B-5 (UPC 087316384956), and Frozen Raw Diet for Dogs Chicken Recipe, 6 lb, lot B-19 (UPC 087316380392).',
    petImpact: 'The products tested positive for Salmonella and/or Listeria. Pets may become ill or carry bacteria without obvious symptoms, creating a household exposure risk.',
    action: 'Stop feeding the listed lots and return unused product to the retailer. Clean bowls and surfaces that contacted the food; contact your veterinarian if your pet shows signs of illness.',
    sourceLabel: 'Read the FDA recall notice',
    sourceUrl: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/northwest-naturals-voluntarily-recalls-two-raw-pet-food-products-because-possible-salmonella',
  },
  {
    id: 'fromm-canned-dog-food-2026',
    title: 'Two Fromm canned dog foods recalled over potential metal contamination',
    date: '2026-08-21',
    category: 'recalls',
    label: 'FDA product recall',
    location: 'U.S. and Canada distribution',
    summary: 'The August 21 recall covers Fromm Turkey Pâté Wet Dog Food, UPC 072705118700, and Fromm Diner Classics Milo’s Meatloaf Pâté Wet Dog Food, UPC 072705132324; both have the listed best-by date 03/2029.',
    petImpact: 'Metal fragments can injure a dog’s mouth or digestive tract. The maker said the products were distributed through U.S. and Canadian pet stores and online outlets.',
    action: 'Check the UPC and best-by date, stop feeding an affected product, and return it to the retailer. Contact your veterinarian if your dog may have eaten it and seems unwell.',
    sourceLabel: 'Read the FDA recall notice',
    sourceUrl: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-turkey-pate-wet-food-dogs-and-diner-classic-milos-meatloaf',
  },
]

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All notices' },
  { id: 'ticks', label: 'Ticks' },
  { id: 'bites', label: 'Bites & rabies' },
  { id: 'recalls', label: 'Food & product recalls' },
]

export default function HealthAlerts() {
  const [filter, setFilter] = useState<Filter>('all')
  const { start, end } = useMemo(() => {
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    const startDate = new Date(endDate)
    startDate.setFullYear(startDate.getFullYear() - 1)
    return { start: startDate, end: endDate }
  }, [])
  const visibleAlerts = alerts
    .filter((alert) => {
      const date = new Date(`${alert.date}T12:00:00`)
      return date >= start && date <= end && (filter === 'all' || alert.category === filter)
    })
    .sort((first, second) => second.date.localeCompare(first.date))

  return (
    <>
      <Link to="/pets" className="text-sm font-medium text-accent hover:underline dark:text-teal-300">← Back to Pets</Link>

      <header className="mt-6 border-b border-slate-200 pb-6 dark:border-slate-800">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent dark:text-teal-300">Madison · Dane County · U.S. recalls</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Pet health alerts</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
              Local advisories and nationwide product recalls that may affect pets, with the source and practical next steps.
            </p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Past year: {formatDate(start)} – {formatDate(end)}
          </p>
        </div>
      </header>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#172220]" aria-label="Alert archive information">
        <p className="text-sm font-medium">Selected advisories and recalls, not a live emergency feed</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Local notices are from Madison and Dane County. Product recalls may be nationwide; check product identifiers and the FDA source before acting. This archive is selective, and entries do not imply an active local outbreak.
        </p>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" aria-label="Filter notices">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filter === item.id
                ? 'bg-accent text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {visibleAlerts.length} {visibleAlerts.length === 1 ? 'notice' : 'notices'}
        </p>
      </div>

      {visibleAlerts.length > 0 ? (
        <div className="mt-4 space-y-4" aria-live="polite">
          {visibleAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)}
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-[#172220] dark:text-slate-400" aria-live="polite">
          No curated notices in this category for the past year. This archive is selective, so check the official sources below for current information.
        </p>
      )}

      <aside className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">
        <h2 className="font-semibold">A bite or possible rabies exposure?</h2>
        <p className="mt-1">
          Contact your veterinarian for an injured pet. Dane County Animal Services handles bite reports and rabies guidance at (608) 255-2345. For urgent or worsening symptoms, seek veterinary care promptly.
        </p>
        <a className="mt-2 inline-block font-medium underline" href="https://publichealthmdc.com/home-environment/animal-bites-rabies" target="_blank" rel="noreferrer">
          Dane County bite reporting instructions
        </a>
      </aside>

      <section className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
        <h2 className="text-lg font-semibold">Live local and recall checks</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          These change more quickly than a curated archive. Check conditions before outdoor activities and verify recalls by product and lot.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a className="font-medium text-accent underline underline-offset-2 dark:text-teal-300" href="https://publichealthmdc.com/beaches" target="_blank" rel="noreferrer">Madison & Dane County beach conditions</a>
          <a className="font-medium text-accent underline underline-offset-2 dark:text-teal-300" href="https://www.dhs.wisconsin.gov/tick/wisconsin.htm" target="_blank" rel="noreferrer">Wisconsin tick activity tracker</a>
          <a className="font-medium text-accent underline underline-offset-2 dark:text-teal-300" href="https://www.fda.gov/animal-veterinary/safety-health/recalls-withdrawals" target="_blank" rel="noreferrer">FDA animal food and drug recalls</a>
        </div>
      </section>

      <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
        This page summarizes public notices for awareness and is not veterinary advice. Information can change; follow the linked agency guidance.
      </p>
    </>
  )
}

function AlertCard({ alert }: { alert: HealthAlert }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#172220]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong dark:bg-accent/20 dark:text-teal-300">
          {alert.label}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">{alert.location}</span>
          <time dateTime={alert.date} className="text-sm text-slate-500 dark:text-slate-400">{formatDate(new Date(`${alert.date}T12:00:00`))}</time>
        </div>
      </div>
      <h2 className="mt-3 text-lg font-semibold">{alert.title}</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{alert.summary}</p>
      <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold">Why pet owners should know</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{alert.petImpact}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">What to do</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{alert.action}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
        <a href={alert.sourceUrl} target="_blank" rel="noreferrer" className="font-medium text-accent underline underline-offset-2 dark:text-teal-300">
          {alert.sourceLabel}
        </a>
        {alert.secondarySourceUrl && alert.secondarySourceLabel && (
          <a href={alert.secondarySourceUrl} target="_blank" rel="noreferrer" className="font-medium text-accent underline underline-offset-2 dark:text-teal-300">
            {alert.secondarySourceLabel}
          </a>
        )}
      </div>
    </article>
  )
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}