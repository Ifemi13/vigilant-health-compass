import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { RedirectIfSignedIn, RequireAuth } from './auth/AuthProvider'
import AppLayout from './components/AppLayout'
import { FEATURES } from './features'
import Awareness from './pages/Awareness'
import Affordability from './pages/Affordability'
import ClinicDetail from './pages/ClinicDetail'
import ComingSoon from './pages/ComingSoon'
import Onboarding from './pages/Onboarding'
import PetsHome from './pages/PetsHome'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SectionsHome from './pages/SectionsHome'
import SignUp from './pages/SignUp'
import { SECTIONS } from './sections'

/** Home-page sections that have been built; the rest show a "coming soon" page. */
const FEATURE_PAGES: Record<string, ReactNode> = {
  '/affordability': <Affordability />,
  '/awareness': <Awareness />,
}

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<RedirectIfSignedIn><SignIn /></RedirectIfSignedIn>} />
      <Route path="/signup" element={<RedirectIfSignedIn><SignUp /></RedirectIfSignedIn>} />
      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      {/* The home screen and the sections that aren't built yet: no navbar, no pet onboarding. */}
      <Route path="/" element={<RequireAuth><SectionsHome /></RequireAuth>} />
      {SECTIONS.filter((section) => section.path !== '/pets').map((section) => (
        <Route
          key={section.path}
          path={section.path}
          element={
            <RequireAuth>
              <main className="mx-auto max-w-2xl px-4 py-16">
                <ComingSoon feature={section} backTo="/" backLabel="Back" />
              </main>
            </RequireAuth>
          }
        />
      ))}
      {/* Pets: navbar, and AppLayout sends people who haven't onboarded to /onboarding. */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/pets" element={<PetsHome />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/affordability/clinics/:id" element={<ClinicDetail />} />
        {FEATURES.map((feature) => (
          <Route
            key={feature.path}
            path={feature.path}
            element={FEATURE_PAGES[feature.path] ?? <ComingSoon feature={feature} />}
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
