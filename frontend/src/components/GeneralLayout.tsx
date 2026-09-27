import { CompassFilled } from '@mingcute/react/core-filled'
import { Outlet } from 'react-router'
import Navbar from './Navbar'

/** Shell for the General section: the same navbar as Pets, but no pet onboarding required. */
export default function GeneralLayout() {
  return (
    <div className="min-h-svh">
      <Navbar section={{ to: '/general', label: 'General', icon: CompassFilled }} />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  )
}
