import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button, Select } from '../components/ui'
import { useMe, type Pet } from '../lib/profile'

type VisitType = 'ROUTINE_CHECKUP' | 'VACCINATION' | 'DENTAL' | 'MEDICAL_CONCERN' | 'OTHER'
type VisitStatus = 'BOOKED' | 'COMPLETED' | 'CANCELLED'

interface DemoClinic {
  id: string
  name: string
  area: string
  veterinarian: string
}

interface DemoAppointment {
  id: string
  petId: string | null
  petName: string
  clinicId: string | null
  clinicName: string | null
  clinicArea: string | null
  veterinarian: string | null
  appointmentDate: string
  appointmentTime: string | null
  appointmentType: VisitType
  notes: string | null
  status: VisitStatus
}

const STORAGE_KEY_PREFIX = 'vhc-demo-appointments:'
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DEMO_CLINICS: DemoClinic[] = [
  { id: 'demo-east', name: 'Badgerland Animal Care', area: 'East Madison', veterinarian: 'Dr. Riley Morgan' },
  { id: 'demo-central', name: 'Isthmus Veterinary Center', area: 'Central Madison', veterinarian: 'Dr. Avery Brooks' },
  { id: 'demo-west', name: 'Lakeshore Pet Hospital', area: 'West Madison', veterinarian: 'Dr. Jordan Ellis' },
]
const DEMO_TIMES = ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM']
const VISIT_TYPES: { value: VisitType; label: string }[] = [
  { value: 'ROUTINE_CHECKUP', label: 'Routine check-up' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'DENTAL', label: 'Dental care' },
  { value: 'MEDICAL_CONCERN', label: 'Medical concern' },
  { value: 'OTHER', label: 'Other visit' },
]
const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  ROUTINE_CHECKUP: 'Routine check-up',
  VACCINATION: 'Vaccination',
  DENTAL: 'Dental care',
  MEDICAL_CONCERN: 'Medical concern',
  OTHER: 'Other visit',
}

export default function MockAppointments() {
  const me = useMe()
  if (!me.data) return null
  return <AppointmentsCalendar key={me.data.id} userId={me.data.id} pets={me.data.pets} />
}

