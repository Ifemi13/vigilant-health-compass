import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { RedirectIfSignedIn, RequireAuth } from './auth/AuthProvider'
import AppLayout from './components/AppLayout'
import { FEATURES } from './features'
import Awareness from './pages/Awareness'
import Affordability from './pages/Affordability'
import ClinicDetail from './pages/ClinicDetail'
import ComingSoon from './pages/ComingSoon'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

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
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<Home />} />
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
