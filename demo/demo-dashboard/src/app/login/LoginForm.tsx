"use client";

import { useState } from "react";
import type { ClientConfig } from "@/lib/clients";

type LoginFormProps = {
  clients: readonly ClientConfig[];
  loginAction: (formData: FormData) => Promise<void>;
};

export default function LoginForm({ clients, loginAction }: LoginFormProps) {
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id ?? "");

  return (
    <form className="login-form" action={loginAction}>
      <h1 className="login-title">Demo dashboard</h1>
      <p className="login-subtitle">
        Meld je aan met een willekeurige gebruikersnaam en kies een klant om het
        maatwerk dashboard te bekijken.
      </p>

      <label className="login-label" htmlFor="email">
        E-mail
      </label>
      <input
        className="login-input"
        type="email"
        id="email"
        name="email"
        placeholder="jij@example.nl"
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
        required
      />

      <label className="login-label" htmlFor="client">
        Kies een klantmap
      </label>
      <select
        className="login-input"
        id="client"
        name="client"
        value={selectedClient}
        onChange={(event) => setSelectedClient(event.target.value)}
        required
      >
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      <button type="submit" className="login-button">
        Inloggen
      </button>
    </form>
  );
}



