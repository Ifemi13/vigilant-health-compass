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
