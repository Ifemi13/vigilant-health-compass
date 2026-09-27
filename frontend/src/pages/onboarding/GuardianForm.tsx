import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../../auth/useAuth'
import { AuthCard, Button, ErrorBanner, Field, Input, Select, Textarea } from '../../components/ui'
import { ACTIVITY_LABELS, ENVIRONMENT_LABELS, type PetInput } from '../../lib/profile'
import { useSubmitOnboarding } from './useSubmitOnboarding'

const SPECIES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Reptile', 'Other'] as const
const LB_TO_KG = 0.45359237

const optionalWholeNumber = (max: number) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) <= max), `Enter a whole number from 0 to ${max}`)

const schema = z
  .object({
    phone: z
      .string()
      .trim()
      .min(7, 'Enter a phone number')
      .max(30)
      .regex(/^[+\d\s().-]+$/, 'Use digits, spaces and + ( ) - only'),
    name: z.string().trim().min(1, "Enter your pet's name").max(100),
    species: z.enum(SPECIES, { error: 'Choose a species' }),
    otherSpecies: z.string().trim().max(50),
    breed: z.string().trim().max(100),
    sex: z.enum(['MALE', 'FEMALE', 'UNKNOWN'], { error: 'Choose one' }),
    neutered: z.boolean(),
    ageYears: optionalWholeNumber(40),
    ageMonths: optionalWholeNumber(11),
    weight: z
      .string()
      .trim()
      .refine((v) => v === '' || (Number(v) > 0 && Number(v) < 5000), 'Enter a weight greater than 0'),
    weightUnit: z.enum(['kg', 'lb']),
    healthHistory: z.string().trim().max(5000),
    vaccinationHistory: z.string().trim().max(5000),
    allergies: z.string().trim().max(2000),
    environment: z.enum(['', 'INDOOR', 'OUTDOOR', 'BOTH']),
    activityLevel: z.enum(['', 'LOW', 'MODERATE', 'HIGH']),
    medications: z.string().trim().max(2000),
  })
  .refine((v) => v.species !== 'Other' || v.otherSpecies !== '', {
    path: ['otherSpecies'],
    message: 'Tell us the species',
  })

type FormValues = z.infer<typeof schema>

