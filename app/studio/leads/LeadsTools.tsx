"use client";

import { useActionState } from "react";
import { buildDemo, importSheet } from "../actions";

export function LeadsTools() {
  const [message, action, pending] = useActionState(importSheet, null);

  return (
    <form action={action} style={{ marginTop: 20 }}>
      <label htmlFor="csv">
        Google E-Tablolar’dan <strong>Dosya → İndir → CSV</strong> ile indirip buraya yapıştırın —
        başlık satırıyla birlikte. Aynı listeyi tekrar yapıştırmak kayıtları güncellemekle kalır,
        çoğaltmaz.
      </label>
      <textarea
        id="csv"
        name="csv"
        style={{ minHeight: 120, fontFamily: "ui-monospace, monospace" }}
      />
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10 }}>
        <button type="submit" disabled={pending}>
          {pending ? "Alınıyor…" : "Listeyi al"}
        </button>
        {message ? <span className="msg">{message}</span> : null}
      </div>
    </form>
  );
}

function BuildButton({ leadId }: { leadId: string }) {
  const [message, action, pending] = useActionState(buildDemo, null);
  return (
    <form action={action}>
      <input type="hidden" name="leadId" value={leadId} />
      <button className="ghost" type="submit" disabled={pending} style={{ padding: "5px 14px" }}>
        {pending ? "…" : "Demo kur"}
      </button>
      {message ? (
        <span className="note" style={{ display: "block", marginTop: 4 }}>
          {message}
        </span>
      ) : null}
    </form>
  );
}

LeadsTools.BuildButton = BuildButton;
