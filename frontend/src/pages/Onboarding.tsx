import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { AuthCard, Button, ErrorBanner, FullPageSpinner } from '../components/ui'
import { errorMessage } from '../lib/api'
import { useMe, type Role } from '../lib/profile'
import GuardianForm from './onboarding/GuardianForm'
import VetForm from './onboarding/VetForm'

const ROLE_OPTIONS: { role: Role; title: string; description: string; icon: string }[] = [
  { role: 'GUARDIAN', title: 'Pet guardian', description: 'I care for one or more pets.', icon: '🐾' },
  { role: 'VET', title: 'Veterinarian', description: 'I work at a vet hospital or clinic.', icon: '🩺' },
]

export default function Onboarding() {
  const me = useMe()
  const [role, setRole] = useState<Role | null>(null)

  if (me.isPending) return <FullPageSpinner />
  if (me.data) return <Navigate to="/pets" replace />

  if (me.isError) {
    return (
      <AuthCard title="Set up your profile">
        <ErrorBanner message={errorMessage(me.error)} />
        <Button onClick={() => me.refetch()}>Try again</Button>
      </AuthCard>
    )
  }

  if (role === 'GUARDIAN') return <GuardianForm onBack={() => setRole(null)} />
  if (role === 'VET') return <VetForm onBack={() => setRole(null)} />

  return (
    <AuthCard title="Are you a vet or a pet guardian?" subtitle="This helps us set up the right profile for you.">
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLE_OPTIONS.map((option) => (
          <button
            key={option.role}
            type="button"
            onClick={() => setRole(option.role)}
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-accent hover:bg-accent-soft/40 focus:ring-2 focus:ring-accent/30 focus:outline-none dark:border-slate-700 dark:hover:bg-accent/15"
          >
            <span className="text-3xl" aria-hidden>
              {option.icon}
            </span>
            <span className="mt-2 block font-semibold">{option.title}</span>
            <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{option.description}</span>
          </button>
        ))}
      </div>
      <Link to="/" className="mt-6 inline-block text-sm font-medium text-accent hover:underline dark:text-teal-300">
        ← Back
      </Link>
    </AuthCard>
  )
}
