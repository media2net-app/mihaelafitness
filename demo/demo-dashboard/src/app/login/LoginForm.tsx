"use client";

import { useState } from "react";
import type { ClientConfig } from "@/lib/clients";
import { X } from "lucide-react";

type LoginFormProps = {
  clients: readonly ClientConfig[];
  loginAction: (clientId: string) => Promise<void>;
};

const VALID_EMAIL = "chiel@media2net.nl";
const VALID_PASSWORD = "W4t3rk0k3r^";

export default function LoginForm({ clients, loginAction }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Valideer email en wachtwoord
    if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
      setError("Ongeldige e-mail of wachtwoord");
      return;
    }

    // Toon modal met klantkeuze
    setShowClientModal(true);
  };

  const handleClientSelect = async (clientId: string) => {
    setShowClientModal(false);
    await loginAction(clientId);
  };

  return (
    <>
      <form className="login-form" onSubmit={handleLogin}>
        <h1 className="login-title">Demo dashboard</h1>
        <p className="login-subtitle">
          Meld je aan om toegang te krijgen tot het maatwerk dashboard.
        </p>

        {error && (
          <div
            className="login-error"
            style={{
              padding: "0.75rem",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "0.5rem",
              color: "#fca5a5",
              marginBottom: "1rem",
              backdropFilter: "blur(10px)",
            }}
          >
            {error}
          </div>
        )}

        <label className="login-label" htmlFor="email">
          E-mail
        </label>
        <input
          className="login-input"
          type="email"
          id="email"
          name="email"
          placeholder="jij@example.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="login-label" htmlFor="password">
          Wachtwoord
        </label>
        <input
          className="login-input"
          type="password"
          id="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-button">
          Inloggen
        </button>
      </form>

      {/* Client Selectie Modal */}
      {showClientModal && (
        <div
          className="login-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={() => setShowClientModal(false)}
        >
          <div
            className="login-modal"
            style={{
              maxWidth: "500px",
              width: "100%",
              position: "relative",
              background: "rgba(30, 41, 59, 0.5)",
              backdropFilter: "blur(20px)",
              borderRadius: "1.5rem",
              padding: "2rem",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <h2 style={{ margin: 0, color: "#ffffff", fontSize: "1.5rem", fontWeight: 700 }}>Kies een klantmap</h2>
              <button
                onClick={() => setShowClientModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  color: "#94a3b8",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleClientSelect(client.id)}
                  className="login-client-btn"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "0.75rem",
                    color: "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(59, 130, 246, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <strong style={{ fontSize: "1.1rem", color: "#ffffff" }}>{client.name}</strong>
                  <span style={{ fontSize: "0.9rem", color: "#cbd5e1", marginTop: "0.25rem" }}>
                    {client.tagline}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



