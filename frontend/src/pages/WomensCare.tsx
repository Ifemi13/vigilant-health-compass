import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useAuth } from '../auth/useAuth'

type WomenTab = 'discover' | 'community' | 'reminders'
type Gender = 'Woman' | 'Man' | 'Non-binary' | 'Prefer not to say'
type DiscussionTopic = 'Care access' | 'Research participation' | 'Wellbeing' | 'Other'

interface ParticipantCard {
  code: string
  age: string
  gender: Gender | ''
}

interface CommunityPost {
  id: string
  code: string
  age: string
  gender: Gender | ''
  topic: DiscussionTopic
  text: string
  createdAt: string
}

interface LocalReminder {
  id: string
  title: string
  date: string
  done: boolean
}

const PARTICIPANT_KEY = 'vhc-women-participant:'
const COMMUNITY_KEY = 'vhc-women-community:'
const REMINDERS_KEY = 'vhc-women-reminders:'
const WISCONSIN_COUNTIES = [
  'Adams', 'Ashland', 'Barron', 'Bayfield', 'Brown', 'Buffalo', 'Burnett', 'Calumet', 'Chippewa', 'Clark',
  'Columbia', 'Crawford', 'Dane', 'Dodge', 'Door', 'Douglas', 'Dunn', 'Eau Claire', 'Florence', 'Fond du Lac',
  'Forest', 'Grant', 'Green', 'Green Lake', 'Iowa', 'Iron', 'Jackson', 'Jefferson', 'Juneau', 'Kenosha',
  'Kewaunee', 'La Crosse', 'Lafayette', 'Langlade', 'Lincoln', 'Manitowoc', 'Marathon', 'Marinette', 'Marquette',
  'Menominee', 'Milwaukee', 'Monroe', 'Oconto', 'Oneida', 'Outagamie', 'Ozaukee', 'Pepin', 'Pierce', 'Polk',
  'Portage', 'Price', 'Racine', 'Richland', 'Rock', 'Rusk', 'St. Croix', 'Sauk', 'Sawyer', 'Shawano',
  'Sheboygan', 'Taylor', 'Trempealeau', 'Vernon', 'Vilas', 'Walworth', 'Washburn', 'Washington', 'Waukesha',
  'Waupaca', 'Waushara', 'Winnebago', 'Wood',
]

const TABS: { id: WomenTab; label: string }[] = [
  { id: 'discover', label: 'Find care & studies' },
  { id: 'community', label: 'Community' },
  { id: 'reminders', label: 'My reminders' },
]

