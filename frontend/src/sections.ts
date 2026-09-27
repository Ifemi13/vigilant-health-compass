import type { Feature } from './features'

/** The top-level sections shown on the home screen. */
export const SECTIONS: Feature[] = [
  {
    path: '/general',
    title: 'General',
    description: 'Health information and support for everyone.',
    icon: '🧭',
  },
  {
    path: '/women',
    title: 'Women',
    description: "Health information and support for women's health.",
    icon: '👩',
  },
  {
    path: '/pets',
    title: 'Pets',
    description: 'Care, prices and support for your pets.',
    icon: '🐾',
  },
]

/** The panels inside the General section. */
export const GENERAL_PANELS: Feature[] = [
  {
    path: '/general/awareness',
    title: 'Awareness',
    description: 'Short guides to common health topics, from heart health to medication safety.',
    icon: '📚',
  },
  {
    path: '/general/calendar',
    title: 'Preventive health calendar',
    description: 'Keep track of the checkups, screenings and vaccines you are due for.',
    icon: '🗓️',
  },
  {
    path: '/general/near-me',
    title: 'Healthcare near me',
    description: 'Find clinics, pharmacies and other care close to you.',
    icon: '📍',
  },
]
