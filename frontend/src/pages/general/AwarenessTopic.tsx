import { useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import StarRating from '../../components/StarRating'
import { Button, ErrorBanner, Input } from '../../components/ui'
import { AWARENESS_TOPICS, type AwarenessTopic as Topic } from '../../content/awarenessTopics'
import { errorMessage } from '../../lib/api'
import { sourceHost } from '../../lib/clinics'
import { hospitalTypeLabel, useTopicHospitals } from '../../lib/community'

export default function AwarenessTopic() {
  const { topicId } = useParams()
  const topic = AWARENESS_TOPICS.find((t) => t.id === topicId)
  if (!topic) return <Navigate to="/general/awareness" replace />

  return (
    <article>
      <Link to="/general/awareness" className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
        ← All topics
      </Link>
      <h1 className="mt-4 flex items-center gap-3 text-3xl font-semibold">
        <span aria-hidden>{topic.icon}</span>
        {topic.title}
      </h1>

      {topic.emergency && (
        <div
          role="note"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <strong className="font-semibold">Emergency: </strong>
          {topic.emergency}
        </div>
      )}

      <SpecialtyHospitals topic={topic} />

      <h2 className="mt-10 text-xl font-semibold">About {topic.title}</h2>
      <p className="mt-3 text-slate-700 dark:text-slate-300">{topic.overview}</p>

      {topic.sections.map((section) => (
        <section key={section.title} className="mt-6">
          <h3 className="text-lg font-semibold">{section.title}</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-700 marker:text-accent dark:text-slate-300">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#172220]">
        <h2 className="font-semibold">Sources</h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          {topic.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline dark:text-teal-300">
                {source.label} ↗
              </a>
              <span className="text-slate-500 dark:text-slate-400"> · {sourceHost(source.url)}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
        General information only, not medical advice. Talk to a healthcare professional about your own health.
      </p>
    </article>
  )
}

const INITIAL_COUNT = 12

function SpecialtyHospitals({ topic }: { topic: Topic }) {
  const [draft, setDraft] = useState('')
  const [location, setLocation] = useState('')
  const [showAll, setShowAll] = useState(false)
  const hospitals = useTopicHospitals(topic.id, location)

  const search = (event: FormEvent) => {
    event.preventDefault()
    setLocation(draft.trim())
    setShowAll(false)
  }

  const shown = showAll ? hospitals.data : hospitals.data?.slice(0, INITIAL_COUNT)

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">Hospitals In Wisconsin</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Open a hospital to join its {topic.title.toLowerCase()} community and share suggestions with others.
      </p>

      <form onSubmit={search} className="mt-4 flex gap-2" role="search">
        <label htmlFor="hospital-location" className="sr-only">
          City or ZIP code
        </label>
        <Input
          id="hospital-location"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="City or ZIP code, e.g. Madison or 53703"
          maxLength={100}
        />
        <Button type="submit">Search</Button>
        {location && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDraft('')
              setLocation('')
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {hospitals.isPending ? (
        <div className="mt-4 flex justify-center" aria-label="Loading">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
        </div>
      ) : hospitals.isError ? (
        <div className="mt-4">
          <ErrorBanner message={errorMessage(hospitals.error)} />
        </div>
      ) : hospitals.data.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No hospitals found{location && ` near ${location}`}.</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {hospitals.data.length} hospital{hospitals.data.length === 1 ? '' : 's'}
            {location && ` near ${location}`}, highest rated first
          </p>
          <ul className={`mt-2 grid gap-3 transition-opacity sm:grid-cols-2 ${hospitals.isFetching ? 'opacity-60' : ''}`}>
            {shown!.map((hospital) => (
              <li key={hospital.id}>
                <Link
                  to={`/general/awareness/${topic.id}/hospitals/${hospital.id}`}
                  className="group block h-full rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-accent hover:shadow-md focus:ring-2 focus:ring-accent/30 focus:outline-none dark:border-slate-800 dark:bg-[#172220]"
                >
                  <span className="block font-semibold group-hover:text-accent dark:group-hover:text-teal-300">{hospital.name}</span>
                  <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
                    {hospitalTypeLabel(hospital.hospitalType)} · {hospital.city}
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-2">
                    <StarRating rating={hospital.starRating} />
                    <span className="text-sm font-medium text-accent dark:text-teal-300">Join the community →</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {!showAll && hospitals.data.length > INITIAL_COUNT && (
            <div className="mt-4 text-center">
              <Button type="button" variant="secondary" onClick={() => setShowAll(true)}>
                Show all {hospitals.data.length} hospitals
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
