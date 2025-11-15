import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Edit, Eye, Share2, Trash2, Download, Plus } from "lucide-react";

type ContentPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function ContentPage({ params }: ContentPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  const blogs = [
    {
      id: "1",
      title: "Afvallen met een personal trainer in Hoogeveen",
      category: "Afvallen",
      date: "2024-11-15",
      status: "Gepubliceerd",
      views: 1245,
      author: "Nick Neumann",
    },
    {
      id: "2",
      title: "Personal training voor vrouwen in Hoogeveen",
      category: "Vrouwen",
      date: "2024-10-20",
      status: "Gepubliceerd",
      views: 892,
      author: "Nick Neumann",
    },
    {
      id: "3",
      title: "Revalidatietraining in Hoogeveen",
      category: "Revalidatie",
      date: "2024-09-10",
      status: "Gepubliceerd",
      views: 1567,
      author: "Nick Neumann",
    },
    {
      id: "4",
      title: "Duo personal training in Hoogeveen",
      category: "Training",
      date: "2024-08-25",
      status: "Gepubliceerd",
      views: 634,
      author: "Nick Neumann",
    },
    {
      id: "5",
      title: "De voordelen van trainen met een balanstrainer",
      category: "Training",
      date: "2024-12-01",
      status: "Concept",
      views: 0,
      author: "Nick Neumann",
    },
    {
      id: "6",
      title: "Online voedingscoach in Hoogeveen",
      category: "Voeding",
      date: "2024-11-05",
      status: "Gepubliceerd",
      views: 723,
      author: "Nick Neumann",
    },
  ];

  const downloads = [
    {
      id: "1",
      name: "Gratis e-book: 15 tips voor een fitter lichaam",
      type: "E-book",
      downloads: 342,
      date: "2024-10-01",
      status: "Actief",
    },
    {
      id: "2",
      name: "Voedingsschema template",
      type: "PDF",
      downloads: 189,
      date: "2024-09-15",
      status: "Actief",
    },
    {
      id: "3",
      name: "Trainingsschema beginners",
      type: "PDF",
      downloads: 256,
      date: "2024-08-20",
      status: "Actief",
    },
  ];

  const stats = {
    totalBlogs: blogs.length,
    published: blogs.filter((b) => b.status === "Gepubliceerd").length,
    drafts: blogs.filter((b) => b.status === "Concept").length,
    totalViews: blogs.reduce((sum, b) => sum + b.views, 0),
    totalDownloads: downloads.reduce((sum, d) => sum + d.downloads, 0),
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Content Beheer</h1>
        <div className="page-header__actions">
          <button className="btn btn--secondary">
            <Plus size={16} />
            Nieuw Blog
          </button>
          <button className="btn btn--primary">
            <Plus size={16} />
            Nieuwe Download
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.totalBlogs}</h3>
          <p>Totaal Blogs</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.published}</h3>
          <p>Gepubliceerd</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.drafts}</h3>
          <p>Concepten</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.totalViews.toLocaleString("nl-NL")}</h3>
          <p>Totale Weergaven</p>
        </div>
        <div className="page-stat-card page-stat-card--primary">
          <h3>{stats.totalDownloads}</h3>
          <p>Downloads</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="page-tabs">
        <button className="page-tab page-tab--active">Blogs</button>
        <button className="page-tab">Downloads</button>
      </div>

      {/* Blogs Section */}
      <div className="page-section">
        <div className="page-filters">
          <select className="page-filter">
            <option>Alle categorieën</option>
            <option>Afvallen</option>
            <option>Vrouwen</option>
            <option>Revalidatie</option>
            <option>Training</option>
            <option>Voeding</option>
          </select>
          <select className="page-filter">
            <option>Alle statussen</option>
            <option>Gepubliceerd</option>
            <option>Concept</option>
          </select>
          <input
            type="search"
            placeholder="Zoek blogs..."
            className="page-search"
          />
        </div>

        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Titel</th>
                  <th>Categorie</th>
                  <th>Datum</th>
                  <th>Auteur</th>
                  <th>Status</th>
                  <th>Weergaven</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <strong>{blog.title}</strong>
                    </td>
                    <td>
                      <span className="dashboard-table__type">{blog.category}</span>
                    </td>
                    <td>{new Date(blog.date).toLocaleDateString("nl-NL")}</td>
                    <td>{blog.author}</td>
                    <td>
                      <span className={`dashboard-badge dashboard-badge--${blog.status.toLowerCase()}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td>{blog.views.toLocaleString("nl-NL")}</td>
                    <td>
                      <div className="dashboard-actions">
                        <button className="dashboard-action-btn" title="Bewerken">
                          <Edit size={16} />
                        </button>
                        <button className="dashboard-action-btn" title="Bekijken">
                          <Eye size={16} />
                        </button>
                        <button className="dashboard-action-btn" title="Delen">
                          <Share2 size={16} />
                        </button>
                        <button className="dashboard-action-btn" title="Verwijderen">
                          <Trash2 size={16} />
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

      {/* Downloads Section */}
      <div className="page-section">
        <h2 className="page-section__title">Downloads</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Type</th>
                  <th>Datum</th>
                  <th>Downloads</th>
                  <th>Status</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((download) => (
                  <tr key={download.id}>
                    <td>
                      <strong>{download.name}</strong>
                    </td>
                    <td>
                      <span className="dashboard-table__type">{download.type}</span>
                    </td>
                    <td>{new Date(download.date).toLocaleDateString("nl-NL")}</td>
                    <td>{download.downloads}</td>
                    <td>
                      <span className={`dashboard-badge dashboard-badge--${download.status.toLowerCase()}`}>
                        {download.status}
                      </span>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <button className="dashboard-action-btn" title="Bewerken">
                          <Edit size={16} />
                        </button>
                        <button className="dashboard-action-btn" title="Downloaden">
                          <Download size={16} />
                        </button>
                        <button className="dashboard-action-btn" title="Verwijderen">
                          <Trash2 size={16} />
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

