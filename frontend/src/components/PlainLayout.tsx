import { Outlet } from 'react-router'

/** Shell for pages outside Pets (e.g. General): no navbar, just a centered column. */
export default function PlainLayout() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Outlet />
    </main>
  )
}
