import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Brain, BookOpen, Video, Users, Award, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

type MindsetPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function MindsetPage({ params }: MindsetPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  const courses = [
    {
      id: "1",
      title: "Mindset Mastery: Van Twijfel naar Actie",
      category: "Mental Coaching",
      students: 45,
      rating: 4.9,
      duration: "6 weken",
      status: "Actief",
      modules: 8,
    },
    {
      id: "2",
      title: "Overwin Je Belemmerende Overtuigingen",
      category: "Mental Coaching",
      students: 32,
      rating: 4.8,
      duration: "4 weken",
      status: "Actief",
      modules: 6,
    },
    {
      id: "3",
      title: "Consistentie & Discipline Training",
      category: "Mental Coaching",
      students: 28,
      rating: 4.7,
      duration: "8 weken",
      status: "In ontwikkeling",
      modules: 10,
    },
  ];

  const resources = [
    {
      id: "1",
      title: "Mindset Assessment Tool",
      type: "Tool",
      downloads: 156,
      category: "Assessment",
    },
    {
      id: "2",
      title: "Weekplanner voor Doelen",
      type: "Template",
      downloads: 203,
      category: "Planning",
    },
    {
      id: "3",
      title: "Motivatie & Discipline Gids",
      type: "E-book",
      downloads: 189,
      category: "Gids",
    },
  ];

  const stats = {
    totalCourses: courses.length,
    activeCourses: courses.filter((c) => c.status === "Actief").length,
    totalStudents: courses.reduce((sum, c) => sum + c.students, 0),
    avgRating: (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1),
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Mindset & Academy</h1>
        <button className="btn btn--primary">
          <Plus size={16} />
          Nieuw Cursus
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.totalCourses}</h3>
          <p>Totaal Cursussen</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.activeCourses}</h3>
          <p>Actief</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.totalStudents}</h3>
          <p>Studenten</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.avgRating} ⭐</h3>
          <p>Gem. Beoordeling</p>
        </div>
      </div>

      {/* Courses Section */}
      <div className="page-section">
        <h2 className="page-section__title">Online Academy Cursussen</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Cursus</th>
                  <th>Categorie</th>
                  <th>Studenten</th>
                  <th>Duur</th>
                  <th>Modules</th>
                  <th>Beoordeling</th>
                  <th>Status</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="dashboard-table__row--clickable">
                    <td>
                      <Link href={`/clients/${client.id}/mindset/${course.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <strong>{course.title}</strong>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/mindset/${course.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className="dashboard-table__type">{course.category}</span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/mindset/${course.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {course.students}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/mindset/${course.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {course.duration}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/mindset/${course.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {course.modules}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/mindset/${course.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className="dashboard-badge dashboard-badge--actief">
                          {course.rating} ⭐
                        </span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/mindset/${course.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className={`dashboard-badge dashboard-badge--${course.status.toLowerCase().replace(" ", "-")}`}>
                          {course.status}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <Link href={`/clients/${client.id}/mindset/${course.id}`} className="dashboard-action-btn" title="Bekijken">
                          <Video size={16} />
                        </Link>
                        <button className="dashboard-action-btn" title="Bewerken">
                          <BookOpen size={16} />
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

      {/* Resources Section */}
      <div className="page-section">
        <h2 className="page-section__title">Downloads & Resources</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Type</th>
                  <th>Categorie</th>
                  <th>Downloads</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.id}>
                    <td>
                      <strong>{resource.title}</strong>
                    </td>
                    <td>
                      <span className="dashboard-table__type">{resource.type}</span>
                    </td>
                    <td>{resource.category}</td>
                    <td>{resource.downloads}</td>
                    <td>
                      <div className="dashboard-actions">
                        <button className="dashboard-action-btn" title="Downloaden">
                          <Brain size={16} />
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

