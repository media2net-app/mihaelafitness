"use client";

import { useParams } from "next/navigation";
import { rimatoDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Phone, Building2, Euro, Calendar, TrendingUp, XCircle, CheckCircle, Circle, Send, DollarSign } from "lucide-react";

interface Lead {
  id: string;
  bedrijf: string;
  contact: string;
  email: string;
  project: string;
  dienst: string;
  waarde: number;
  followUpDate: string;
  stageId: string;
}

export default function PipelinePage() {
  const params = useParams();
  const clientId = (params?.client as string) || "rimato";
  const { pipeline } = rimatoDashboardData.leads;

  const [leads, setLeads] = useState<Lead[]>(pipeline.leads || []);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [draggedOverStage, setDraggedOverStage] = useState<string | null>(null);

  const getStageIcon = (stageId: string) => {
    switch (stageId) {
      case "nieuw":
        return <Circle size={16} style={{ color: "#3b82f6" }} />;
      case "gekvalificeerd":
        return <CheckCircle size={16} style={{ color: "#10b981" }} />;
      case "offerte":
        return <Send size={16} style={{ color: "#f59e0b" }} />;
      case "winst":
        return <DollarSign size={16} style={{ color: "#10b981" }} />;
      case "verlies":
        return <XCircle size={16} style={{ color: "#ef4444" }} />;
      default:
        return <Circle size={16} />;
    }
  };

  const getStageColor = (stageId: string) => {
    switch (stageId) {
      case "nieuw":
        return { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)", text: "#3b82f6" };
      case "gekvalificeerd":
        return { bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.3)", text: "#10b981" };
      case "offerte":
        return { bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)", text: "#f59e0b" };
      case "winst":
        return { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.4)", text: "#10b981" };
      case "verlies":
        return { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.3)", text: "#ef4444" };
      default:
        return { bg: "rgba(100, 116, 139, 0.1)", border: "rgba(100, 116, 139, 0.3)", text: "#64748b" };
    }
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", lead.id);
    (e.target as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
    setDraggedLead(null);
    setDraggedOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggedOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDraggedOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    setDraggedOverStage(null);

    if (draggedLead && draggedLead.stageId !== targetStageId) {
      setLeads((prevLeads) =>
        prevLeads.map((lead) => (lead.id === draggedLead.id ? { ...lead, stageId: targetStageId } : lead))
      );
    }

    setDraggedLead(null);
  };

  const getLeadsForStage = (stageId: string) => {
    return leads.filter((lead) => lead.stageId === stageId);
  };

  const getTotalValue = (stageId: string) => {
    return getLeadsForStage(stageId).reduce((sum, lead) => sum + lead.waarde, 0);
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <Link href={`/clients/${clientId}/leads`} className="btn btn--secondary">
          <ArrowLeft size={16} />
          Terug naar Leads
        </Link>
        <div style={{ flex: 1 }}>
          <h1>Sales Pipeline Tracking</h1>
          <p className="client-tagline">Visueel overzicht van de status van elke lead met geautomatiseerde opvolgtaken.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {pipeline.stages.map((stage) => {
          const stageLeads = getLeadsForStage(stage.id);
          const totalValue = getTotalValue(stage.id);
          return (
            <div
              key={stage.id}
              className="dashboard-card"
              style={{
                padding: "1rem",
                textAlign: "center",
                background: getStageColor(stage.id).bg,
                border: `2px solid ${getStageColor(stage.id).border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                {getStageIcon(stage.id)}
                <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: getStageColor(stage.id).text }}>
                  {stage.name}
                </h3>
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: getStageColor(stage.id).text, marginBottom: "0.25rem" }}>
                {stageLeads.length}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--rimato-text-muted)" }}>
                €{totalValue.toLocaleString("nl-NL")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.25rem", minHeight: "600px" }}>
        {pipeline.stages.map((stage) => {
          const stageLeads = getLeadsForStage(stage.id);
          const isDraggedOver = draggedOverStage === stage.id;
          const colors = getStageColor(stage.id);

          return (
            <div
              key={stage.id}
              className="dashboard-card"
              style={{
                minHeight: "500px",
                padding: "1.25rem",
                background: isDraggedOver ? colors.bg : undefined,
                border: `2px solid ${isDraggedOver ? colors.border : "var(--rimato-border-light)"}`,
                transition: "all 0.3s ease",
              }}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                  paddingBottom: "1rem",
                  borderBottom: "2px solid var(--rimato-border-light)",
                }}
              >
                {getStageIcon(stage.id)}
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: colors.text }}>
                    {stage.name}
                  </h2>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "var(--rimato-text-muted)" }}>
                    {stage.description}
                  </p>
                </div>
                <div
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    borderRadius: "9999px",
                    padding: "0.25rem 0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    minWidth: "2rem",
                    textAlign: "center",
                  }}
                >
                  {stageLeads.length}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: "400px" }}>
                {stageLeads.length === 0 && (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "var(--rimato-text-light)",
                      fontSize: "0.875rem",
                      border: "2px dashed var(--rimato-border-light)",
                      borderRadius: "0.75rem",
                      background: "rgba(237, 29, 36, 0.02)",
                    }}
                  >
                    Geen leads in deze fase
                  </div>
                )}

                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onDragEnd={handleDragEnd}
                    className="dashboard-card"
                    style={{
                      padding: "1rem",
                      cursor: "grab",
                      background: "rgba(255, 255, 255, 0.95)",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "0.875rem",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 700, color: "var(--rimato-text)" }}>
                          {lead.bedrijf}
                        </h4>
                        <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--rimato-text-muted)" }}>{lead.project}</p>
                      </div>
                      <span
                        className="dashboard-badge"
                        style={{
                          background: colors.bg,
                          color: colors.text,
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                        }}
                      >
                        {lead.dienst}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--rimato-text-muted)" }}>
                        <Building2 size={14} />
                        <span>{lead.contact}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--rimato-text-muted)" }}>
                        <Mail size={14} />
                        <span>{lead.email}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid var(--rimato-border-light)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--rimato-text-muted)" }}>
                        <Calendar size={14} />
                        <span>Opvolgen: {new Date(lead.followUpDate).toLocaleDateString("nl-NL")}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.875rem", fontWeight: 700, color: colors.text }}>
                        <Euro size={14} />
                        <span>€{lead.waarde.toLocaleString("nl-NL")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
