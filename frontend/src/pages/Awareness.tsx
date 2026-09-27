import { Link } from 'react-router'

const topics = [
  {
    number: '01',
    title: 'Keep prevention personal',
    description:
      'Ask your veterinarian about vaccines, parasite prevention, dental care, and checkup timing for your pet’s age and lifestyle.',
    detail: 'Keep a simple record of visits, medications, and weight changes.',
  },
  {
    number: '02',
    title: 'Notice patterns',
    description:
      'Changes in appetite, thirst, energy, mobility, skin, or bathroom habits can be useful details to share with your care team.',
    detail: 'Note when a change began, how often it happens, and whether it is getting better or worse.',
  },
  {
    number: '03',
    title: 'Make visits more useful',
    description:
      'Bring a current list of medications and supplements, along with questions you want to cover.',
    detail: 'Photos or short videos can help explain changes you see at home.',
  },
]

export default function Awareness() {
  return (
    <>
      <Link to="/pets" className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
        ← Veterinary home
      </Link>

      <header className="mt-6 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent dark:text-teal-300">Veterinary</p>
        <h1 className="mt-2 text-3xl font-semibold">Pet health awareness</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Practical ways to stay ahead of routine care and share useful observations with your veterinarian.
        </p>
      </header>

      <section aria-label="Awareness topics" className="mt-8 grid gap-4 md:grid-cols-3">
        {topics.map((topic) => (
          <article
            key={topic.number}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#172220]"
          >
            <p className="text-sm font-semibold text-accent dark:text-teal-300">{topic.number}</p>
            <h2 className="mt-3 text-lg font-semibold">{topic.title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{topic.description}</p>
            <p className="mt-4 border-t border-slate-200 pt-3 text-sm dark:border-slate-700">{topic.detail}</p>
          </article>
        ))}
      </section>

      <aside className="mt-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
        If your pet has trouble breathing, collapses, or has uncontrolled bleeding, contact an emergency veterinary
        clinic. This information is general and does not replace advice from your veterinarian.
      </aside>

      <nav aria-label="More veterinary sections" className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/health-alerts"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong"
        >
          Browse health alerts
        </Link>
        <Link
          to="/appointments"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Plan a vet visit
        </Link>
      </nav>
    </>
  )
}