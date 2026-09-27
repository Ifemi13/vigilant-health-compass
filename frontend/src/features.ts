export interface Feature {
  path: string
  title: string
  description: string
  icon: string
}

/** The sections linked from the home page tiles. */
export const FEATURES: Feature[] = [
  {
    path: '/awareness',
    title: 'Awareness',
    description: 'Learn about common conditions, nutrition and preventive care.',
    icon: '📚',
  },
  {
    path: '/health-alerts',
    title: 'Health alert',
    description: 'Recent Madison-area notices about risks that may affect pets.',
    icon: '🚨',
  },
  {
    path: '/appointments',
    title: 'Appointments',
    description: 'Book vet visits, keep track of appointments, and get wellness reminders.',
    icon: '📅',
  },
  {
    path: '/affordability',
    title: 'Affordability',
    description: 'Understand costs and find ways to save on care.',
    icon: '💰',
  },
]
