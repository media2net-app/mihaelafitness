import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Producten from './pages/Producten.jsx'
import Offerte from './pages/Offerte.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Klanten from './pages/Klanten.jsx'
import Leads from './pages/Leads.jsx'
import OfferteDetail from './pages/OfferteDetail.jsx'
import Systeemfunctionaliteiten from './pages/Systeemfunctionaliteiten.jsx'
import FeaturedFunctions from './pages/FeaturedFunctions.jsx'
import LeadDetail from './pages/LeadDetail.jsx'
import Team from './pages/Team.jsx'
import Projecten from './pages/Projecten.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import KlantDetail from './pages/KlantDetail.jsx'
import TeamlidDetail from './pages/TeamlidDetail.jsx'

function App() {
  const location = useLocation();
  const isLogin = location.pathname.startsWith('/login');
  if (isLogin) {
    return <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  }
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/rapportages" element={<Dashboard />} />
      <Route path="/team" element={<Team />} />
      <Route path="/teamlid/:id" element={<TeamlidDetail />} />
      <Route path="/klanten" element={<Klanten />} />
      <Route path="/klant/:id" element={<KlantDetail />} />
      <Route path="/leads" element={<Leads />} />
      <Route path="/lead/:id" element={<LeadDetail />} />
      <Route path="/projecten" element={<Projecten />} />
      <Route path="/project/:id" element={<ProjectDetail />} />
      <Route path="/offerte" element={<Offerte />} />
      <Route path="/offerte/:id" element={<OfferteDetail />} />
      <Route path="/producten" element={<Producten />} />
      <Route path="/product/:sku" element={<ProductDetail />} />
      <Route path="/systeemfunctionaliteiten" element={<Systeemfunctionaliteiten />} />
      <Route path="/featured-functions" element={<FeaturedFunctions />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
