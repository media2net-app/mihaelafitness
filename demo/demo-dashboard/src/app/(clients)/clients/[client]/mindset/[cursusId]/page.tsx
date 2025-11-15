import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Brain, BookOpen, Video, Users, Award, Clock, CheckCircle2, PlayCircle, FileText, Edit, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

type CursusDetailPageProps = {
  params: Promise<{ client: string; cursusId: string }> | { client: string; cursusId: string };
};

export default async function CursusDetailPage({ params }: CursusDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  // Mock cursus data
  const cursus = {
    id: resolvedParams.cursusId,
    title: "Mindset Mastery: Van Twijfel naar Actie",
    description: "Een uitgebreide cursus over het ontwikkelen van een sterke mindset en het overwinnen van belemmerende overtuigingen. Leer hoe je consistentie en discipline kunt opbouwen.",
    category: "Mental Coaching",
    duration: "6 weken",
    modules: 8,
    students: 45,
    rating: 4.9,
    status: "Actief",
    createdAt: "2024-09-01",
  };

  const modules = [
    {
      id: "1",
      title: "Introductie: Wat is Mindset?",
      duration: "15 min",
      type: "Video",
      unlocked: true,
      completed: true,
      order: 1,
    },
    {
      id: "2",
      title: "Belemmerende Overtuigingen Identificeren",
      duration: "25 min",
      type: "Video + Opdracht",
      unlocked: true,
      completed: true,
      order: 2,
    },
    {
      id: "3",
      title: "Van Fixed naar Growth Mindset",
      duration: "30 min",
      type: "Video + Quiz",
      unlocked: true,
      completed: false,
      order: 3,
    },
    {
      id: "4",
      title: "Consistentie Opbouwen",
      duration: "20 min",
      type: "Video",
      unlocked: true,
      completed: false,
      order: 4,
    },
    {
      id: "5",
      title: "Discipline & Doorzettingsvermogen",
      duration: "35 min",
      type: "Video + Opdracht",
      unlocked: false,
      completed: false,
      order: 5,
    },
    {
      id: "6",
      title: "Doelen Stellen & Behalen",
      duration: "25 min",
      type: "Video",
      unlocked: false,
      completed: false,
      order: 6,
    },
    {
      id: "7",
      title: "Obstakels Overwinnen",
      duration: "30 min",
      type: "Video + Quiz",
      unlocked: false,
      completed: false,
      order: 7,
    },
    {
      id: "8",
      title: "Certificering & Vervolgstappen",
      duration: "15 min",
      type: "Video + Certificaat",
      unlocked: false,
      completed: false,
      order: 8,
    },
  ];

  const studenten = [
    { id: "1", naam: "Marijn Besseler", voortgang: 75, laatsteActiviteit: "2024-12-15" },
    { id: "2", naam: "Erwin Altena", voortgang: 100, laatsteActiviteit: "2024-12-14" },
    { id: "3", naam: "Sarah de Vries", voortgang: 50, laatsteActiviteit: "2024-12-13" },
    { id: "4", naam: "Kristel Kwant", voortgang: 25, laatsteActiviteit: "2024-12-10" },
  ];

  const stats = {
    gemiddeldeVoortgang: Math.round(studenten.reduce((sum, s) => sum + s.voortgang, 0) / studenten.length),
    voltooideCursussen: studenten.filter((s) => s.voortgang === 100).length,
    actieveStudenten: studenten.filter((s) => s.voortgang < 100 && s.voortgang > 0).length,
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <Link href={`/clients/${client.id}/mindset`} className="dashboard-card__link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} />
            Terug naar Mindset & Academy
          </Link>
          <h1>{cursus.title}</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{cursus.description}</p>
        </div>
        <button className="btn btn--primary">
          <Edit size={16} />
          Bewerken
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{cursus.students}</h3>
          <p>Studenten</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.actieveStudenten}</h3>
          <p>Actief</p>
        </div>
        <div className="page-stat-card page-stat-card--completed">
          <h3>{stats.voltooideCursussen}</h3>
          <p>Voltooid</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.gemiddeldeVoortgang}%</h3>
          <p>Gem. Voortgang</p>
        </div>
        <div className="page-stat-card">
          <h3>{cursus.rating} ⭐</h3>
          <p>Beoordeling</p>
        </div>
      </div>

      {/* Cursus Info */}
      <div className="page-card">
        <div className="dashboard-card__header">
          <h2>Cursus Informatie</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <p><strong>Categorie:</strong> {cursus.category}</p>
            <p><strong>Duur:</strong> {cursus.duration}</p>
            <p><strong>Modules:</strong> {cursus.modules}</p>
          </div>
          <div>
            <p><strong>Status:</strong> <span className="dashboard-badge dashboard-badge--actief">{cursus.status}</span></p>
            <p><strong>Aangemaakt:</strong> {new Date(cursus.createdAt).toLocaleDateString("nl-NL")}</p>
            <p><strong>Beoordeling:</strong> {cursus.rating} ⭐</p>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Modules ({modules.length})</h2>
            <button className="btn btn--secondary">
              <Plus size={16} />
              Module Toevoegen
            </button>
          </div>
          <div className="dashboard-list">
            {modules.map((module) => (
              <div key={module.id} className="dashboard-list__item">
                <div className="dashboard-list__main">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>#{module.order}</span>
                    <h4>{module.title}</h4>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <span className="dashboard-list__meta">
                      <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      {module.duration}
                    </span>
                    <span className="dashboard-list__meta">{module.type}</span>
                  </div>
                </div>
                <div className="dashboard-list__side">
                  {module.completed ? (
                    <span className="dashboard-badge dashboard-badge--voltooid">
                      <CheckCircle2 size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      Voltooid
                    </span>
                  ) : module.unlocked ? (
                    <span className="dashboard-badge dashboard-badge--actief">Open</span>
                  ) : (
                    <span className="dashboard-badge dashboard-badge--gepland">Geblokkeerd</span>
                  )}
                  <div className="dashboard-actions" style={{ marginTop: '0.5rem' }}>
                    <button className="dashboard-action-btn" title="Bekijken">
                      <PlayCircle size={16} />
                    </button>
                    <button className="dashboard-action-btn" title="Bewerken">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Studenten Overzicht */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Studenten ({studenten.length})</h2>
            <Link href={`/clients/${client.id}/mindset/${cursus.id}/studenten`} className="dashboard-card__link">
              Bekijk alle →
            </Link>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Voortgang</th>
                  <th>Laatste Activiteit</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {studenten.map((student) => (
                  <tr key={student.id}>
                    <td><strong>{student.naam}</strong></td>
                    <td>
                      <div className="dashboard-progress">
                        <div className="dashboard-progress__bar" style={{ width: `${student.voortgang}%` }}></div>
                        <span>{student.voortgang}%</span>
                      </div>
                    </td>
                    <td>{new Date(student.laatsteActiviteit).toLocaleDateString("nl-NL")}</td>
                    <td>
                      <div className="dashboard-actions">
                        <button className="dashboard-action-btn" title="Bekijken">
                          <Users size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

