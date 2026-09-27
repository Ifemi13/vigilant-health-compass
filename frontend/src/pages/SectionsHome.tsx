import { WaveHandFilled } from '@mingcute/react/core-filled'
import { Link } from 'react-router'
import { SECTIONS } from '../sections'

/** The home screen: a greeting and a card for each section. */
export default function SectionsHome() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <h1 className="flex items-center justify-center gap-2 text-3xl font-semibold">
        Welcome <WaveHandFilled size={32} className="text-accent dark:text-teal-300" />
      </h1>
      <p className="mt-2 text-center text-slate-600 dark:text-slate-400">How can we help you today?</p>
      <nav aria-label="Sections" className="mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="group flex aspect-square flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md focus:ring-2 focus:ring-accent/30 focus:outline-none max-sm:aspect-auto max-sm:py-10 dark:border-slate-800 dark:bg-[#172220]"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-soft text-accent dark:text-teal-300 dark:bg-accent/20" aria-hidden>
              <section.icon size={44} />
            </span>
            <span className="text-xl font-semibold group-hover:text-accent dark:group-hover:text-teal-300">{section.title}</span>
          </Link>
        ))}
      </nav>
    </main>
  )
}