/** Age is asked in years + months but stored as an approximate birth date, so it never goes stale. */
function approximateBirthDate(years: string, months: string): string | null {
  if (years === '' && months === '') return null
  const totalMonths = Number(years || 0) * 12 + Number(months || 0)
  const today = new Date()
  const date = new Date(today.getFullYear(), today.getMonth() - totalMonths, Math.min(today.getDate(), 28))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toKg(weight: string, unit: 'kg' | 'lb'): number | null {
  if (weight === '') return null
  const kg = unit === 'lb' ? Number(weight) * LB_TO_KG : Number(weight)
  return Math.round(kg * 100) / 100
}

const orNull = (v: string) => (v === '' ? null : v)

export default function GuardianForm({ onBack }: { onBack: () => void }) {
  const { session } = useAuth()
  const { submit, error } = useSubmitOnboarding()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: '',
      name: '',
      otherSpecies: '',
      breed: '',
      neutered: false,
      ageYears: '',
      ageMonths: '',
      weight: '',
      weightUnit: 'kg',
      healthHistory: '',
      vaccinationHistory: '',
      allergies: '',
      environment: '',
      activityLevel: '',
      medications: '',
    },
  })
  const species = useWatch({ control, name: 'species' })

  const onSubmit = (v: FormValues) => {
    const pet: PetInput = {
      name: v.name,
      species: v.species === 'Other' ? v.otherSpecies : v.species,
      breed: orNull(v.breed),
      sex: v.sex,
      neutered: v.neutered,
      birthDate: approximateBirthDate(v.ageYears, v.ageMonths),
      weightKg: toKg(v.weight, v.weightUnit),
      healthHistory: orNull(v.healthHistory),
      vaccinationHistory: orNull(v.vaccinationHistory),
      allergies: orNull(v.allergies),
      environment: v.environment || null,
      activityLevel: v.activityLevel || null,
      medications: orNull(v.medications),
    }
    return submit({ role: 'GUARDIAN', phone: v.phone, pet })
  }

  return (
    <AuthCard wide title="Tell us about you and your pet" subtitle="You can add more pets later.">
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <Section title="Your contact details">
          <Field label="Email">
            <Input type="email" value={session?.user.email ?? ''} disabled readOnly />
          </Field>
          <Field label="Phone number" required error={errors.phone?.message}>
            <Input type="tel" autoComplete="tel" {...register('phone')} />
          </Field>
        </Section>

        <Section title="Your pet">
          <Field label="Name" required error={errors.name?.message}>
            <Input {...register('name')} />
          </Field>
          <Field label="Species" required error={errors.species?.message}>
            <Select defaultValue="" {...register('species')}>
              <option value="" disabled>
                Choose…
              </option>
              {SPECIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          {species === 'Other' && (
            <Field label="Which species?" required error={errors.otherSpecies?.message}>
              <Input {...register('otherSpecies')} />
            </Field>
          )}
          <Field label="Breed" error={errors.breed?.message}>
            <Input {...register('breed')} placeholder="e.g. Beagle, mixed" />
          </Field>
          <Field label="Sex" required error={errors.sex?.message}>
            <Select defaultValue="" {...register('sex')}>
              <option value="" disabled>
                Choose…
              </option>
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="UNKNOWN">Unknown</option>
            </Select>
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-accent" {...register('neutered')} />
            Spayed / neutered
          </label>
          <Field label="Age" error={errors.ageYears?.message ?? errors.ageMonths?.message} hint="Your best guess is fine">
            <div className="flex gap-2">
              <Input inputMode="numeric" placeholder="Years" aria-label="Age in years" {...register('ageYears')} />
              <Input inputMode="numeric" placeholder="Months" aria-label="Additional months" {...register('ageMonths')} />
            </div>
          </Field>
          <Field label="Weight" error={errors.weight?.message}>
            <div className="flex gap-2">
              <Input inputMode="decimal" aria-label="Weight" {...register('weight')} />
              <Select aria-label="Weight unit" className="w-24" {...register('weightUnit')}>
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </Select>
            </div>
          </Field>
        </Section>

        <Section title="Lifestyle">
          <Field label="Indoor / outdoor" error={errors.environment?.message}>
            <Select {...register('environment')}>
              <option value="">Not specified</option>
              {Object.entries(ENVIRONMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Activity level" error={errors.activityLevel?.message}>
            <Select {...register('activityLevel')}>
              <option value="">Not specified</option>
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </Section>

        <Section title="Health" oneColumn>
          <Field label="Health history" error={errors.healthHistory?.message} hint="Past conditions and surgeries">
            <Textarea {...register('healthHistory')} />
          </Field>
          <Field label="Vaccination history" error={errors.vaccinationHistory?.message} hint="Vaccines and roughly when they were given">
            <Textarea {...register('vaccinationHistory')} />
          </Field>
          <Field label="Allergies" error={errors.allergies?.message}>
            <Textarea rows={2} {...register('allergies')} placeholder="Leave blank if none known" />
          </Field>
          <Field
            label="Medications & prevention"
            error={errors.medications?.message}
            hint="Current medications, plus flea, tick and heartworm prevention"
          >
            <Textarea rows={2} {...register('medications')} placeholder="e.g. Monthly heartworm chew" />
          </Field>
        </Section>

        <div className="flex justify-between gap-3">
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

function Section({ title, children, oneColumn }: { title: string; children: React.ReactNode; oneColumn?: boolean }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold tracking-wide text-accent uppercase dark:text-teal-300">{title}</legend>
      <div className={`grid gap-4 ${oneColumn ? '' : 'sm:grid-cols-2'}`}>{children}</div>
    </fieldset>
  )
}
