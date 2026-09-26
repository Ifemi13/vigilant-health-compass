import { Link, Navigate, NavLink, Outlet } from 'react-router'
import { errorMessage } from '../lib/api'
import { useMe } from '../lib/profile'
import { Button, ErrorBanner, FullPageSpinner, Logo } from './ui'

/** Shell for signed-in, onboarded users: navbar on top, the current page below. */
export default function AppLayout() {
  const me = useMe()

  if (me.isPending) return <FullPageSpinner />
  if (me.data === null) return <Navigate to="/onboarding" replace />

  const initial = (me.data?.email ?? '?').charAt(0).toUpperCase()

  return (
    <div className="min-h-svh">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#172220]">
        <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link to="/" aria-label="Home">
            <Logo />
          </Link>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-accent-soft/60 dark:hover:bg-accent/20 ${
                isActive ? 'bg-accent-soft/60 text-accent-strong dark:bg-accent/20 dark:text-teal-300' : ''
              }`
            }
          >
            <span aria-hidden>🐾</span>
            Veterinary
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-medium transition-colors hover:bg-accent-soft/60 dark:hover:bg-accent/20 ${
                isActive ? 'bg-accent-soft/60 dark:bg-accent/20' : ''
              }`
            }
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white" aria-hidden>
              {initial}
            </span>
            Profile
          </NavLink>
        </nav>
      </header>
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
