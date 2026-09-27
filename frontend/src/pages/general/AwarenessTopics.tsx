import { Link } from 'react-router'
import { AWARENESS_TOPICS } from '../../content/awarenessTopics'

export default function AwarenessTopics() {
  return (
    <>
      <Link to="/general" className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
        ← Back to General
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">📚 Awareness</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Short, trusted guides to common health topics.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {AWARENESS_TOPICS.map((topic) => (
          <li key={topic.id}>
            <Link
              to={`/general/awareness/${topic.id}`}
              className="group flex h-full gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-accent hover:shadow-md focus:ring-2 focus:ring-accent/30 focus:outline-none dark:border-slate-800 dark:bg-[#172220]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-2xl dark:bg-accent/20" aria-hidden>
                {topic.icon}
              </span>
              <span>
                <span className="block font-semibold group-hover:text-accent dark:group-hover:text-teal-300">{topic.title}</span>
                <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{topic.summary}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
