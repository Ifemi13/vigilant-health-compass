import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Button, ErrorBanner, Field, FullPageSpinner, Input, Select, Textarea } from '../../components/ui'
import { errorMessage } from '../../lib/api'
import { SEX_LABELS, useHealthProfile, useSaveHealthProfile, type HealthProfile as Profile, type HealthProfileSex } from '../../lib/healthProfile'

const schema = z.object({
  age: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, 'Enter your age in years')
    .refine((v) => Number(v) <= 120, 'Enter an age from 0 to 120'),
  sex: z.enum(Object.keys(SEX_LABELS) as [HealthProfileSex, ...HealthProfileSex[]], { error: 'Choose one' }),
  currentConditions: z.string().trim().min(1, "Describe your current conditions, or write 'None'").max(2000),
  vaccinationHistory: z.string().trim().max(2000),
  familyHistory: z.string().trim().max(2000),
})

type FormValues = z.infer<typeof schema>

function toForm(profile: Profile | null): Partial<FormValues> {
  if (!profile) return { age: '', currentConditions: '', vaccinationHistory: '', familyHistory: '' }
  return {
    age: String(profile.age),
    sex: profile.sex,
    currentConditions: profile.currentConditions,
    vaccinationHistory: profile.vaccinationHistory ?? '',
    familyHistory: profile.familyHistory ?? '',
  }
}

export default function HealthProfile() {
  const profile = useHealthProfile()

  const backLink = (
    <Link to="/general" className="text-sm font-medium text-accent hover:underline dark:text-teal-300">
      ← Back to General
    </Link>
  )

  if (profile.isPending) return <FullPageSpinner />
  if (profile.isError) {
    return (
      <>
        {backLink}
        <div className="mt-6">
          <ErrorBanner message={errorMessage(profile.error)} />
        </div>
      </>
    )
  }

  return (
    <>
      {backLink}
      <h1 className="mt-4 text-3xl font-semibold">📋 Health Profile</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Your age and sex are shown next to your posts in hospital communities. Everything else stays private to you.
      </p>
      <ProfileForm initial={profile.data} />
    </>
  )
}

function ProfileForm({ initial }: { initial: Profile | null }) {
  const save = useSaveHealthProfile()
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(initial?.updatedAt ?? null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toForm(initial) })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      const saved = await save.mutateAsync({
        age: Number(values.age),
        sex: values.sex,
        currentConditions: values.currentConditions,
        vaccinationHistory: values.vaccinationHistory || null,
        familyHistory: values.familyHistory || null,
      })
      setSavedAt(saved.updatedAt)
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#172220]"
    >
      <ErrorBanner message={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Age" required error={errors.age?.message}>
          <Input inputMode="numeric" {...register('age')} />
        </Field>
        <Field label="Sex" required error={errors.sex?.message}>
          <Select defaultValue="" {...register('sex')}>
            <option value="" disabled>
              Choose…
            </option>
            {Object.entries(SEX_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Current Condition" required error={errors.currentConditions?.message} hint="Ongoing conditions or diagnoses. Write 'None' if you don't have any.">
        <Textarea {...register('currentConditions')} />
      </Field>
      <Field label="Vaccination History" error={errors.vaccinationHistory?.message} hint="Optional. Vaccines and roughly when you had them.">
        <Textarea {...register('vaccinationHistory')} />
      </Field>
      <Field label="Family History" error={errors.familyHistory?.message} hint="Optional. Conditions that run in your family, e.g. heart disease or cancer.">
        <Textarea {...register('familyHistory')} />
      </Field>
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        {savedAt && !isDirty && (
          <span className="mr-auto text-sm text-slate-500 dark:text-slate-400">
            ✓ Saved {new Date(savedAt).toLocaleString()}
          </span>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
