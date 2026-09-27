import { Navigate, Route, Routes } from 'react-router'
import { RedirectIfSignedIn, RequireAuth } from './auth/AuthProvider'
import AppLayout from './components/AppLayout'
import { FEATURES } from './features'
import Awareness from './pages/Awareness'
import ComingSoon from './pages/ComingSoon'
import HealthAlerts from './pages/HealthAlerts'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<RedirectIfSignedIn><SignIn /></RedirectIfSignedIn>} />
      <Route path="/signup" element={<RedirectIfSignedIn><SignUp /></RedirectIfSignedIn>} />
      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/awareness" element={<Awareness />} />
        <Route path="/health-alerts" element={<HealthAlerts />} />
        {FEATURES.filter((feature) => feature.path !== '/awareness' && feature.path !== '/health-alerts').map((feature) => (
          <Route key={feature.path} path={feature.path} element={<ComingSoon feature={feature} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
