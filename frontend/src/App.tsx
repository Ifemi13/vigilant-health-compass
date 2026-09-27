import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { RedirectIfSignedIn, RequireAuth } from './auth/AuthProvider'
import AppLayout from './components/AppLayout'
import GeneralLayout from './components/GeneralLayout'
import PlainLayout from './components/PlainLayout'
import { FEATURES } from './features'
import Awareness from './pages/Awareness'
import Affordability from './pages/Affordability'
import MockAppointments from './pages/MockAppointments'
import ClinicDetail from './pages/ClinicDetail'
import ComingSoon from './pages/ComingSoon'
import AwarenessTopic from './pages/general/AwarenessTopic'
import AwarenessTopics from './pages/general/AwarenessTopics'
import GeneralHome from './pages/general/GeneralHome'
import GeneralProfile from './pages/general/GeneralProfile'
import HealthProfile from './pages/general/HealthProfile'
import HealthcareNearMe from './pages/general/HealthcareNearMe'
import HospitalForum from './pages/general/HospitalForum'
import HealthAlerts from './pages/HealthAlerts'
import Onboarding from './pages/Onboarding'
import PetsHome from './pages/PetsHome'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SectionsHome from './pages/SectionsHome'
import SignUp from './pages/SignUp'
import { FullPageSpinner } from './components/ui'

const WomensCare = lazy(() => import('./pages/WomensCare'))
import { GENERAL_PANELS } from './sections'

/** Home-page sections that have been built; the rest show a "coming soon" page. */
const FEATURE_PAGES: Record<string, ReactNode> = {
  '/affordability': <Affordability />,
  '/appointments': <MockAppointments />,
  '/awareness': <Awareness />,
  '/health-alerts': <HealthAlerts />,
}

/** General panels with their own pages (routed explicitly below); the rest show "coming soon". */
const BUILT_GENERAL_PANELS = ['/general/awareness', '/general/health-profile', '/general/near-me']

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<RedirectIfSignedIn><SignIn /></RedirectIfSignedIn>} />
      <Route path="/signup" element={<RedirectIfSignedIn><SignUp /></RedirectIfSignedIn>} />
      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      {/* The home screen and Women: no navbar, no pet onboarding. */}
      <Route path="/" element={<RequireAuth><SectionsHome /></RequireAuth>} />
      <Route element={<RequireAuth><PlainLayout /></RequireAuth>}>
        <Route path="/women" element={<Suspense fallback={<FullPageSpinner />}><WomensCare /></Suspense>} />
      </Route>
      {/* General: navbar, no pet onboarding. */}
      <Route element={<RequireAuth><GeneralLayout /></RequireAuth>}>
        <Route path="/general" element={<GeneralHome />} />
        <Route path="/general/awareness" element={<AwarenessTopics />} />
        <Route path="/general/awareness/:topicId" element={<AwarenessTopic />} />
        <Route path="/general/awareness/:topicId/hospitals/:hospitalId" element={<HospitalForum />} />
        <Route path="/general/health-profile" element={<HealthProfile />} />
        <Route path="/general/near-me" element={<HealthcareNearMe />} />
        <Route path="/general/profile" element={<GeneralProfile />} />
        {GENERAL_PANELS.filter((panel) => !BUILT_GENERAL_PANELS.includes(panel.path)).map((panel) => (
          <Route
            key={panel.path}
            path={panel.path}
            element={<ComingSoon feature={panel} backTo="/general" backLabel="Back to General" />}
          />
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
