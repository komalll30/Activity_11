import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Memberships from './pages/Memberships'
import Join from './pages/Join'
import Trainers from './pages/Trainers'
import Members from './pages/Members'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/memberships" element={<Memberships />} />
          <Route path="/join" element={<Join />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/members" element={<Members />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
