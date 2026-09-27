import { PawFilled } from '@mingcute/react/core-filled'
import { useLocation, useNavigate } from 'react-router'
import { ProfileCard as Card, ProfileRow as Row, SignOutButton } from '../components/ProfileCard'
import { ACTIVITY_LABELS, ENVIRONMENT_LABELS, useMe, type Pet } from '../lib/profile'

export default function Profile() {
  const { data: me } = useMe()
  const navigate = useNavigate()
  const location = useLocation()

  const goBack = () => (location.key === 'default' ? navigate('/pets', { replace: true }) : navigate(-1))

  if (!me) return null

  return (
    <>
      <button type="button" onClick={goBack} className="text-sm font-medium text-accent hover:underline dark:text-accent-light">
        ← Back
      </button>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Your profile</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">{me.role === 'VET' ? 'Veterinarian' : 'Pet guardian'}</p>
        </div>
        <SignOutButton />
      </div>

      <Card title="Account">
        <Row label="Email" value={me.email} />
        {me.guardian && <Row label="Phone" value={me.guardian.phone} />}
      </Card>

      {me.vet && (
        <Card title="Your practice">
          <Row label="Clinic" value={me.vet.clinicName} />
          <Row label="Address" value={me.vet.address} />
          <Row label="Email" value={me.vet.email} />
        </Card>
      )}

      {me.pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </>
  )
}

function PetCard({ pet }: { pet: Pet }) {
  const sex = { MALE: 'Male', FEMALE: 'Female', UNKNOWN: 'Unknown' }[pet.sex]
  return (
    <Card
      title={
        <span className="inline-flex items-center gap-2">
          <PawFilled size={20} className="text-accent dark:text-accent-light" />
          {pet.name}
        </span>
      }
    >
      <Row label="Species" value={[pet.species, pet.breed].filter(Boolean).join(' · ')} />
      <Row label="Sex" value={`${sex}${pet.neutered ? ' (spayed/neutered)' : ''}`} />
      <Row label="Age" value={pet.birthDate ? formatAge(pet.birthDate) : null} />
      <Row label="Life stage" value={lifeStage(pet)} />
      <Row label="Weight" value={pet.weightKg != null ? `${pet.weightKg} kg` : null} />
      <Row label="Indoor / outdoor" value={pet.environment && ENVIRONMENT_LABELS[pet.environment]} />
      <Row label="Activity level" value={pet.activityLevel && ACTIVITY_LABELS[pet.activityLevel]} />
      <Row label="Allergies" value={pet.allergies} />
      <Row label="Medications & prevention" value={pet.medications} />
      <Row label="Health history" value={pet.healthHistory} />
      <Row label="Vaccinations" value={pet.vaccinationHistory} />
    </Card>
  )
}

function ageInMonths(birthDate: string): number {
  const [y, m] = birthDate.split('-').map(Number)
  const now = new Date()
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m)
}

/**
 * Derived from age, so there's nothing extra to enter. Uses common general cut-offs (dogs senior from 7,
 * cats from 10); other species vary too much, so they get none.
 */
function lifeStage(pet: Pet): string | null {
  if (!pet.birthDate) return null
  const months = ageInMonths(pet.birthDate)
  const species = pet.species.toLowerCase()
  if (species === 'dog') return months < 12 ? 'Puppy' : months >= 7 * 12 ? 'Senior' : 'Adult'
  if (species === 'cat') return months < 12 ? 'Kitten' : months >= 10 * 12 ? 'Senior' : 'Adult'
  return null
}

function formatAge(birthDate: string): string {
  const months = ageInMonths(birthDate)
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `about ${rest} month${rest === 1 ? '' : 's'}`
  return `about ${years} year${years === 1 ? '' : 's'}${rest ? `, ${rest} month${rest === 1 ? '' : 's'}` : ''}`
}
