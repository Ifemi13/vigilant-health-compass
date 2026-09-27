import { Link, NavLink } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { Logo } from './ui'

/** The section a navbar belongs to, e.g. Pets or General; its link is highlighted on that section's home. */
export interface NavSection {
  to: string
  label: string
  icon: string
}

/** Top bar shared by the Pets and General sections: logo (to the home screen), section link, Profile. */
export default function Navbar({ section }: { section: NavSection }) {
  const { session } = useAuth()
  const initial = (session?.user.email ?? '?').charAt(0).toUpperCase()

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#172220]">
      <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <Link to="/" aria-label="Home screen">
          <Logo />
        </Link>
        <NavLink
          to={section.to}
          end
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-accent-soft/60 dark:hover:bg-accent/20 ${
              isActive ? 'bg-accent-soft/60 text-accent-strong dark:bg-accent/20 dark:text-teal-300' : ''
            }`
          }
        >
          <span aria-hidden>{section.icon}</span>
          {section.label}
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
  )
}
