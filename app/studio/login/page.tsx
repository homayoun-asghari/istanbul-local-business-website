"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} style={{ maxWidth: 320, marginTop: "18vh" }}>
      <h1>Vitrin Studio</h1>
      <p className="note" style={{ marginTop: 0, marginBottom: 20 }}>
        Devam etmek için parolayı girin.
      </p>
      <label htmlFor="password">Parola</label>
      <input
        id="password"
        name="password"
        type="password"
        autoFocus
        autoComplete="current-password"
      />
      {error ? (
        <p className="msg" style={{ marginTop: 12, color: "#a33" }}>
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} style={{ marginTop: 16 }}>
        {pending ? "Kontrol ediliyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
