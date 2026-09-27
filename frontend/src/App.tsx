import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { RedirectIfSignedIn, RequireAuth } from './auth/AuthProvider'
import AppLayout from './components/AppLayout'
import PlainLayout from './components/PlainLayout'
import { FEATURES } from './features'
import Awareness from './pages/Awareness'
import Affordability from './pages/Affordability'
import ClinicDetail from './pages/ClinicDetail'
import ComingSoon from './pages/ComingSoon'
import AwarenessTopic from './pages/general/AwarenessTopic'
import AwarenessTopics from './pages/general/AwarenessTopics'
import GeneralHome from './pages/general/GeneralHome'
import HospitalForum from './pages/general/HospitalForum'
import HealthAlerts from './pages/HealthAlerts'
import Onboarding from './pages/Onboarding'
import PetsHome from './pages/PetsHome'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SectionsHome from './pages/SectionsHome'
import SignUp from './pages/SignUp'
import { GENERAL_PANELS, SECTIONS } from './sections'

/** Home-page sections that have been built; the rest show a "coming soon" page. */
const FEATURE_PAGES: Record<string, ReactNode> = {
  '/affordability': <Affordability />,
  '/awareness': <Awareness />,
  '/health-alerts': <HealthAlerts />,
}

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<RedirectIfSignedIn><SignIn /></RedirectIfSignedIn>} />
      <Route path="/signup" element={<RedirectIfSignedIn><SignUp /></RedirectIfSignedIn>} />
      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      {/* The home screen, General and Women: no navbar, no pet onboarding. */}
      <Route path="/" element={<RequireAuth><SectionsHome /></RequireAuth>} />
      <Route element={<RequireAuth><PlainLayout /></RequireAuth>}>
        <Route path="/general" element={<GeneralHome />} />
        <Route path="/general/awareness" element={<AwarenessTopics />} />
        <Route path="/general/awareness/:topicId" element={<AwarenessTopic />} />
        <Route path="/general/awareness/:topicId/hospitals/:hospitalId" element={<HospitalForum />} />
        {GENERAL_PANELS.filter((panel) => panel.path !== '/general/awareness').map((panel) => (
          <Route
            key={panel.path}
            path={panel.path}
            element={<ComingSoon feature={panel} backTo="/general" backLabel="Back to General" />}
          />
        ))}
        {SECTIONS.filter((section) => section.path === '/women').map((section) => (
          <Route key={section.path} path={section.path} element={<ComingSoon feature={section} backTo="/" backLabel="Back" />} />
        ))}
      </Route>
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
