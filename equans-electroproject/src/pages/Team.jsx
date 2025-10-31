import Sidebar from '../components/Sidebar';
import './Team.css';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const demoUsers = [
  { 
    id: 'U-1001', 
    naam: 'Jan Bakker', 
    email: 'jan.bakker@equans.nl', 
    telefoon: '+31 88 100 2001', 
    rol: 'Accountmanager',
    afdeling: 'Sales',
    status: 'Actief',
    avatar: null
  },
  { 
    id: 'U-1002', 
    naam: 'Maria Jansen', 
    email: 'maria.jansen@equans.nl', 
    telefoon: '+31 88 100 2002', 
    rol: 'Sales Support',
    afdeling: 'Sales',
    status: 'Actief',
    avatar: null
  },
  { 
    id: 'U-1003', 
    naam: 'Peter de Vries', 
    email: 'peter.devries@equans.nl', 
    telefoon: '+31 88 100 2003', 
    rol: 'Projectmanager',
    afdeling: 'Projecten',
    status: 'Actief',
    avatar: null
  },
  { 
    id: 'U-1004', 
    naam: 'Lisa van der Berg', 
    email: 'lisa.vanderberg@equans.nl', 
    telefoon: '+31 88 100 2004', 
    rol: 'Offerte Specialist',
    afdeling: 'Sales',
    status: 'Actief',
    avatar: null
  },
  { 
    id: 'U-1005', 
    naam: 'Tom Smit', 
    email: 'tom.smit@equans.nl', 
    telefoon: '+31 88 100 2005', 
    rol: 'Technisch Adviseur',
    afdeling: 'Techniek',
    status: 'Inactief',
    avatar: null
  },
  { 
    id: 'U-1006', 
    naam: 'Emma Mulder', 
    email: 'emma.mulder@equans.nl', 
    telefoon: '+31 88 100 2006', 
    rol: 'Customer Success Manager',
    afdeling: 'Sales',
    status: 'Actief',
    avatar: null
  },
];

function getInitials(naam) {
  return naam
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Team(){
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState('all');
  const [filterAfdeling, setFilterAfdeling] = useState('all');

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return demoUsers.filter(u => {
      const matchesSearch = u.naam.toLowerCase().includes(s) || 
                           u.email.toLowerCase().includes(s) || 
                           u.id.toLowerCase().includes(s);
      const matchesRol = filterRol === 'all' || u.rol === filterRol;
      const matchesAfdeling = filterAfdeling === 'all' || u.afdeling === filterAfdeling;
      return matchesSearch && matchesRol && matchesAfdeling;
    });
  }, [search, filterRol, filterAfdeling]);

  const uniekeRollen = useMemo(() => {
    const rollen = [...new Set(demoUsers.map(u => u.rol))];
    return rollen.sort();
  }, []);

  const uniekeAfdelingen = useMemo(() => {
    const afdelingen = [...new Set(demoUsers.map(u => u.afdeling))];
    return afdelingen.sort();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main team-main">
        <div className="team-titlebar">
          <h1>Team</h1>
          <div className="team-filters">
            <input 
              className="team-search" 
              placeholder="Zoek gebruiker (naam, e-mail of ID)" 
              value={search} 
              onChange={(e)=>setSearch(e.target.value)} 
            />
            <select 
              className="team-filter" 
              value={filterRol} 
              onChange={(e)=>setFilterRol(e.target.value)}
            >
              <option value="all">Alle rollen</option>
              {uniekeRollen.map(rol => (
                <option key={rol} value={rol}>{rol}</option>
              ))}
            </select>
            <select 
              className="team-filter" 
              value={filterAfdeling} 
              onChange={(e)=>setFilterAfdeling(e.target.value)}
            >
              <option value="all">Alle afdelingen</option>
              {uniekeAfdelingen.map(afd => (
                <option key={afd} value={afd}>{afd}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="team-grid">
          {filtered.map(user => (
            <div 
              key={user.id} 
              className="team-card"
              onClick={() => navigate(`/teamlid/${user.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="team-card-header">
                <div className="team-avatar">
                  {getInitials(user.naam)}
                </div>
                <div className="team-card-info">
                  <h3 className="team-card-name">{user.naam}</h3>
                  <span className="team-card-role">{user.rol}</span>
                </div>
                <span className={`team-status-badge ${user.status.toLowerCase()}`}>
                  {user.status}
                </span>
              </div>
              <div className="team-card-details">
                <div className="team-detail-row">
                  <span className="team-detail-label">E-mail:</span>
                  <span className="team-detail-value">{user.email}</span>
                </div>
                <div className="team-detail-row">
                  <span className="team-detail-label">Telefoon:</span>
                  <span className="team-detail-value">{user.telefoon}</span>
                </div>
                <div className="team-detail-row">
                  <span className="team-detail-label">Afdeling:</span>
                  <span className="team-detail-value">{user.afdeling}</span>
                </div>
                <div className="team-detail-row">
                  <span className="team-detail-label">ID:</span>
                  <span className="team-detail-value">{user.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="team-empty">
            <p>Geen gebruikers gevonden met deze filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
