import { Link } from 'react-router'
import { GENERAL_PANELS } from '../../sections'

export default function GeneralHome() {
  return (
    <>
      <Link to="/" className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
        ← Back
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">General health</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {GENERAL_PANELS.map((panel) => (
          <Link
            key={panel.path}
            to={panel.path}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md focus:ring-2 focus:ring-accent/30 focus:outline-none dark:border-slate-800 dark:bg-[#172220]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-2xl dark:bg-accent/20" aria-hidden>
              {panel.icon}
            </span>
            <h2 className="mt-4 text-lg font-semibold group-hover:text-accent dark:group-hover:text-teal-300">{panel.title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{panel.description}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
