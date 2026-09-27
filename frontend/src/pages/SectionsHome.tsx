import { WaveHandFilled } from '@mingcute/react/core-filled'
import { Link } from 'react-router'
import logo from '../assets/vhc-logo.png'
import { SECTIONS } from '../sections'

/** The home screen: the logo, a greeting and a card for each section. */
export default function SectionsHome() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      {/* The logo's mint background matches the light page; the rounded corners make it a badge in dark mode. */}
      <img src={logo} alt="Vigilant Health Compass" width={176} height={176} className="mb-2 h-44 w-44 rounded-3xl" />
      <p className="text-sm font-semibold tracking-wide text-accent uppercase dark:text-accent-light">Vigilant Health Compass</p>
      <h1 className="mt-4 flex items-center justify-center gap-2 text-3xl font-semibold">
        Welcome <WaveHandFilled size={32} className="text-accent dark:text-accent-light" />
      </h1>
      <p className="mt-2 text-center text-slate-600 dark:text-slate-400">How can we help you today?</p>
      <nav aria-label="Sections" className="mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="group flex aspect-square flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md focus:ring-2 focus:ring-accent/30 focus:outline-none max-sm:aspect-auto max-sm:py-10 dark:border-slate-800 dark:bg-[#1c1830]"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-soft text-accent dark:text-accent-light dark:bg-accent/20" aria-hidden>
              <section.icon size={44} />
            </span>
            <span className="text-xl font-semibold group-hover:text-accent dark:group-hover:text-accent-light">{section.title}</span>
          </Link>
        ))}
      </nav>
    </main>
  )
}
