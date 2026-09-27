import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { AuthCard, Button, ErrorBanner, Field, Input } from '../components/ui'
import { supabase } from '../lib/supabase'

const schema = z
  .object({
    email: z.email('Enter a valid email'),
    password: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function SignUp() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [confirmEmailSentTo, setConfirmEmailSentTo] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email, password }: FormValues) => {
    setError(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    if (!data.session) {
      // "Confirm email" is enabled in Supabase: no session until the link is clicked.
      setConfirmEmailSentTo(email)
      return
    }
    // Pet onboarding happens when they first open the Pets section.
    navigate('/', { replace: true })
  }

  if (confirmEmailSentTo) {
    return (
      <AuthCard title="Check your email">
        <p className="text-sm">
          We sent a confirmation link to <strong>{confirmEmailSentTo}</strong>. Click it, then{' '}
          <Link to="/signin" className="font-medium text-accent hover:underline dark:text-accent-light">
            sign in
          </Link>{' '}
          to finish setting up your profile.
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle={
        <>
          Already have one?{' '}
          <Link to="/signin" className="font-medium text-accent hover:underline dark:text-accent-light">
            Sign in
          </Link>
        </>
      }
    >
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message} hint="At least 8 characters">
          <Input type="password" autoComplete="new-password" {...register('password')} />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating account…' : 'Continue'}
        </Button>
      </form>
    </AuthCard>
  )
}
