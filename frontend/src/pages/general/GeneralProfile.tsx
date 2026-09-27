import { ClipboardFilled } from '@mingcute/react/core-filled'
import { Link } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { ProfileCard, ProfileRow, SignOutButton } from '../../components/ProfileCard'
import { ErrorBanner, FullPageSpinner } from '../../components/ui'
import { errorMessage } from '../../lib/api'
import { SEX_LABELS, useHealthProfile } from '../../lib/healthProfile'

const linkStyle = 'text-sm font-medium text-accent hover:underline dark:text-accent-light'

/** General's Profile: the account and the user's Health Profile (Pets has its own profile with pet details). */
export default function GeneralProfile() {
  const { session } = useAuth()
  const health = useHealthProfile()

  return (
    <>
      <Link to="/general" className={linkStyle}>
        ← Back to General
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Your profile</h1>
        <SignOutButton />
      </div>

      <ProfileCard title="Account">
        <ProfileRow label="Email" value={session?.user.email ?? null} />
      </ProfileCard>

      {health.isPending ? (
        <FullPageSpinner />
      ) : health.isError ? (
        <div className="mt-6">
          <ErrorBanner message={errorMessage(health.error)} />
        </div>
      ) : health.data === null ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-[#1c1830]">
          <ClipboardFilled size={32} className="mx-auto text-accent dark:text-accent-light" />
          <h2 className="mt-2 text-lg font-semibold">Health Profile</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">You haven't filled in your Health Profile yet.</p>
          <Link
            to="/general/health-profile"
            className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Fill it in
          </Link>
        </section>
      ) : (
        <ProfileCard
          title={
            <span className="inline-flex items-center gap-2">
              <ClipboardFilled size={20} className="text-accent dark:text-accent-light" />
              Health Profile
            </span>
          }
          action={
            <Link to="/general/health-profile" className={linkStyle}>
              Edit
            </Link>
          }
        >
          <ProfileRow label="Age" value={String(health.data.age)} />
          <ProfileRow label="Sex" value={SEX_LABELS[health.data.sex]} />
          <ProfileRow label="Current conditions" value={health.data.currentConditions} />
          <ProfileRow label="Vaccinations" value={health.data.vaccinationHistory} />
          <ProfileRow label="Family history" value={health.data.familyHistory} />
        </ProfileCard>
      )}
    </>
  )
}