function AppointmentsCalendar({ userId, pets }: { userId: string; pets: Pet[] }) {
  const [appointments, setAppointments] = useState<DemoAppointment[]>(() => readAppointments(userId))
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()))
  const [selectedPetId, setSelectedPetId] = useState(() => pets[0]?.id ?? '')
  const [petName, setPetName] = useState('')
  const [clinicId, setClinicId] = useState(DEMO_CLINICS[0].id)
  const [selectedTime, setSelectedTime] = useState(DEMO_TIMES[0])
  const [visitType, setVisitType] = useState<VisitType>('ROUTINE_CHECKUP')
  const [notes, setNotes] = useState('')
  const [checkupDate, setCheckupDate] = useState('')
  const [showCheckupForm, setShowCheckupForm] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    saveAppointments(userId, appointments)
  }, [appointments, userId])

  const activePet = pets.find((pet) => pet.id === selectedPetId)
  const petLookupName = activePet?.name ?? petName.trim()
  const today = dateKey(new Date())
  const selectedDayAppointments = appointments.filter((item) => item.appointmentDate === selectedDate && item.status !== 'CANCELLED')
  const calendarAppointments = useMemo(() => {
    const grouped = new Map<string, number>()
    for (const appointment of appointments) {
      if (appointment.status !== 'CANCELLED') {
        grouped.set(appointment.appointmentDate, (grouped.get(appointment.appointmentDate) ?? 0) + 1)
      }
    }
    return grouped
  }, [appointments])

  const forActivePet = (appointment: DemoAppointment) => activePet
    ? appointment.petId === activePet.id
    : petLookupName.length > 0 && appointment.petName.toLocaleLowerCase() === petLookupName.toLocaleLowerCase()

  const lastCheckup = appointments
    .filter((item) => item.status === 'COMPLETED' && item.appointmentType === 'ROUTINE_CHECKUP' && forActivePet(item))
    .sort((first, second) => second.appointmentDate.localeCompare(first.appointmentDate))[0]
  const nextCheckupDate = lastCheckup ? addMonths(lastCheckup.appointmentDate, 6) : null
  const daysUntilCheckup = nextCheckupDate ? daysBetween(today, nextCheckupDate) : null
  const wellnessDue = daysUntilCheckup !== null && daysUntilCheckup <= 30

  const upcomingAppointments = appointments
    .filter((item) => item.status === 'BOOKED' && item.appointmentDate >= today)
    .sort((first, second) => first.appointmentDate.localeCompare(second.appointmentDate) || (first.appointmentTime ?? '').localeCompare(second.appointmentTime ?? ''))
  const pastVisits = appointments
    .filter((item) => item.status === 'COMPLETED' || (item.status !== 'CANCELLED' && item.appointmentDate < today))
    .sort((first, second) => second.appointmentDate.localeCompare(first.appointmentDate))

  const availableTimes = DEMO_TIMES.filter((time) => !appointments.some((appointment) =>
    appointment.clinicId === clinicId
      && appointment.appointmentDate === selectedDate
      && appointment.appointmentTime === time
      && appointment.status === 'BOOKED',
  ))

  const moveMonth = (offset: number) => {
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + offset, 1)
    setMonth(nextMonth)
    if (!selectedDate.startsWith(`${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}`)) {
      setSelectedDate(dateKey(nextMonth))
    }
  }

  const bookAppointment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const clinic = DEMO_CLINICS.find((item) => item.id === clinicId)
    if (!clinic || !availableTimes.includes(selectedTime)) {
      setMessage('Choose one of the available times.')
      return
    }
    if (!activePet && !petLookupName) {
      setMessage('Enter a pet name to continue.')
      return
    }

    const appointment: DemoAppointment = {
      id: createId(),
      petId: activePet?.id ?? null,
      petName: activePet?.name ?? petLookupName,
      clinicId: clinic.id,
      clinicName: clinic.name,
      clinicArea: clinic.area,
      veterinarian: clinic.veterinarian,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      appointmentType: visitType,
      notes: notes.trim() || null,
      status: 'BOOKED',
    }
    setAppointments((current) => [...current, appointment])
    setNotes('')
    setMessage('Appointment added to your calendar.')
  }

  const recordCheckup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!checkupDate || (!activePet && !petLookupName)) {
      setMessage('Enter the pet and date of their last check-up.')
      return
    }
    const appointment: DemoAppointment = {
      id: createId(),
      petId: activePet?.id ?? null,
      petName: activePet?.name ?? petLookupName,
      clinicId: null,
      clinicName: null,
      clinicArea: null,
      veterinarian: null,
      appointmentDate: checkupDate,
      appointmentTime: null,
      appointmentType: 'ROUTINE_CHECKUP',
      notes: null,
      status: 'COMPLETED',
    }
    setAppointments((current) => [...current, appointment])
    setShowCheckupForm(false)
    setCheckupDate('')
    setMessage('Check-up history saved.')
  }

  const updateStatus = (id: string, status: VisitStatus) => {
    setAppointments((current) => current.map((item) => item.id === id ? { ...item, status } : item))
  }

  return (
    <>
      <Link to="/pets" className="text-sm font-medium text-accent hover:underline dark:text-teal-300">← Back to pet care</Link>
      <header className="mt-5 border-b border-slate-200 pb-5 dark:border-slate-800">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent dark:text-teal-300">Madison, Wisconsin</p>
        <h1 className="mt-2 text-3xl font-semibold">Pet appointments</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Choose a date, veterinarian, and available time for your pet’s next visit.
        </p>
      </header>

      {message && <p className="mt-4 rounded-lg border border-accent/30 bg-accent-soft/30 p-3 text-sm dark:border-teal-800 dark:bg-teal-950/30" role="status">{message}</p>}

      {wellnessDue && nextCheckupDate && lastCheckup && (
        <aside className={`mt-5 rounded-lg border p-4 ${daysUntilCheckup !== null && daysUntilCheckup < 0
          ? 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-[#172220]'}`}>
          <h2 className="font-semibold">{daysUntilCheckup !== null && daysUntilCheckup < 0 ? 'A wellness check-in may be due' : 'A wellness check-in is coming up'}</h2>
          <p className="mt-1 text-sm">{activePet?.name ?? petLookupName}’s last recorded routine check-up was {formatDate(lastCheckup.appointmentDate)}. Six months falls on {formatDate(nextCheckupDate)}.</p>
          <p className="mt-1 text-xs opacity-80">A general reminder only; timing depends on your pet’s age, health, and veterinarian’s advice.</p>
        </aside>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <section aria-labelledby="calendar-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="calendar-heading" className="text-xl font-semibold">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:border-accent dark:border-slate-700">Prev</button>
              <button type="button" aria-label="Next month" onClick={() => moveMonth(1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:border-accent dark:border-slate-700">Next</button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 border-l border-t border-slate-200 dark:border-slate-800">
            {WEEKDAYS.map((weekday) => <div key={weekday} className="border-b border-r border-slate-200 py-2 text-center text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">{weekday}</div>)}
            {calendarDays(month).map((day) => {
              const key = dateKey(day)
              const isCurrentMonth = day.getMonth() === month.getMonth()
              const isSelected = key === selectedDate
              const hasAppointment = (calendarAppointments.get(key) ?? 0) > 0
              return (
                <button key={key} type="button" aria-pressed={isSelected} aria-label={`${day.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}${hasAppointment ? ', appointment saved' : ''}`} onClick={() => setSelectedDate(key)} className={`relative flex aspect-square min-h-11 flex-col items-center justify-center border-b border-r border-slate-200 text-sm transition-colors dark:border-slate-800 ${isSelected ? 'bg-accent text-white' : 'hover:bg-accent-soft/50 dark:hover:bg-accent/15'} ${isCurrentMonth ? '' : 'text-slate-400 dark:text-slate-600'}`}>
                  <span className={key === today && !isSelected ? 'font-bold text-accent dark:text-teal-300' : ''}>{day.getDate()}</span>
                  {hasAppointment && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-accent dark:bg-teal-300'}`} aria-hidden />}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Dots mark appointments or recorded check-ups.</p>
        </section>

        <section className="border-t border-slate-200 pt-5 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0 dark:border-slate-800" aria-labelledby="selected-day-heading">
          <h2 id="selected-day-heading" className="text-lg font-semibold">{formatDate(selectedDate)}</h2>
          {selectedDayAppointments.length > 0 && <div className="mt-3 border-b border-slate-200 pb-4 dark:border-slate-800"><h3 className="text-sm font-semibold">Scheduled for this day</h3>{selectedDayAppointments.map((item) => <p key={item.id} className="mt-2 text-sm">{item.petName} · {item.clinicName ?? 'Check-up history'} · {item.status === 'COMPLETED' ? 'Completed' : 'Booked'}</p>)}</div>}

          {selectedDate < today ? (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">This date has passed. Record a completed routine check-up below to start a wellness reminder.</p>
          ) : (
            <form onSubmit={bookAppointment} className="mt-4 space-y-4">
              <h3 className="text-sm font-semibold">Available veterinarians</h3>
              {pets.length > 0 && (
                <label className="block text-sm font-medium">Pet
                  <Select value={activePet?.id ?? ''} onChange={(event) => setSelectedPetId(event.target.value)} className="mt-1">
                    {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name} · {pet.species}</option>)}
                    <option value="other">Other pet</option>
                  </Select>
                </label>
              )}
              {!activePet && (
                <label className="block text-sm font-medium">Pet name
                  <input required maxLength={100} value={petName} onChange={(event) => setPetName(event.target.value)} placeholder="Enter your pet’s name" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal dark:border-slate-700 dark:bg-[#172220]" />
                </label>
              )}

              <label className="block text-sm font-medium">Clinic
                <Select value={clinicId} onChange={(event) => setClinicId(event.target.value)} className="mt-1">
                  {DEMO_CLINICS.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.name} · {clinic.area}</option>)}
                </Select>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">Veterinarian: {DEMO_CLINICS.find((clinic) => clinic.id === clinicId)?.veterinarian}</p>

              <fieldset>
                <legend className="text-sm font-semibold">Available times</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {availableTimes.length > 0 ? availableTimes.map((time) => (
                    <button key={time} type="button" aria-pressed={selectedTime === time} onClick={() => setSelectedTime(time)} className={`rounded-lg border px-2 py-2 text-sm ${selectedTime === time ? 'border-accent bg-accent text-white' : 'border-slate-300 hover:border-accent dark:border-slate-700'}`}>{time}</button>
                  )) : <p className="col-span-3 text-sm text-slate-500">All times are booked. Choose another clinic or date.</p>}
                </div>
              </fieldset>

              <label className="block text-sm font-medium">Visit reason
                <Select value={visitType} onChange={(event) => setVisitType(event.target.value as VisitType)} className="mt-1">
                  {VISIT_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
              </label>
              <label className="block text-sm font-medium">Note <span className="font-normal text-slate-500">(optional)</span>
                <textarea rows={2} maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-[#172220]" />
              </label>
              <Button type="submit" disabled={availableTimes.length === 0 || !availableTimes.includes(selectedTime)}>Book appointment</Button>
            </form>
          )}
        </section>
      </div>

      <section className="mt-8 border-t border-slate-200 pt-5 dark:border-slate-800" aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="text-lg font-semibold">Upcoming appointments</h2>
        {upcomingAppointments.length === 0 ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No upcoming appointments.</p>
          : <div className="mt-2 divide-y divide-slate-200 dark:divide-slate-800">{upcomingAppointments.map((appointment) => <AppointmentRow key={appointment.id} appointment={appointment} onAction={updateStatus} />)}</div>}
      </section>

      {pastVisits.length > 0 && <section className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800"><h2 className="text-lg font-semibold">Past visits and check-ups</h2><div className="mt-2 divide-y divide-slate-200 dark:divide-slate-800">{pastVisits.map((appointment) => <AppointmentRow key={appointment.id} appointment={appointment} onAction={updateStatus} />)}</div></section>}

      <section className="mt-8 border-t border-slate-200 pt-5 dark:border-slate-800" aria-labelledby="wellness-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="wellness-heading" className="text-lg font-semibold">Six-month wellness reminder</h2>
            {lastCheckup && nextCheckupDate
              ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Last recorded check-up for {lastCheckup.petName}: {formatDate(lastCheckup.appointmentDate)}. Six months later: {formatDate(nextCheckupDate)}.</p>
              : <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Record a past routine check-up to start a reminder. This interval is only a general prompt.</p>}
          </div>
          <Button type="button" variant="secondary" onClick={() => setShowCheckupForm((show) => !show)}>{showCheckupForm ? 'Close' : 'Record last check-up'}</Button>
        </div>
        {showCheckupForm && (
          <form onSubmit={recordCheckup} className="mt-4 flex flex-wrap items-end gap-3">
            {!activePet && <label className="min-w-48 flex-1 text-sm font-medium">Pet name<input required maxLength={100} value={petName} onChange={(event) => setPetName(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal dark:border-slate-700 dark:bg-[#172220]" /></label>}
            <label className="text-sm font-medium">Last check-up date<input required type="date" max={today} value={checkupDate} onChange={(event) => setCheckupDate(event.target.value)} className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#172220]" /></label>
            <Button type="submit">Save check-up</Button>
          </form>
        )}
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Reminders are informational, not medical advice. Your veterinarian may recommend a different schedule.</p>
      </section>
    </>
  )
}

function AppointmentRow({ appointment, onAction }: { appointment: DemoAppointment; onAction: (id: string, status: VisitStatus) => void }) {
  return (
    <article className="flex flex-wrap items-start justify-between gap-3 py-4">
      <div>
        <h3 className="font-semibold">{appointment.petName} · {VISIT_TYPE_LABELS[appointment.appointmentType]}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{formatDate(appointment.appointmentDate)}{appointment.appointmentTime ? ` · ${appointment.appointmentTime}` : ''}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{appointment.clinicName ?? 'Recorded check-up'}{appointment.clinicArea ? ` · ${appointment.clinicArea}` : ''}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{appointment.status === 'COMPLETED' ? 'Completed' : appointment.status === 'CANCELLED' ? 'Cancelled' : 'Booked'}</p>
      </div>
      {appointment.status === 'BOOKED' && (
        <div className="flex gap-2">
          {appointment.appointmentDate <= dateKey(new Date()) && <Button type="button" variant="secondary" onClick={() => onAction(appointment.id, 'COMPLETED')}>Mark completed</Button>}
          <button type="button" onClick={() => onAction(appointment.id, 'CANCELLED')} className="px-2 py-2 text-sm font-medium text-slate-500 underline">Cancel</button>
        </div>
      )}
    </article>
  )
}

function readAppointments(userId: string): DemoAppointment[] {
  if (typeof window === 'undefined') return []
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`) ?? '[]')
    return Array.isArray(value) ? value as DemoAppointment[] : []
  } catch {
    return []
  }
}

function saveAppointments(userId: string, appointments: DemoAppointment[]): void {
  try {
    window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(appointments))
  } catch {
    // The page remains usable if browser storage is unavailable.
  }
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function calendarDays(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const mondayOffset = (first.getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset + index))
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatDate(date: Date | string): string {
  const parsed = typeof date === 'string' ? new Date(`${date}T12:00:00`) : date
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function addMonths(dateString: string, amount: number): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const targetMonth = new Date(year, month - 1 + amount, 1)
  const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
  return dateKey(new Date(targetMonth.getFullYear(), targetMonth.getMonth(), Math.min(day, lastDay)))
}

function daysBetween(first: string, second: string): number {
  const start = new Date(`${first}T00:00:00`)
  const end = new Date(`${second}T00:00:00`)
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}