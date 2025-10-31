import Sidebar from '../components/Sidebar';
import './KlantDetail.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Demo klanten data
const demoCustomers = [
  { 
    id: 'C-1001', 
    naam: 'TechnoPower BV', 
    email: 'info@technopower.nl', 
    telefoon: '+31 88 100 1001', 
    status: 'Actief',
    adres: 'Hoofdstraat 123, 3012 Rotterdam',
    plaats: 'Rotterdam',
    postcode: '3012',
    kvk: '12345678',
    btw: 'NL123456789B01',
    contactpersoon: 'Jan Smit',
    aantekeningen: 'Belangrijke klant sinds 2020. Regelmatig projecten voor zonnepanelen installaties.',
    projecten: ['P-2001', 'P-2004'],
    totaalBudget: 140000
  },
  { 
    id: 'C-1002', 
    naam: 'WindWorks NL', 
    email: 'contact@windworks.nl', 
    telefoon: '+31 88 100 1002', 
    status: 'Actief',
    adres: 'Energielaan 45, 2517 Den Haag',
    plaats: 'Den Haag',
    postcode: '2517',
    kvk: '87654321',
    btw: 'NL876543210B01',
    contactpersoon: 'Lisa van der Berg',
    aantekeningen: 'Specialist in windturbine onderhoud en optimalisatie.',
    projecten: ['P-2003'],
    totaalBudget: 120000
  },
  { 
    id: 'C-1003', 
    naam: 'HydroDrive Europe', 
    email: 'sales@hydrodrive.eu', 
    telefoon: '+31 88 100 1003', 
    status: 'Inactief',
    adres: 'Waterstraat 789, 5612 Eindhoven',
    plaats: 'Eindhoven',
    postcode: '5612',
    kvk: '11223344',
    btw: 'NL112233445B01',
    contactpersoon: 'Peter de Vries',
    aantekeningen: 'Mogelijkheid voor toekomstige samenwerking.',
    projecten: ['P-2005'],
    totaalBudget: 65000
  },
  { 
    id: 'C-1004', 
    naam: 'GreenGrid Services', 
    email: 'support@greengrid.io', 
    telefoon: '+31 88 100 1004', 
    status: 'Actief',
    adres: 'Groene Weg 456, 1012 Amsterdam',
    plaats: 'Amsterdam',
    postcode: '1012',
    kvk: '55667788',
    btw: 'NL556677889B01',
    contactpersoon: 'Emma Mulder',
    aantekeningen: 'Actieve klant met focus op smart grid en energieopslag.',
    projecten: ['P-2002', 'P-2006'],
    totaalBudget: 113000
  },
];

// Demo projecten data voor referentie
const demoProjects = [
  { id: 'P-2001', naam: 'Zonnepanelen installatie Rotterdam', status: 'In uitvoering', budget: 45000 },
  { id: 'P-2002', naam: 'Elektrische laadpalen netwerk Amsterdam', status: 'In uitvoering', budget: 85000 },
  { id: 'P-2003', naam: 'Windturbine onderhoud Den Haag', status: 'Afgerond', budget: 120000 },
  { id: 'P-2004', naam: 'Smart grid implementatie Utrecht', status: 'Gepland', budget: 95000 },
  { id: 'P-2005', naam: 'Batterij opslag systeem Eindhoven', status: 'In uitvoering', budget: 65000 },
  { id: 'P-2006', naam: 'LED verlichting upgrade kantoren', status: 'In uitvoering', budget: 28000 },
];

