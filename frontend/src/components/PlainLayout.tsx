import { Outlet } from 'react-router'

/** Shell for sections without a navbar yet (Women): just a centered column. */
export default function PlainLayout() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Outlet />
    </main>
  )
}
