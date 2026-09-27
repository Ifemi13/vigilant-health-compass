import { Link } from 'react-router'
import { FEATURES } from '../features'
import { useMe } from '../lib/profile'

export default function PetsHome() {
  const { data: me } = useMe()

  return (
    <>
      <h1 className="text-3xl font-semibold">Welcome 👋</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        {me?.role === 'VET' ? 'What would you like to do today?' : 'How can we help you care for your pet today?'}
      </p>
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
