import { Link } from 'react-router'
import { FEATURES } from '../features'

export default function PetsHome() {
  return (
    <>
      <Link to="/" className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
        ← Back
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">Pets</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Link
            key={feature.path}
            to={feature.path}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md focus:ring-2 focus:ring-accent/30 focus:outline-none dark:border-slate-800 dark:bg-[#172220]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-2xl dark:bg-accent/20" aria-hidden>
              {feature.icon}
            </span>
            <h2 className="mt-4 text-lg font-semibold group-hover:text-accent dark:group-hover:text-teal-300">{feature.title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
