import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../../auth/useAuth'
import { AuthCard, Button, ErrorBanner, Field, Input, Textarea } from '../../components/ui'
import { useSubmitOnboarding } from './useSubmitOnboarding'

const schema = z.object({
  clinicName: z.string().trim().min(1, 'Enter the hospital or clinic name').max(200),
  address: z.string().trim().min(1, 'Enter the address').max(500),
  email: z.email('Enter a valid email').max(320),
})

type FormValues = z.infer<typeof schema>

export default function VetForm({ onBack }: { onBack: () => void }) {
  const { session } = useAuth()
  const { submit, error } = useSubmitOnboarding()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { clinicName: '', address: '', email: session?.user.email ?? '' },
  })

  return (
    <AuthCard title="Tell us about your practice">
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit((v) => submit({ role: 'VET', ...v }))} className="space-y-4" noValidate>
        <Field label="Hospital / clinic name" required error={errors.clinicName?.message}>
          <Input autoComplete="organization" {...register('clinicName')} />
        </Field>
        <Field label="Address" required error={errors.address?.message}>
          <Textarea autoComplete="street-address" {...register('address')} />
        </Field>
        <Field label="Email" required error={errors.email?.message} hint="Where clients and colleagues can reach you">
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <div className="flex justify-between gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Finish'}
          </Button>
        </div>
      </form>
    </AuthCard>
  )
}
