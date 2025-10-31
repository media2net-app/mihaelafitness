import Sidebar from '../components/Sidebar';
import './TeamlidDetail.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Demo teamleden data
const demoUsers = [
  { 
    id: 'U-1001', 
    naam: 'Jan Bakker', 
    email: 'jan.bakker@equans.nl', 
    telefoon: '+31 88 100 2001', 
    rol: 'Accountmanager',
    afdeling: 'Sales',
    status: 'Actief',
    avatar: null,
    ingecheckt: '2024-03-15',
    afdelingemail: 'sales@equans.nl',
    kantoor: 'Amsterdam',
    projecten: ['P-2005'],
    urenDezeMaand: 142,
    takenVoltooid: 12,
    aantekeningen: 'Ervaren accountmanager met focus op grote commerciële projecten.'
  },
  { 
    id: 'U-1002', 
    naam: 'Maria Jansen', 
    email: 'maria.jansen@equans.nl', 
    telefoon: '+31 88 100 2002', 
    rol: 'Sales Support',
    afdeling: 'Sales',
    status: 'Actief',
    avatar: null,
    ingecheckt: '2023-11-01',
    afdelingemail: 'sales@equans.nl',
    kantoor: 'Rotterdam',
    projecten: ['P-2006'],
    urenDezeMaand: 156,
    takenVoltooid: 18,
    aantekeningen: 'Expert in ondersteuning van verkoop- en klantprocessen.'
  },
  { 
    id: 'U-1003', 
    naam: 'Peter de Vries', 
    email: 'peter.devries@equans.nl', 
    telefoon: '+31 88 100 2003', 
    rol: 'Projectmanager',
    afdeling: 'Projecten',
    status: 'Actief',
    avatar: null,
    ingecheckt: '2022-06-01',
    afdelingemail: 'projecten@equans.nl',
    kantoor: 'Utrecht',
    projecten: ['P-2001', 'P-2002', 'P-2003'],
    urenDezeMaand: 148,
    takenVoltooid: 9,
    aantekeningen: 'Senior projectmanager met expertise in grootschalige energieprojecten.'
  },
  { 
    id: 'U-1004', 
    naam: 'Lisa van der Berg', 
    email: 'lisa.vanderberg@equans.nl', 
    telefoon: '+31 88 100 2004', 
    rol: 'Offerte Specialist',
    afdeling: 'Sales',
    status: 'Actief',
    avatar: null,
    ingecheckt: '2023-02-15',
    afdelingemail: 'sales@equans.nl',
    kantoor: 'Amsterdam',
    projecten: ['P-2004'],
    urenDezeMaand: 135,
    takenVoltooid: 22,
    aantekeningen: 'Specialist in het opstellen van gedetailleerde en accurate offertes.'
  },
  { 
    id: 'U-1005', 
    naam: 'Tom Smit', 
    email: 'tom.smit@equans.nl', 
    telefoon: '+31 88 100 2005', 
    rol: 'Technisch Adviseur',
    afdeling: 'Techniek',
    status: 'Inactief',
    avatar: null,
    ingecheckt: '2021-09-01',
    afdelingemail: 'techniek@equans.nl',
    kantoor: 'Eindhoven',
    projecten: [],
    urenDezeMaand: 0,
    takenVoltooid: 0,
    aantekeningen: 'Technisch adviseur gespecialiseerd in elektrische systemen.'
  },
  { 
    id: 'U-1006', 
    naam: 'Emma Mulder', 
    email: 'emma.mulder@equans.nl', 
    telefoon: '+31 88 100 2006', 
    rol: 'Customer Success Manager',
    afdeling: 'Sales',
    status: 'Actief',
    avatar: null,
    ingecheckt: '2023-08-01',
    afdelingemail: 'sales@equans.nl',
    kantoor: 'Amsterdam',
    projecten: ['P-2002'],
    urenDezeMaand: 140,
    takenVoltooid: 15,
    aantekeningen: 'Focus op klanttevredenheid en langdurige relaties.'
  },
];

