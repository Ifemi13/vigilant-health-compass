import { Link } from 'react-router'
import type { Feature } from '../features'

/** Placeholder for a section or pet tile that hasn't been built yet. */
export default function ComingSoon({
  feature,
  backTo = '/pets',
  backLabel = 'Back to Pets',
}: {
  feature: Feature
  backTo?: string
  backLabel?: string
}) {
  return (
    <>
      <Link to={backTo} className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
        ← {backLabel}
      </Link>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#172220]">
        <span className="text-5xl" aria-hidden>
          {feature.icon}
        </span>
        <h1 className="mt-4 text-2xl font-semibold">{feature.title}</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{feature.description}</p>
        <p className="mt-6 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong dark:bg-accent/20 dark:text-teal-300">
          Coming soon
        </p>
      </div>
    </>
  )
}
