import { CompassFilled } from '@mingcute/react/core-filled'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'

export function Logo() {
  return (
    <span className="inline-flex items-center gap-1.5 text-lg font-bold text-accent dark:text-teal-300">
      <CompassFilled size={22} />
      Vigilant Health Compass
    </span>
  )
}

/** Centered card used by the sign-in, sign-up and onboarding screens. */
export function AuthCard({ title, subtitle, children, wide }: { title: string; subtitle?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="mb-6">
        <Logo />
      </div>
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-[#172220]`}>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}

export function Field({ label, error, hint, children, required }: { label: string; error?: string; hint?: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  )
}

const control =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-[#0f1716] dark:disabled:bg-slate-800'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input ref={ref} {...props} className={`${control} ${props.className ?? ''}`} />
))

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>((props, ref) => (
  <select ref={ref} {...props} className={`${control} ${props.className ?? ''}`} />
))

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
  <textarea ref={ref} rows={3} {...props} className={`${control} ${props.className ?? ''}`} />
))

const BUTTON_STYLES = {
  primary: 'bg-accent text-white hover:bg-accent-strong disabled:opacity-60',
  secondary: 'border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:hover:bg-slate-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60',
}

export function Button({ variant = 'primary', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BUTTON_STYLES }) {
  const styles = BUTTON_STYLES[variant]
  return <button {...props} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles} ${className ?? ''}`} />
}

export function ErrorBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null
  return (
    <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {message}
    </div>
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
    </div>
  )
}
