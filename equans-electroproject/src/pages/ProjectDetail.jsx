import Sidebar from '../components/Sidebar';
import './ProjectDetail.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Demo projecten data (zou normaal uit een API komen)
const demoProjects = [
  { 
    id: 'P-2001', 
    naam: 'Zonnepanelen installatie Rotterdam', 
    klant: 'TechnoPower BV',
    status: 'In uitvoering',
    budget: 45000,
    kosten: 32000,
    startdatum: '2025-01-15',
    einddatum: '2025-03-30',
    projectmanager: 'Peter de Vries',
    voortgang: 65,
    beschrijving: 'Installatie van 120 zonnepanelen op het dak van een commercieel gebouw in Rotterdam. Het project omvat de installatie van panelen, omvormers en monitoring systemen.',
    locatie: 'Rotterdam, Zuid-Holland',
    telefoon: '+31 88 100 1001',
    email: 'info@technopower.nl',
    activiteiten: [
      { datum: '2025-01-15', type: 'Project gestart', beschrijving: 'Project kick-off meeting gehouden met klant' },
      { datum: '2025-01-20', type: 'Installatie', beschrijving: 'Dak inspectie uitgevoerd en goedkeuring verkregen' },
      { datum: '2025-01-25', type: 'Bestelling', beschrijving: 'Materialen besteld bij leverancier' },
      { datum: '2025-02-10', type: 'Installatie', beschrijving: 'Begin installatie panelen' },
    ]
  },
  { 
    id: 'P-2002', 
    naam: 'Elektrische laadpalen netwerk Amsterdam', 
    klant: 'GreenGrid Services',
    status: 'In uitvoering',
    budget: 85000,
    kosten: 62000,
    startdatum: '2025-02-01',
    einddatum: '2025-05-15',
    projectmanager: 'Peter de Vries',
    voortgang: 42,
    beschrijving: 'Installatie van een netwerk van 50 elektrische laadpalen verspreid over verschillende locaties in Amsterdam. Inclusief planning, installatie en aansluiting op het netwerk.',
    locatie: 'Amsterdam, Noord-Holland',
    telefoon: '+31 88 100 1004',
    email: 'support@greengrid.io',
    activiteiten: [
      { datum: '2025-02-01', type: 'Project gestart', beschrijving: 'Project kick-off' },
      { datum: '2025-02-15', type: 'Planning', beschrijving: 'Locaties gescand en goedgekeurd' },
      { datum: '2025-03-01', type: 'Installatie', beschrijving: 'Eerste 20 laadpalen geïnstalleerd' },
    ]
  },
  { 
    id: 'P-2003', 
    naam: 'Windturbine onderhoud Den Haag', 
    klant: 'WindWorks NL',
    status: 'Afgerond',
    budget: 120000,
    kosten: 118500,
    startdatum: '2024-11-10',
    einddatum: '2025-01-20',
    projectmanager: 'Peter de Vries',
    voortgang: 100,
    beschrijving: 'Jaarlijks onderhoud en inspectie van 3 windturbines in Den Haag. Inclusief inspectie, reparaties en optimalisatie.',
    locatie: 'Den Haag, Zuid-Holland',
    telefoon: '+31 88 100 1002',
    email: 'contact@windworks.nl',
    activiteiten: [
      { datum: '2024-11-10', type: 'Project gestart', beschrijving: 'Project gestart' },
      { datum: '2024-12-05', type: 'Inspectie', beschrijving: 'Inspectie turbine 1 voltooid' },
      { datum: '2024-12-20', type: 'Reparatie', beschrijving: 'Reparaties uitgevoerd' },
      { datum: '2025-01-20', type: 'Afgerond', beschrijving: 'Project succesvol afgerond' },
    ]
  },
  { 
    id: 'P-2004', 
    naam: 'Smart grid implementatie Utrecht', 
    klant: 'TechnoPower BV',
    status: 'Gepland',
    budget: 95000,
    kosten: 0,
    startdatum: '2025-04-01',
    einddatum: '2025-07-31',
    projectmanager: 'Lisa van der Berg',
    voortgang: 0,
    beschrijving: 'Implementatie van een smart grid systeem voor energiebeheer in Utrecht. Het project omvat de installatie van sensoren, software en monitoring systemen.',
    locatie: 'Utrecht, Utrecht',
    telefoon: '+31 88 100 1001',
    email: 'info@technopower.nl',
    activiteiten: []
  },
  { 
    id: 'P-2005', 
    naam: 'Batterij opslag systeem Eindhoven', 
    klant: 'HydroDrive Europe',
    status: 'In uitvoering',
    budget: 65000,
    kosten: 41000,
    startdatum: '2025-01-20',
    einddatum: '2025-04-10',
    projectmanager: 'Jan Bakker',
    voortgang: 58,
    beschrijving: 'Installatie van een grootschalig batterij opslag systeem voor energieopslag in Eindhoven. Systeem heeft een capaciteit van 500 kWh.',
    locatie: 'Eindhoven, Noord-Brabant',
    telefoon: '+31 88 100 1003',
    email: 'sales@hydrodrive.eu',
    activiteiten: [
      { datum: '2025-01-20', type: 'Project gestart', beschrijving: 'Project gestart' },
      { datum: '2025-02-05', type: 'Installatie', beschrijving: 'Batterij systemen geleverd en geïnstalleerd' },
    ]
  },
  { 
    id: 'P-2006', 
    naam: 'LED verlichting upgrade kantoren', 
    klant: 'GreenGrid Services',
    status: 'In uitvoering',
    budget: 28000,
    kosten: 19500,
    startdatum: '2025-02-15',
    einddatum: '2025-03-25',
    projectmanager: 'Maria Jansen',
    voortgang: 78,
    beschrijving: 'Upgrade van alle verlichting naar LED in kantoorgebouw. Vervanging van 500+ lampen met energiebesparing van 60%.',
    locatie: 'Amsterdam, Noord-Holland',
    telefoon: '+31 88 100 1004',
    email: 'support@greengrid.io',
    activiteiten: [
      { datum: '2025-02-15', type: 'Project gestart', beschrijving: 'Project gestart' },
      { datum: '2025-02-20', type: 'Installatie', beschrijving: 'Begin vervanging verlichting' },
      { datum: '2025-03-10', type: 'Installatie', beschrijving: '75% voltooid' },
    ]
  },
];

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(amount) {
  return `€ ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusColor(status) {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('afgerond')) return '#0e3b33';
  if (statusLower.includes('uitvoering')) return '#2d4a5a';
  if (statusLower.includes('gepland')) return '#3b2e1a';
  return '#3b2e1a';
}

function getStatusTextColor(status) {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('afgerond')) return '#9ff6cc';
  if (statusLower.includes('uitvoering')) return '#9ec9d6';
  if (statusLower.includes('gepland')) return '#ffd699';
  return '#d2dee4';
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = useMemo(() => demoProjects.find(p => p.id === id), [id]);

  const [activiteitNote, setActiviteitNote] = useState('');
  const [activiteitDatum, setActiviteitDatum] = useState('');
  const [activiteitType, setActiviteitType] = useState('Algemeen');

  if (!project) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <main className="dashboard-main project-detail-main">
          <div className="project-detail-titlebar">
            <h1>Project niet gevonden</h1>
          </div>
          <button className="project-detail-btn" onClick={() => navigate('/projecten')}>
            Terug naar projecten
          </button>
        </main>
      </div>
    );
  }

  function addActiviteit() {
    if (!activiteitNote.trim()) return;
    // In een echte app zou dit naar een API gaan
    // Voor nu simuleren we door console.log
    console.log('Nieuwe activiteit:', { 
      datum: activiteitDatum || new Date().toISOString().split('T')[0], 
      type: activiteitType, 
      beschrijving: activiteitNote 
    });
    setActiviteitNote('');
    setActiviteitDatum('');
    setActiviteitType('Algemeen');
  }

  const resterendBudget = project.budget - project.kosten;
  const budgetPercentage = project.budget > 0 ? (project.kosten / project.budget) * 100 : 0;
  const verwachtBudget = project.kosten > 0 ? (project.kosten / (project.voortgang / 100)) : 0;

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main project-detail-main">
        <div className="project-detail-titlebar">
          <h1>
            {project.naam} 
            <span style={{ fontSize: '.65em', fontWeight: 400, color: '#74ffe2' }}>
              ({project.id})
            </span>
          </h1>
          <div className="project-detail-actions">
            <button className="project-detail-btn" onClick={() => navigate('/projecten')}>
              Terug
            </button>
            {project.status !== 'Afgerond' && (
              <button 
                className="project-detail-btn complete" 
                onClick={() => {
                  if (confirm('Weet je zeker dat je dit project als afgerond wilt markeren?')) {
                    console.log('Project afgerond:', project.id);
                  }
                }}
              >
                Markeer als afgerond
              </button>
            )}
          </div>
        </div>

        <div className="project-detail-content">
          {/* Linker kolom */}
          <div>
            {/* Project informatie card */}
            <div className="project-info-card">
              <h3>Project Informatie</h3>
              <div className="project-info-grid">
                <div className="project-info-item">
                  <span className="project-info-label">Status</span>
                  <span 
                    className="project-status-badge" 
                    style={{
                      background: getStatusColor(project.status),
                      color: getStatusTextColor(project.status),
                      border: `1px solid ${getStatusTextColor(project.status)}`
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="project-info-item">
                  <span className="project-info-label">Voortgang</span>
                  <div className="project-voortgang-large">
                    <div className="project-voortgang-bar-large">
                      <div 
                        className="project-voortgang-fill-large" 
                        style={{ width: `${project.voortgang}%` }}
                      />
                    </div>
                    <span className="project-voortgang-text-large">{project.voortgang}%</span>
                  </div>
                </div>
                <div className="project-info-item">
                  <span className="project-info-label">Klant</span>
                  <span className="project-info-value">{project.klant}</span>
                </div>
                <div className="project-info-item">
                  <span className="project-info-label">Projectmanager</span>
                  <span className="project-info-value">{project.projectmanager}</span>
                </div>
                <div className="project-info-item">
                  <span className="project-info-label">Locatie</span>
                  <span className="project-info-value">{project.locatie || '-'}</span>
                </div>
                <div className="project-info-item">
                  <span className="project-info-label">Telefoon</span>
                  <span className="project-info-value">{project.telefoon || '-'}</span>
                </div>
                <div className="project-info-item">
                  <span className="project-info-label">E-mail</span>
                  <span className="project-info-value highlight">{project.email || '-'}</span>
                </div>
                <div className="project-info-item">
                  <span className="project-info-label">Startdatum</span>
                  <span className="project-info-value">{formatDate(project.startdatum)}</span>
                </div>
                <div className="project-info-item">
                  <span className="project-info-label">Einddatum</span>
                  <span className="project-info-value">{formatDate(project.einddatum)}</span>
                </div>
              </div>

              {project.beschrijving && (
                <div className="project-beschrijving">
                  <span className="project-info-label">Beschrijving</span>
                  <p className="project-info-value">{project.beschrijving}</p>
                </div>
              )}
            </div>

            {/* Budget & Kosten card */}
            <div className="project-budget-card">
              <h3>Budget & Kosten</h3>
              <div className="project-budget-grid">
                <div className="project-budget-item">
                  <span className="project-budget-label">Budget</span>
                  <span className="project-budget-value">{formatCurrency(project.budget)}</span>
                </div>
                <div className="project-budget-item">
                  <span className="project-budget-label">Gemaakt</span>
                  <span className="project-budget-value">{formatCurrency(project.kosten)}</span>
                </div>
                <div className="project-budget-item">
                  <span className="project-budget-label">Resterend</span>
                  <span className={`project-budget-value ${resterendBudget < 0 ? 'over-budget' : ''}`}>
                    {formatCurrency(resterendBudget)}
                  </span>
                </div>
                <div className="project-budget-item full-width">
                  <span className="project-budget-label">Budget gebruik</span>
                  <div className="project-budget-bar">
                    <div 
                      className={`project-budget-fill ${budgetPercentage > 100 ? 'over-budget' : ''}`}
                      style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    />
                    {budgetPercentage > 100 && (
                      <div 
                        className="project-budget-over"
                        style={{ width: `${budgetPercentage - 100}%` }}
                      />
                    )}
                  </div>
                  <span className="project-budget-percentage">{budgetPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Activiteiten card */}
            <div className="project-activities-card">
              <h3>Activiteiten</h3>
              <ul className="project-activities-list">
                {project.activiteiten && project.activiteiten.length > 0 ? (
                  project.activiteiten.map((a, idx) => (
                    <li key={idx}>
                      <div className="project-activity-header">
                        <span className="project-activity-date">{formatDate(a.datum)}</span>
                        <span className="project-activity-type">{a.type}</span>
                      </div>
                      <div className="project-activity-desc">{a.beschrijving}</div>
                    </li>
                  ))
                ) : (
                  <li className="empty">Geen activiteiten geregistreerd</li>
                )}
              </ul>
            </div>
          </div>

          {/* Rechter kolom */}
          <div>
            <div className="project-note-card">
              <h3>Nieuwe Activiteit</h3>
              <div className="project-note-form">
                <label htmlFor="project-activiteit-type">Type</label>
                <select
                  id="project-activiteit-type"
                  value={activiteitType}
                  onChange={(e) => setActiviteitType(e.target.value)}
                >
                  <option value="Algemeen">Algemeen</option>
                  <option value="Project gestart">Project gestart</option>
                  <option value="Planning">Planning</option>
                  <option value="Installatie">Installatie</option>
                  <option value="Inspectie">Inspectie</option>
                  <option value="Reparatie">Reparatie</option>
                  <option value="Bestelling">Bestelling</option>
                  <option value="Overleg">Overleg</option>
                  <option value="Afgerond">Afgerond</option>
                </select>
                <label htmlFor="project-activiteit-datum">Datum</label>
                <input
                  id="project-activiteit-datum"
                  type="date"
                  value={activiteitDatum}
                  onChange={(e) => setActiviteitDatum(e.target.value)}
                />
                <label htmlFor="project-activiteit-note">Notitie / Beschrijving</label>
                <textarea
                  id="project-activiteit-note"
                  value={activiteitNote}
                  onChange={(e) => setActiviteitNote(e.target.value)}
                  placeholder="Beschrijf de activiteit..."
                  rows="6"
                />
                <div className="project-note-actions">
                  <button 
                    className="project-note-btn" 
                    onClick={addActiviteit}
                    disabled={!activiteitNote.trim()}
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
