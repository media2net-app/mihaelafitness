"use client";

import { useParams } from "next/navigation";
import { rimatoDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, Globe, User, Building2, FileText, CheckCircle, AlertCircle, Plus, Clock, TrendingUp } from "lucide-react";

interface Lead {
  id: string;
  bedrijf: string;
  contact: string;
  email: string;
  telefoon: string;
  dienst: string;
  beschrijving: string;
  bron: string;
  datum: string;
  status: string;
}

export default function LeadIntakePage() {
  const params = useParams();
  const clientId = (params?.client as string) || "rimato";
  const { intake } = rimatoDashboardData.leads;

  const [formData, setFormData] = useState({
    bedrijf: "",
    contact: "",
    email: "",
    telefoon: "",
    dienst: "",
    beschrijving: "",
    bron: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  const diensten = ["Industriële reiniging", "Rioolbeheer", "Gevelbeheer"];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bedrijf.trim()) {
      newErrors.bedrijf = "Bedrijfsnaam is verplicht";
    }
    if (!formData.contact.trim()) {
      newErrors.contact = "Contactpersoon is verplicht";
    }
    if (!formData.email.trim()) {
      newErrors.email = "E-mail is verplicht";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ongeldig e-mailadres";
    }
    if (!formData.dienst) {
      newErrors.dienst = "Selecteer een dienst";
    }
    if (!formData.beschrijving.trim()) {
      newErrors.beschrijving = "Beschrijving is verplicht";
    }
    if (!formData.bron) {
      newErrors.bron = "Selecteer een bron";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newLead: Lead = {
      id: `LEAD-${Date.now()}`,
      ...formData,
      datum: new Date().toISOString(),
      status: "Nieuw",
    };

    setRecentLeads([newLead, ...recentLeads].slice(0, 5));
    setIsSuccess(true);
    setIsSubmitting(false);

    // Reset form
    setFormData({
      bedrijf: "",
      contact: "",
      email: "",
      telefoon: "",
      dienst: "",
      beschrijving: "",
      bron: "",
    });

    setTimeout(() => setIsSuccess(false), 5000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "Webformulier":
        return <Globe size={20} />;
      case "E-mail":
        return <Mail size={20} />;
      case "Telefoon":
        return <Phone size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <Link href={`/clients/${clientId}/leads`} className="btn btn--secondary">
          <ArrowLeft size={16} />
          Terug naar Leads
        </Link>
        <div style={{ flex: 1 }}>
          <h1>Lead Intake</h1>
          <p className="client-tagline">Automatische en handmatige invoer van potentiële opdrachten.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Configuratie */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <h2>Configuratie</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--rimato-text-muted)" }}>
                Lead Bronnen
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {intake.sources.map((source) => (
                  <div
                    key={source}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      background: "rgba(237, 29, 36, 0.05)",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(237, 29, 36, 0.1)",
                    }}
                  >
                    {getSourceIcon(source)}
                    <span style={{ fontWeight: 500 }}>{source}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--rimato-text-muted)" }}>
                Verplichte Velden
              </h3>
              <div className="dashboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>Veld</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intake.fields.map((field) => (
                      <tr key={field.key}>
                        <td>{field.label}</td>
                        <td>
                          <code style={{ fontSize: "0.8125rem", color: "var(--rimato-text-muted)" }}>{field.key}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Nieuwe Lead Invoeren */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <h2>Nieuwe Lead Invoeren</h2>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {isSuccess && (
              <div
                style={{
                  padding: "1rem",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  borderRadius: "0.75rem",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                <CheckCircle size={20} />
                <span style={{ fontWeight: 600 }}>Lead succesvol toegevoegd!</span>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Bedrijfsnaam *
              </label>
              <input
                type="text"
                className="page-search"
                value={formData.bedrijf}
                onChange={(e) => handleInputChange("bedrijf", e.target.value)}
                placeholder="Bijv. Machinefabriek De Vries"
                style={{ borderColor: errors.bedrijf ? "#ef4444" : undefined }}
              />
              {errors.bedrijf && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", color: "#ef4444", fontSize: "0.875rem" }}>
                  <AlertCircle size={14} />
                  {errors.bedrijf}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Contactpersoon *
              </label>
              <input
                type="text"
                className="page-search"
                value={formData.contact}
                onChange={(e) => handleInputChange("contact", e.target.value)}
                placeholder="Bijv. Jan de Vries"
                style={{ borderColor: errors.contact ? "#ef4444" : undefined }}
              />
              {errors.contact && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", color: "#ef4444", fontSize: "0.875rem" }}>
                  <AlertCircle size={14} />
                  {errors.contact}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  E-mail *
                </label>
                <input
                  type="email"
                  className="page-search"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="info@bedrijf.nl"
                  style={{ borderColor: errors.email ? "#ef4444" : undefined }}
                />
                {errors.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", color: "#ef4444", fontSize: "0.875rem" }}>
                    <AlertCircle size={14} />
                    {errors.email}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Telefoon
                </label>
                <input
                  type="tel"
                  className="page-search"
                  value={formData.telefoon}
                  onChange={(e) => handleInputChange("telefoon", e.target.value)}
                  placeholder="0528-123456"
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Gewenste Dienst *
              </label>
              <select
                className="page-filter"
                value={formData.dienst}
                onChange={(e) => handleInputChange("dienst", e.target.value)}
                style={{ borderColor: errors.dienst ? "#ef4444" : undefined }}
              >
                <option value="">Selecteer dienst</option>
                {diensten.map((dienst) => (
                  <option key={dienst} value={dienst}>
                    {dienst}
                  </option>
                ))}
              </select>
              {errors.dienst && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", color: "#ef4444", fontSize: "0.875rem" }}>
                  <AlertCircle size={14} />
                  {errors.dienst}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Projectomschrijving *
              </label>
              <textarea
                className="page-search"
                rows={4}
                value={formData.beschrijving}
                onChange={(e) => handleInputChange("beschrijving", e.target.value)}
                placeholder="Beschrijf het project of de vraag..."
                style={{ borderColor: errors.beschrijving ? "#ef4444" : undefined, resize: "vertical" }}
              />
              {errors.beschrijving && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", color: "#ef4444", fontSize: "0.875rem" }}>
                  <AlertCircle size={14} />
                  {errors.beschrijving}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Bron van Lead *
              </label>
              <select
                className="page-filter"
                value={formData.bron}
                onChange={(e) => handleInputChange("bron", e.target.value)}
                style={{ borderColor: errors.bron ? "#ef4444" : undefined }}
              >
                <option value="">Selecteer bron</option>
                {intake.sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              {errors.bron && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", color: "#ef4444", fontSize: "0.875rem" }}>
                  <AlertCircle size={14} />
                  {errors.bron}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
              style={{ marginTop: "0.5rem", opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <>
                  <Clock size={16} />
                  Verwerken...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Lead Toevoegen
                </>
              )}
            </button>
          </form>
        </section>
      </div>

      {/* Recent Ingevoerde Leads */}
      {recentLeads.length > 0 && (
        <section className="dashboard-card" style={{ marginTop: "1.5rem" }}>
          <div className="dashboard-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Recent Ingevoerde Leads</h2>
            <Link href={`/clients/${clientId}/leads/pipeline`} className="btn btn--secondary" style={{ textDecoration: "none" }}>
              Bekijk Pipeline →
            </Link>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Bedrijf</th>
                  <th>Contact</th>
                  <th>Dienst</th>
                  <th>Bron</th>
                  <th>Datum</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong>{lead.bedrijf}</strong>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <span>{lead.contact}</span>
                        <span style={{ fontSize: "0.8125rem", color: "var(--rimato-text-muted)" }}>{lead.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="dashboard-badge dashboard-badge--actief">{lead.dienst}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {getSourceIcon(lead.bron)}
                        <span>{lead.bron}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                        <Clock size={14} />
                        {new Date(lead.datum).toLocaleDateString("nl-NL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td>
                      <span className="dashboard-badge dashboard-badge--lopend">{lead.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}