function formatCurrency(amount) {
  return `€ ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function KlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const klant = useMemo(() => demoCustomers.find(c => c.id === id), [id]);

  const [aantekening, setAantekening] = useState('');
  const [aantekeningen, setAantekeningen] = useState([]);

  useEffect(() => {
    if (klant) {
      // Laad bestaande aantekeningen uit localStorage (in een echte app zou dit uit een API komen)
      const saved = localStorage.getItem(`klant_aantekeningen_${id}`);
      if (saved) {
        try {
          setAantekeningen(JSON.parse(saved));
        } catch (e) {
          setAantekeningen([]);
        }
      }
    }
  }, [klant, id]);

  useEffect(() => {
    if (aantekeningen.length > 0) {
      localStorage.setItem(`klant_aantekeningen_${id}`, JSON.stringify(aantekeningen));
    }
  }, [aantekeningen, id]);

  if (!klant) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <main className="dashboard-main klant-detail-main">
          <div className="klant-detail-titlebar">
            <h1>Klant niet gevonden</h1>
          </div>
          <button className="klant-detail-btn" onClick={() => navigate('/klanten')}>
            Terug naar klanten
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

  // Haal projecten op die bij deze klant horen
  const klantProjecten = klant.projecten
    .map(projectId => demoProjects.find(p => p.id === projectId))
    .filter(Boolean);

  const getStatusColor = (status) => status === 'Actief' ? '#0e3b33' : '#3b0e18';
  const getStatusTextColor = (status) => status === 'Actief' ? '#9ff6cc' : '#ffc9d6';

  function formatDate(dateString) {
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
      <main className="dashboard-main klant-detail-main">
        <div className="klant-detail-titlebar">
          <h1>
            {klant.naam}
            <span style={{ fontSize: '.65em', fontWeight: 400, color: '#74ffe2' }}>
              ({klant.id})
            </span>
          </h1>
          <div className="klant-detail-actions">
            <button className="klant-detail-btn" onClick={() => navigate('/klanten')}>
              Terug
            </button>
          </div>
        </div>

        <div className="klant-detail-content">
          {/* Linker kolom */}
          <div>
            {/* Klant informatie card */}
            <div className="klant-info-card">
              <h3>Klant Informatie</h3>
              <div className="klant-info-grid">
                <div className="klant-info-item">
                  <span className="klant-info-label">Status</span>
                  <span 
                    className="klant-status-badge" 
                    style={{
                      background: getStatusColor(klant.status),
                      color: getStatusTextColor(klant.status),
                      border: `1px solid ${getStatusTextColor(klant.status)}`
                    }}
                  >
                    {klant.status}
                  </span>
                </div>
                <div className="klant-info-item">
                  <span className="klant-info-label">Email</span>
                  <span className="klant-info-value highlight">{klant.email}</span>
                </div>
                <div className="klant-info-item">
                  <span className="klant-info-label">Telefoon</span>
                  <span className="klant-info-value">{klant.telefoon}</span>
                </div>
                <div className="klant-info-item">
                  <span className="klant-info-label">Contactpersoon</span>
                  <span className="klant-info-value">{klant.contactpersoon || '-'}</span>
                </div>
                <div className="klant-info-item full-width">
                  <span className="klant-info-label">Adres</span>
                  <span className="klant-info-value">{klant.adres}</span>
                </div>
                <div className="klant-info-item">
                  <span className="klant-info-label">Postcode</span>
                  <span className="klant-info-value">{klant.postcode}</span>
                </div>
                <div className="klant-info-item">
                  <span className="klant-info-label">Plaats</span>
                  <span className="klant-info-value">{klant.plaats}</span>
                </div>
                <div className="klant-info-item">
                  <span className="klant-info-label">KvK nummer</span>
                  <span className="klant-info-value">{klant.kvk}</span>
                </div>
                <div className="klant-info-item">
                  <span className="klant-info-label">BTW nummer</span>
                  <span className="klant-info-value">{klant.btw}</span>
                </div>
              </div>

              {klant.aantekeningen && (
                <div className="klant-beschrijving">
                  <span className="klant-info-label">Beschrijving</span>
                  <p className="klant-info-value">{klant.aantekeningen}</p>
                </div>
              )}
            </div>

            {/* Projecten card */}
            <div className="klant-projecten-card">
              <h3>Projecten ({klantProjecten.length})</h3>
              {klantProjecten.length > 0 ? (
                <div className="klant-projecten-list">
                  {klantProjecten.map(project => (
                    <div 
                      key={project.id} 
                      className="klant-project-item"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <div className="klant-project-header">
                        <span className="klant-project-naam">{project.naam}</span>
                        <span className="klant-project-status">{project.status}</span>
                      </div>
                      <div className="klant-project-budget">{formatCurrency(project.budget)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="klant-empty">Geen projecten</div>
              )}
            </div>

            {/* Statistieken card */}
            <div className="klant-statistieken-card">
              <h3>Statistieken</h3>
              <div className="klant-statistieken-grid">
                <div className="klant-stat-item">
                  <span className="klant-stat-label">Totaal budget</span>
                  <span className="klant-stat-value">{formatCurrency(klant.totaalBudget)}</span>
                </div>
                <div className="klant-stat-item">
                  <span className="klant-stat-label">Aantal projecten</span>
                  <span className="klant-stat-value">{klantProjecten.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rechter kolom */}
          <div>
            {/* Aantekeningen card */}
            <div className="klant-aantekeningen-card">
              <h3>Aantekeningen</h3>
              <div className="klant-aantekeningen-list">
                {aantekeningen.length > 0 ? (
                  aantekeningen.map(note => (
                    <div key={note.id} className="klant-aantekening-item">
                      <div className="klant-aantekening-header">
                        <span className="klant-aantekening-datum">{formatDate(note.datum)}</span>
                        <button 
                          className="klant-aantekening-delete"
                          onClick={() => removeAantekening(note.id)}
                          title="Verwijderen"
                        >
                          ×
                        </button>
                      </div>
                      <div className="klant-aantekening-text">{note.tekst}</div>
                    </div>
                  ))
                ) : (
                  <div className="klant-empty">Geen aantekeningen</div>
                )}
              </div>
            </div>

            {/* Nieuwe aantekening card */}
            <div className="klant-note-card">
              <h3>Nieuwe Aantekening</h3>
              <div className="klant-note-form">
                <label htmlFor="klant-aantekening">Aantekening</label>
                <textarea
                  id="klant-aantekening"
                  value={aantekening}
                  onChange={(e) => setAantekening(e.target.value)}
                  placeholder="Voeg een aantekening toe..."
                  rows="6"
                />
                <div className="klant-note-actions">
                  <button 
                    className="klant-note-btn" 
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
