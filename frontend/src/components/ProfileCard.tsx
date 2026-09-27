import { useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { Button } from './ui'

/** A titled card of label/value rows, used on the Pets and General profile pages. */
export function ProfileCard({ title, action, children }: { title: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#1c1830]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[9rem_1fr]">{children}</dl>
    </section>
  )
}

export function ProfileRow({ label, value }: { label: string; value: string | null }) {
  return (
    <>
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-sm whitespace-pre-line">{value || '—'}</dd>
    </>
  )
}

export function SignOutButton() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    queryClient.clear()
    navigate('/signin', { replace: true })
  }

  return (
    <Button variant="secondary" onClick={signOut}>
      Sign out
    </Button>
  )
}
