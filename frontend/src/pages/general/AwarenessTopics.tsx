import { Book2Filled } from '@mingcute/react/core-filled'
import { Link } from 'react-router'
import { AWARENESS_TOPICS } from '../../content/awarenessTopics'

export default function AwarenessTopics() {
  return (
    <>
      <Link to="/general" className="text-sm font-medium text-accent hover:underline dark:text-accent-light">
        ← Back to General
      </Link>
      <h1 className="mt-4 flex items-center gap-3 text-3xl font-semibold">
        <Book2Filled size={32} className="shrink-0 text-accent dark:text-accent-light" />
        Awareness
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Short, trusted guides to common health topics.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {AWARENESS_TOPICS.map((topic) => (
          <li key={topic.id}>
            <Link
              to={`/general/awareness/${topic.id}`}
              className="group flex h-full gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-accent hover:shadow-md focus:ring-2 focus:ring-accent/30 focus:outline-none dark:border-slate-800 dark:bg-[#1c1830]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent dark:text-accent-light dark:bg-accent/20" aria-hidden>
                <topic.icon size={24} />
              </span>
              <span>
                <span className="block font-semibold group-hover:text-accent dark:group-hover:text-accent-light">{topic.title}</span>
                <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{topic.summary}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
