import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthRoute } from './components/layout/AuthRoute'
import Home from './pages/Home'
import Songs from './pages/Songs'
import Moments from './pages/Moments'
import { Messages } from './pages/Messages'
import { ThingsToDo } from './pages/ThingsToDo'
import { Login } from './pages/auth/Login'
import Settings from './pages/Settings'
import Time from './pages/Time'
import Doodle from './pages/Doodle'
import Garden from './pages/Garden'
import Games from './pages/Games'
import Compass from './pages/Compass'
import NotFound from './pages/NotFound'
// Placeholders no longer needed for these routes

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<AuthRoute />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/time" element={<Time />} />
          <Route path="/moments" element={<Moments />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/things-to-do" element={<ThingsToDo />} />
          <Route path="/doodle" element={<Doodle />} />
          <Route path="/compass" element={<Compass />} />
          <Route path="/games" element={<Games />} />
          <Route path="/garden" element={<Garden />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
