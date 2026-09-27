import { SPECIES_LABELS, type Species } from '../lib/clinics'

/** Dog / Cat segmented control. */
export default function SpeciesToggle({ value, onChange }: { value: Species; onChange: (species: Species) => void }) {
  return (
    <div role="radiogroup" aria-label="Species" className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700">
      {(Object.keys(SPECIES_LABELS) as Species[]).map((species) => {
        const selected = species === value
        return (
          <button
            key={species}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(species)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-accent/30 focus:outline-none ${
              selected ? 'bg-accent text-white' : 'text-slate-600 hover:text-accent dark:text-slate-300 dark:hover:text-teal-300'
            }`}
          >
            {species === 'dog' ? '🐶' : '🐱'} {SPECIES_LABELS[species]}
          </button>
        )
      })}
    </div>
  )
}
