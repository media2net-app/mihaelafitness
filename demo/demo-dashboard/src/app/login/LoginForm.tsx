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
            style={{
              padding: "0.75rem",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "0.5rem",
              color: "#991b1b",
              marginBottom: "1rem",
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
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={() => setShowClientModal(false)}
        >
          <div
            className="page-card"
            style={{
              maxWidth: "500px",
              width: "100%",
              position: "relative",
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
                borderBottom: "2px solid var(--client-border)",
              }}
            >
              <h2 style={{ margin: 0 }}>Kies een klantmap</h2>
              <button
                onClick={() => setShowClientModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  color: "#64748b",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleClientSelect(client.id)}
                  className="btn btn--primary"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <strong style={{ fontSize: "1.1rem" }}>{client.name}</strong>
                  <span style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "0.25rem" }}>
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