// Demo projecten data
const demoProjects = [
  { id: 'P-2001', naam: 'Zonnepanelen installatie Rotterdam', status: 'In uitvoering', budget: 45000 },
  { id: 'P-2002', naam: 'Elektrische laadpalen netwerk Amsterdam', status: 'In uitvoering', budget: 85000 },
  { id: 'P-2003', naam: 'Windturbine onderhoud Den Haag', status: 'Afgerond', budget: 120000 },
  { id: 'P-2004', naam: 'Smart grid implementatie Utrecht', status: 'Gepland', budget: 95000 },
  { id: 'P-2005', naam: 'Batterij opslag systeem Eindhoven', status: 'In uitvoering', budget: 65000 },
  { id: 'P-2006', naam: 'LED verlichting upgrade kantoren', status: 'In uitvoering', budget: 28000 },
];

function getInitials(naam) {
  return naam
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function TeamlidDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => demoUsers.find(u => u.id === id), [id]);

  const [aantekening, setAantekening] = useState('');
  const [aantekeningen, setAantekeningen] = useState([]);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`teamlid_aantekeningen_${id}`);
      if (saved) {
        try {
          setAantekeningen(JSON.parse(saved));
        } catch (e) {
          setAantekeningen([]);
        }
      }
    }
  }, [user, id]);

  useEffect(() => {
    if (aantekeningen.length > 0) {
      localStorage.setItem(`teamlid_aantekeningen_${id}`, JSON.stringify(aantekeningen));
    }
  }, [aantekeningen, id]);

  if (!user) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <main className="dashboard-main teamlid-detail-main">
          <div className="teamlid-detail-titlebar">
            <h1>Teamlid niet gevonden</h1>
          </div>
          <button className="teamlid-detail-btn" onClick={() => navigate('/team')}>
            Terug naar team
          </button>
        </main>
      </div>
    );
  }

  function addAantekening() {
    if (!aantekening.trim()) return;
    const newNote = {
      id: Date.now(),
      datum: new Date().toISOString(),
      tekst: aantekening.trim()
    };
    setAantekeningen(prev => [newNote, ...prev]);
    setAantekening('');
  }

  function removeAantekening(noteId) {
    setAantekeningen(prev => prev.filter(n => n.id !== noteId));
  }

  // Haal projecten op die bij deze gebruiker horen
  const userProjecten = user.projecten
    .map(projectId => demoProjects.find(p => p.id === projectId))
    .filter(Boolean);

  const getStatusColor = (status) => status === 'Actief' ? '#0e3b33' : '#3b0e18';
  const getStatusTextColor = (status) => status === 'Actief' ? '#9ff6cc' : '#ffc9d6';

  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  }

  function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('nl-NL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main teamlid-detail-main">
        <div className="teamlid-detail-titlebar">
          <div className="teamlid-title-left">
            <div className="teamlid-avatar-large">
              {getInitials(user.naam)}
            </div>
            <h1>
              {user.naam}
              <span style={{ fontSize: '.65em', fontWeight: 400, color: '#74ffe2' }}>
                ({user.id})
              </span>
            </h1>
          </div>
          <div className="teamlid-detail-actions">
            <button className="teamlid-detail-btn" onClick={() => navigate('/team')}>
              Terug
            </button>
          </div>
        </div>

        <div className="teamlid-detail-content">
          {/* Linker kolom */}
          <div>
            {/* Medewerker informatie card */}
            <div className="teamlid-info-card">
              <h3>Medewerker Informatie</h3>
              <div className="teamlid-info-grid">
                <div className="teamlid-info-item">
                  <span className="teamlid-info-label">Status</span>
                  <span 
                    className="teamlid-status-badge" 
                    style={{
                      background: getStatusColor(user.status),
                      color: getStatusTextColor(user.status),
                      border: `1px solid ${getStatusTextColor(user.status)}`
                    }}
                  >
                    {user.status}
                  </span>
                </div>
                <div className="teamlid-info-item">
                  <span className="teamlid-info-label">Rol</span>
                  <span className="teamlid-info-value">{user.rol}</span>
                </div>
                <div className="teamlid-info-item">
                  <span className="teamlid-info-label">Afdeling</span>
                  <span className="teamlid-info-value">{user.afdeling}</span>
                </div>
                <div className="teamlid-info-item">
                  <span className="teamlid-info-label">Kantoor</span>
                  <span className="teamlid-info-value">{user.kantoor}</span>
                </div>
                <div className="teamlid-info-item">
                  <span className="teamlid-info-label">Email</span>
                  <span className="teamlid-info-value highlight">{user.email}</span>
                </div>
                <div className="teamlid-info-item">
                  <span className="teamlid-info-label">Afdeling email</span>
                  <span className="teamlid-info-value">{user.afdelingemail}</span>
                </div>
                <div className="teamlid-info-item">
                  <span className="teamlid-info-label">Telefoon</span>
                  <span className="teamlid-info-value">{user.telefoon}</span>
                </div>
                <div className="teamlid-info-item">
                  <span className="teamlid-info-label">In dienst sinds</span>
                  <span className="teamlid-info-value">{formatDate(user.ingecheckt)}</span>
                </div>
              </div>

              {user.aantekeningen && (
                <div className="teamlid-beschrijving">
                  <span className="teamlid-info-label">Over</span>
                  <p className="teamlid-info-value">{user.aantekeningen}</p>
                </div>
              )}
            </div>

            {/* Projecten card */}
            <div className="teamlid-projecten-card">
              <h3>Projecten ({userProjecten.length})</h3>
              {userProjecten.length > 0 ? (
                <div className="teamlid-projecten-list">
                  {userProjecten.map(project => (
                    <div 
                      key={project.id} 
                      className="teamlid-project-item"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <div className="teamlid-project-header">
                        <span className="teamlid-project-naam">{project.naam}</span>
                        <span className="teamlid-project-status">{project.status}</span>
                      </div>
                      <div className="teamlid-project-budget">{formatCurrency(project.budget)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="teamlid-empty">Geen projecten</div>
              )}
            </div>

            {/* Prestaties card */}
            <div className="teamlid-prestaties-card">
              <h3>Prestaties deze maand</h3>
              <div className="teamlid-prestaties-grid">
                <div className="teamlid-prest-item">
                  <span className="teamlid-prest-label">Uren gewerkt</span>
                  <span className="teamlid-prest-value">{user.urenDezeMaand}</span>
                </div>
                <div className="teamlid-prest-item">
                  <span className="teamlid-prest-label">Taken voltooid</span>
                  <span className="teamlid-prest-value">{user.takenVoltooid}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rechter kolom */}
          <div>
            {/* Aantekeningen card */}
            <div className="teamlid-aantekeningen-card">
              <h3>Aantekeningen</h3>
              <div className="teamlid-aantekeningen-list">
                {aantekeningen.length > 0 ? (
                  aantekeningen.map(note => (
                    <div key={note.id} className="teamlid-aantekening-item">
                      <div className="teamlid-aantekening-header">
                        <span className="teamlid-aantekening-datum">{formatDateTime(note.datum)}</span>
                        <button 
                          className="teamlid-aantekening-delete"
                          onClick={() => removeAantekening(note.id)}
                          title="Verwijderen"
                        >
                          ×
                        </button>
                      </div>
                      <div className="teamlid-aantekening-text">{note.tekst}</div>
                    </div>
                  ))
                ) : (
                  <div className="teamlid-empty">Geen aantekeningen</div>
                )}
              </div>
            </div>

            {/* Nieuwe aantekening card */}
            <div className="teamlid-note-card">
              <h3>Nieuwe Aantekening</h3>
              <div className="teamlid-note-form">
                <label htmlFor="teamlid-aantekening">Aantekening</label>
                <textarea
                  id="teamlid-aantekening"
                  value={aantekening}
                  onChange={(e) => setAantekening(e.target.value)}
                  placeholder="Voeg een aantekening toe..."
                  rows="6"
                />
                <div className="teamlid-note-actions">
                  <button 
                    className="teamlid-note-btn" 
                    onClick={addAantekening}
                    disabled={!aantekening.trim()}
                  >
                    Opslaan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function formatCurrency(amount) {
  return `€ ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
