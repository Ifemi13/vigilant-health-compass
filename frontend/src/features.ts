import type { IconProps } from '@mingcute/react'
import { Book2Filled, CalendarFilled, PigMoneyFilled, WarningFilled } from '@mingcute/react/core-filled'
import type { ComponentType } from 'react'

/** A MingCute icon component (or one with the same props). */
export type IconComponent = ComponentType<IconProps>

export interface Feature {
  path: string
  title: string
  description: string
  icon: IconComponent
}

/** The sections linked from the home page tiles. */
export const FEATURES: Feature[] = [
  {
    path: '/awareness',
    title: 'Awareness',
    description: 'Learn about common conditions, nutrition and preventive care.',
    icon: Book2Filled,
  },
  {
    path: '/health-alerts',
    title: 'Health alert',
    description: 'Recent Madison-area notices about risks that may affect pets.',
    icon: WarningFilled,
  },
  {
    path: '/appointments',
    title: 'Appointments',
    description: 'Book vet visits, keep track of appointments, and get wellness reminders.',
    icon: CalendarFilled,
  },
  {
    path: '/affordability',
    title: 'Affordability',
    description: 'Understand costs and find ways to save on care.',
    icon: PigMoneyFilled,
  },
]
