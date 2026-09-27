import { PawFilled } from '@mingcute/react/core-filled'
import { Navigate, Outlet } from 'react-router'
import { errorMessage } from '../lib/api'
import { useMe } from '../lib/profile'
import Navbar from './Navbar'
import { Button, ErrorBanner, FullPageSpinner } from './ui'

/** Shell for the Pets section: navbar on top, and only for users who finished pet onboarding. */
export default function AppLayout() {
  const me = useMe()

  if (me.isPending) return <FullPageSpinner />
  if (me.data === null) return <Navigate to="/onboarding" replace />

  return (
    <div className="min-h-svh">
      <Navbar section={{ to: '/pets', label: 'Veterinary', icon: PawFilled }} profileTo="/profile" />
      <main className="mx-auto max-w-4xl px-4 py-10">
        {me.isError ? (
          <>
            <ErrorBanner message={errorMessage(me.error)} />
            <Button onClick={() => me.refetch()}>Try again</Button>
          </>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}
