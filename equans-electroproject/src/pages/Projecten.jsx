import Sidebar from '../components/Sidebar';
import './Projecten.css';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    voortgang: 65
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
    voortgang: 42
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
    voortgang: 100
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
    voortgang: 0
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
    voortgang: 58
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
    voortgang: 78
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

export default function Projecten(){
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterManager, setFilterManager] = useState('all');

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return demoProjects.filter(p => {
      const matchesSearch = p.naam.toLowerCase().includes(s) || 
                           p.klant.toLowerCase().includes(s) || 
                           p.id.toLowerCase().includes(s);
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesManager = filterManager === 'all' || p.projectmanager === filterManager;
      return matchesSearch && matchesStatus && matchesManager;
    });
  }, [search, filterStatus, filterManager]);

  const uniekeStatussen = useMemo(() => {
    const statussen = [...new Set(demoProjects.map(p => p.status))];
    return statussen.sort();
  }, []);

  const uniekeManagers = useMemo(() => {
    const managers = [...new Set(demoProjects.map(p => p.projectmanager))];
    return managers.sort();
  }, []);

  const getStatusClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('afgerond')) return 'completed';
    if (statusLower.includes('uitvoering')) return 'in-progress';
    if (statusLower.includes('gepland')) return 'planned';
    return 'other';
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('afgerond')) return '#0e3b33';
    if (statusLower.includes('uitvoering')) return '#2d4a5a';
    if (statusLower.includes('gepland')) return '#3b2e1a';
    return '#3b2e1a';
  };

  const getStatusTextColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('afgerond')) return '#9ff6cc';
    if (statusLower.includes('uitvoering')) return '#9ec9d6';
    if (statusLower.includes('gepland')) return '#ffd699';
    return '#d2dee4';
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main projecten-main">
        <div className="projecten-titlebar">
          <h1>Projecten</h1>
          <div className="projecten-filters">
            <input 
              className="projecten-search" 
              placeholder="Zoek project (naam, klant of ID)" 
              value={search} 
              onChange={(e)=>setSearch(e.target.value)} 
            />
            <select 
              className="projecten-filter" 
              value={filterStatus} 
              onChange={(e)=>setFilterStatus(e.target.value)}
            >
              <option value="all">Alle statussen</option>
              {uniekeStatussen.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select 
              className="projecten-filter" 
              value={filterManager} 
              onChange={(e)=>setFilterManager(e.target.value)}
            >
              <option value="all">Alle projectmanagers</option>
              {uniekeManagers.map(manager => (
                <option key={manager} value={manager}>{manager}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="projecten-table-wrap">
          <table className="projecten-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Projectnaam</th>
                <th>Klant</th>
                <th>Status</th>
                <th>Projectmanager</th>
                <th>Budget</th>
                <th>Kosten</th>
                <th>Voortgang</th>
                <th>Startdatum</th>
                <th>Einddatum</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(project => (
                <tr 
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{project.id}</td>
                  <td className="project-naam">{project.naam}</td>
                  <td>{project.klant}</td>
                  <td>
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
                  </td>
                  <td>{project.projectmanager}</td>
                  <td>{formatCurrency(project.budget)}</td>
                  <td>{project.kosten > 0 ? formatCurrency(project.kosten) : '-'}</td>
                  <td>
                    <div className="project-voortgang">
                      <div className="project-voortgang-bar">
                        <div 
                          className="project-voortgang-fill" 
                          style={{ width: `${project.voortgang}%` }}
                        />
                      </div>
                      <span className="project-voortgang-text">{project.voortgang}%</span>
                    </div>
                  </td>
                  <td>{formatDate(project.startdatum)}</td>
                  <td>{formatDate(project.einddatum)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="projecten-empty">
            <p>Geen projecten gevonden met deze filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
