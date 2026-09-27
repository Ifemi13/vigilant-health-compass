import { Link, Navigate, useParams } from 'react-router'
import { ErrorBanner } from '../../components/ui'
import { AWARENESS_TOPICS, type AwarenessTopic as Topic } from '../../content/awarenessTopics'
import { errorMessage } from '../../lib/api'
import { sourceHost } from '../../lib/clinics'
import { useTopicHospitals } from '../../lib/community'

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

      <h2 className="mt-10 text-xl font-semibold">About {topic.title.toLowerCase()}</h2>
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

function SpecialtyHospitals({ topic }: { topic: Topic }) {
  const hospitals = useTopicHospitals(topic.id)

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">Specialty hospitals</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Open a hospital to join its community and share suggestions with others.
      </p>
      {hospitals.isPending ? (
        <div className="mt-4 flex justify-center" aria-label="Loading">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
        </div>
      ) : hospitals.isError ? (
        <div className="mt-4">
          <ErrorBanner message={errorMessage(hospitals.error)} />
        </div>
      ) : hospitals.data.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No hospitals listed for this topic yet.</p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {hospitals.data.map((hospital) => (
            <li key={hospital.id}>
              <Link
                to={`/general/awareness/${topic.id}/hospitals/${hospital.id}`}
                className="group block h-full rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-accent hover:shadow-md focus:ring-2 focus:ring-accent/30 focus:outline-none dark:border-slate-800 dark:bg-[#172220]"
              >
                <span className="block font-semibold group-hover:text-accent dark:group-hover:text-teal-300">{hospital.name}</span>
                <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
                  {hospital.specialty} · {hospital.city}, {hospital.state}
                </span>
                <span className="mt-3 block text-sm font-medium text-accent dark:text-teal-300">Join the community →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