export default function WomensCare() {
  const { session } = useAuth()
  const storageScope = session?.user.id ?? 'local'
  const [tab, setTab] = useState<WomenTab>('discover')
  const [county, setCounty] = useState('Dane')
  const [participant, setParticipant] = useState<ParticipantCard>(() => readStored(`${PARTICIPANT_KEY}${storageScope}`, makeParticipantCard()))
  const [posts, setPosts] = useState<CommunityPost[]>(() => readStored(`${COMMUNITY_KEY}${storageScope}`, []))
  const [reminders, setReminders] = useState<LocalReminder[]>(() => readStored(`${REMINDERS_KEY}${storageScope}`, []))

  useEffect(() => writeStored(`${PARTICIPANT_KEY}${storageScope}`, participant), [participant, storageScope])
  useEffect(() => writeStored(`${COMMUNITY_KEY}${storageScope}`, posts), [posts, storageScope])
  useEffect(() => writeStored(`${REMINDERS_KEY}${storageScope}`, reminders), [reminders, storageScope])

  const trialSearch = `https://clinicaltrials.gov/search?${new URLSearchParams({
    locStr: `${county} County, Wisconsin`,
    country: 'United States',
    state: 'Wisconsin',
    cond: 'women',
  })}`
  const countyHealthSearch = `https://www.google.com/search?q=${encodeURIComponent(`${county} County Wisconsin women's health clinic`)}`

  const createPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const text = String(form.get('post') ?? '').trim()
    const topic = String(form.get('topic') ?? 'Care access') as DiscussionTopic
    if (!text) return
    const post: CommunityPost = {
      id: createId(),
      code: participant.code,
      age: participant.age,
      gender: participant.gender,
      topic,
      text,
      createdAt: new Date().toISOString(),
    }
    setPosts((current) => [post, ...current])
    event.currentTarget.reset()
  }

  const createReminder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') ?? '').trim()
    const date = String(form.get('date') ?? '')
    if (!title || !date) return
    setReminders((current) => [...current, { id: createId(), title, date, done: false }].sort((a, b) => a.date.localeCompare(b.date)))
    event.currentTarget.reset()
  }

  const toggleReminder = (id: string) => {
    setReminders((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item))
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/" className="text-sm font-medium text-accent underline underline-offset-2 dark:text-accent-light">← All care areas</Link>

      <header className="mt-5 border-b border-slate-200 pb-5 dark:border-slate-800">
        <p className="text-sm font-semibold uppercase text-accent dark:text-accent-light">Wisconsin · Women’s care</p>
        <h1 className="mt-2 text-3xl font-semibold">Care, research, community</h1>
        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">
          Explore nearby care and registered research, connect through a participant code, and keep private reminders.
        </p>
      </header>

      <nav className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800" aria-label="Women’s care sections">
        {TABS.map((item) => (
          <button key={item.id} type="button" aria-pressed={tab === item.id} onClick={() => setTab(item.id)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === item.id ? 'bg-accent text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
            {item.label}
          </button>
        ))}
      </nav>

      {tab === 'discover' && (
        <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
          <section aria-labelledby="county-map-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="county-map-heading" className="text-xl font-semibold">Explore by county</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Select a county to find health and research resources nearby.</p>
              </div>
              <label className="text-sm font-medium">Selected county
                <select value={county} onChange={(event) => setCounty(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#1c1830]">
                  {WISCONSIN_COUNTIES.map((name) => <option key={name} value={name}>{name} County</option>)}
                </select>
              </label>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-[#f4fffb] p-2 dark:border-slate-800 dark:bg-[#1a1628]">
              <ComposableMap width={640} height={430} projection="geoAlbers" projectionConfig={{ rotate: [89.8, 0, 0], center: [0, 44.8], parallels: [43, 46], scale: 4700 }} className="h-auto w-full" aria-label="Interactive Wisconsin county map">
                <Geographies geography="/data/wisconsin-counties.geojson">
                  {({ geographies }) => geographies.map((geography) => {
                    const countyName = String(geography.properties?.name ?? '')
                    const selected = countyName === county
                    return (
                      <Geography
                        key={geography.rsmKey}
                        geography={geography}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${countyName} County`}
                        aria-pressed={selected}
                        fill={selected ? '#7b3fe4' : '#d5ddf5'}
                        stroke="#fff"
                        strokeWidth={1.2}
                        className={`cursor-pointer transition-colors ${selected ? 'hover:fill-accent-strong' : 'hover:fill-[#aebdec]'}`}
                        onClick={() => setCounty(countyName.replace(/ County$/i, ''))}
                        onKeyDown={(event: KeyboardEvent<SVGPathElement>) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setCounty(countyName.replace(/ County$/i, ''))
                          }
                        }}
                      />
                    )
                  })}
                </Geographies>
              </ComposableMap>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">County boundaries: U.S. Census Bureau cartographic data, via us-atlas.</p>

            <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
              <h2 className="text-lg font-semibold">Resources near {county} County</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Use official directories for current locations, eligibility, and contact details.</p>
              <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                <ResourceLink title="Wisconsin Well Woman Program" description="Find county coordinators and screening support information." href="https://www.dhs.wisconsin.gov/wwwp/counties.htm" source="Wisconsin DHS" />
                <ResourceLink title="Community health centers" description={`Search for health centers serving ${county} County and nearby communities.`} href="https://findahealthcenter.hrsa.gov/" source="HRSA locator" />
                <ResourceLink title="Family planning and reproductive health" description="Explore Wisconsin programs and statewide care resources." href="https://www.dhs.wisconsin.gov/mch/reproductive-health-family-planning.htm" source="Wisconsin DHS" />
                <ResourceLink title="Registered research studies" description={`Search study locations near ${county} County. Verify recruiting status, eligibility, and contacts on each record.`} href={trialSearch} source="ClinicalTrials.gov" />
                <ResourceLink title="Nearby women’s health clinics" description="Search local clinic listings for ${county} County and the surrounding area." href={countyHealthSearch} source="Map search" />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <ParticipantCard participant={participant} onChange={setParticipant} />
            <section className="border-t border-slate-200 pt-5 dark:border-slate-800">
              <h2 className="text-lg font-semibold">Before contacting a study team</h2>
              <ul className="mt-2 list-inside list-disc space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>Check the study status and eligibility on the registry.</li>
                <li>Use the contact details on the official study record.</li>
                <li>Never pay to join a study or share a password or payment card.</li>
              </ul>
              <a href="https://clinicaltrials.gov/about-site/disclaimer" target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-accent underline dark:text-accent-light">About ClinicalTrials.gov listings ↗</a>
            </section>
          </aside>
        </div>
      )}

      {tab === 'community' && (
        <CommunityBoard participant={participant} posts={posts} onCreate={createPost} />
      )}

      {tab === 'reminders' && (
        <ReminderBoard reminders={reminders} onCreate={createReminder} onToggle={toggleReminder} />
      )}

      <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Participant code, profile, posts, and reminders are stored in this browser only. They are not sent to VHC or other participants. Do not use a shared device for information you want to keep private. VHC is not a clinic or research sponsor.
      </footer>
    </main>
  )
}

function ParticipantCard({ participant, onChange }: { participant: ParticipantCard; onChange: (next: ParticipantCard) => void }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#1c1830]" aria-labelledby="participant-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-accent dark:text-accent-light">Participant code</p>
          <h2 id="participant-heading" className="mt-1 text-2xl font-semibold">{participant.code}</h2>
        </div>
        <button type="button" onClick={() => onChange({ ...participant, code: makeCode() })} className="text-sm font-medium text-accent underline underline-offset-2 dark:text-accent-light">New code</button>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Only age and gender are shown on your local discussion posts. No name or contact fields are collected here.</p>
      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <label className="text-sm font-medium">Age
          <input type="number" min="13" max="120" value={participant.age} onChange={(event) => onChange({ ...participant, age: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#17132a]" />
        </label>
        <label className="text-sm font-medium">Gender
          <select value={participant.gender} onChange={(event) => onChange({ ...participant, gender: event.target.value as Gender | '' })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#17132a]">
            <option value="">Choose…</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Prefer not to say</option>
          </select>
        </label>
      </form>
    </section>
  )
}

function CommunityBoard({ participant, posts, onCreate }: { participant: ParticipantCard; posts: CommunityPost[]; onCreate: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase text-accent dark:text-accent-light">Participant space</p>
            <h2 className="mt-1 text-2xl font-semibold">Community</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Explore conversation starters and keep your own notes under {participant.code}.</p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Age and gender are optional</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#1c1830]">
            <p className="text-xs font-semibold uppercase text-accent dark:text-accent-light">Care access</p>
            <h3 className="mt-2 font-semibold">Getting to care in rural areas</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">What transportation, scheduling, or local support would make care easier to reach?</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#1c1830]">
            <p className="text-xs font-semibold uppercase text-accent dark:text-accent-light">Research participation</p>
            <h3 className="mt-2 font-semibold">Questions before joining a study</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">What would you want a study team to explain before you consider participating?</p>
          </article>
        </div>

        <section className="mt-7 border-t border-slate-200 pt-5 dark:border-slate-800" aria-labelledby="local-posts-heading">
          <h3 id="local-posts-heading" className="text-lg font-semibold">Your discussions on this device</h3>
          {posts.length === 0
            ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">No discussions saved here yet.</p>
            : <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">{posts.map((post) => <article key={post.id} className="py-4"><div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400"><span className="font-semibold text-accent dark:text-accent-light">{post.code}</span>{post.age && <span>Age {post.age}</span>}{post.gender && <span>{post.gender}</span>}<span>{formatDate(post.createdAt)}</span><span>{post.topic}</span></div><p className="mt-2 whitespace-pre-wrap text-sm">{post.text}</p></article>)}</div>}
        </section>
      </div>

      <aside className="border-t border-slate-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 dark:border-slate-800">
        <h3 className="text-lg font-semibold">Start a discussion</h3>
        <form onSubmit={onCreate} className="mt-3 space-y-3">
          <label className="block text-sm font-medium">Topic
            <select name="topic" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#1c1830]"><option>Care access</option><option>Research participation</option><option>Wellbeing</option><option>Other</option></select>
          </label>
          <label className="block text-sm font-medium">Your post
            <textarea name="post" required maxLength={500} rows={5} placeholder="Share a question or resource…" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-[#1c1830]" />
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">Posts stay in this browser. Don’t include names, contact details, exact addresses, medical records, or details that could identify you.</p>
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong focus:ring-2 focus:ring-accent/40 focus:outline-none">Save post</button>
        </form>
      </aside>
    </section>
  )
}

function ReminderBoard({ reminders, onCreate, onToggle }: { reminders: LocalReminder[]; onCreate: (event: FormEvent<HTMLFormElement>) => void; onToggle: (id: string) => void }) {
  const upcoming = reminders.filter((item) => !item.done).sort((a, b) => a.date.localeCompare(b.date))
  const completed = reminders.filter((item) => item.done)
  return (
    <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <p className="text-sm font-semibold uppercase text-accent dark:text-accent-light">Private to this browser</p>
        <h2 className="mt-1 text-2xl font-semibold">Study and care reminders</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Keep a date to contact a study team, ask a clinic a question, or follow up on a resource. No contact details are required.</p>
        <h3 className="mt-6 text-lg font-semibold">Upcoming</h3>
        {upcoming.length === 0 ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No reminders saved yet.</p> : <div className="mt-2 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">{upcoming.map((item) => <ReminderRow key={item.id} reminder={item} onToggle={onToggle} />)}</div>}
        {completed.length > 0 && <><h3 className="mt-6 text-lg font-semibold">Completed</h3><div className="mt-2 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">{completed.map((item) => <ReminderRow key={item.id} reminder={item} onToggle={onToggle} />)}</div></>}
      </div>
      <aside className="border-t border-slate-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 dark:border-slate-800">
        <h3 className="text-lg font-semibold">Add a reminder</h3>
        <form onSubmit={onCreate} className="mt-3 space-y-3">
          <label className="block text-sm font-medium">Reminder title
            <input name="title" required maxLength={100} placeholder="e.g. Follow up with study team" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#1c1830]" />
          </label>
          <label className="block text-sm font-medium">Date
            <input name="date" required type="date" min={dateKey(new Date())} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#1c1830]" />
          </label>
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong focus:ring-2 focus:ring-accent/40 focus:outline-none">Save reminder</button>
        </form>
      </aside>
    </section>
  )
}

function ReminderRow({ reminder, onToggle }: { reminder: LocalReminder; onToggle: (id: string) => void }) {
  return <article className="flex flex-wrap items-center justify-between gap-3 py-3"><div><h4 className={`text-sm font-medium ${reminder.done ? 'text-slate-500 line-through' : ''}`}>{reminder.title}</h4><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(reminder.date)}</p></div><button type="button" onClick={() => onToggle(reminder.id)} className="text-sm font-medium text-accent underline dark:text-accent-light">{reminder.done ? 'Reopen' : 'Mark done'}</button></article>
}

function ResourceLink({ title, description, href, source }: { title: string; description: string; href: string; source: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="flex flex-wrap items-center justify-between gap-3 py-3 hover:text-accent dark:hover:text-accent-light"><span><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">{description}</span></span><span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{source} ↗</span></a>
}

function makeParticipantCard(): ParticipantCard {
  return { code: makeCode(), age: '', gender: '' }
}

function makeCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const letterPart = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('')
  const numberPart = String(Math.floor(Math.random() * 100)).padStart(2, '0')
  return `${letterPart}${numberPart}`
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function writeStored<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // The page remains usable if browser storage is unavailable.
  }
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00`)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}