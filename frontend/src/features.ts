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
    description: 'Outbreaks, recalls and warnings that may affect your pet.',
    icon: '🚨',
  },
  {
    path: '/appointments',
    title: 'Appointment',
    description: 'Book and keep track of vet visits.',
    icon: '📅',
  },
  {
    path: '/affordability',
    title: 'Affordability',
    description: 'Understand costs and find ways to save on care.',
    icon: '💰',
  },
]
