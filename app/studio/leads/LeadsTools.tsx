"use client";

import { useActionState } from "react";
import { addLead, buildDemo, importSheet } from "../actions";

export function ImportLeads() {
  const [message, action, pending] = useActionState(importSheet, null);

  return (
    <form action={action} style={{ marginTop: 20 }}>
      <label htmlFor="csv">
        Paste a CSV export of your sheet, header row included (Google Sheets →{" "}
        <strong>File → Download → CSV</strong>). Re-pasting the same list updates rows rather than
        duplicating them.
      </label>
      <textarea
        id="csv"
        name="csv"
        style={{ minHeight: 120, fontFamily: "ui-monospace, monospace" }}
      />
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10 }}>
        <button type="submit" disabled={pending}>
          {pending ? "Importing…" : "Import"}
        </button>
        {message ? <span className="msg">{message}</span> : null}
      </div>
    </form>
  );
}

/**
 * One lead at a time. Only the business name and phone are required — everything else can
 * be filled in later, and a lead with no photo or district simply cannot have a demo built
 * until it is.
 *
 * This was a collapsed <details> and went unnoticed: the operator looked for it, did not
 * see a disclosure triangle under the CSV box, and reported the feature missing. A form
 * you have to discover is a form that does not exist.
 */
export function AddLead() {
  const [message, action, pending] = useActionState(addLead, null);

  return (
    <section style={{ marginTop: 28 }}>
      <h2>Add a lead by hand</h2>
      <form action={action} style={{ marginTop: 14 }}>
        <div className="grid">
          <Field name="business" label="Business name *" placeholder="Melike Adıgüzel Güzellik" />
          <Field name="phone" label="Phone *" placeholder="0551 533 09 19" />
          <div>
            <label htmlFor="industry">Industry</label>
            <select id="industry" name="industry" defaultValue="">
              <option value="">Guess from the name</option>
              <option value="beauty">Beauty / aesthetics</option>
              <option value="vet">Veterinary</option>
            </select>
          </div>
          <Field name="neighborhood" label="Neighbourhood" placeholder="Osmaniye" />
          <Field name="district" label="District" placeholder="Bakırköy" />
          <Field name="rating" label="Google rating" placeholder="4.7" />
          <Field name="reviews" label="Review count" placeholder="1273" />
          <Field name="pctFive" label="Five-star %" placeholder="92" />
          <Field name="lat" label="Latitude" placeholder="40.9952757" />
          <Field name="lng" label="Longitude" placeholder="28.8810021" />
          <Field name="social" label="Instagram URL" placeholder="https://instagram.com/…" />
          <Field
            name="mapsPlace"
            label="Google Maps link"
            placeholder="https://maps.google.com/…"
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <Field
            name="photo"
            label="Photo URL"
            placeholder="https://… — needed before a demo can be built"
          />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
          <button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add lead"}
          </button>
          {message ? <span className="msg">{message}</span> : null}
        </div>
      </form>
    </section>
  );
}

function Field({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} type="text" name={name} placeholder={placeholder} />
    </div>
  );
}

export function BuildButton({ leadId }: { leadId: string }) {
  const [message, action, pending] = useActionState(buildDemo, null);
  return (
    <form action={action}>
      <input type="hidden" name="leadId" value={leadId} />
      <button className="ghost" type="submit" disabled={pending} style={{ padding: "5px 14px" }}>
        {pending ? "…" : "Build demo"}
      </button>
      {message ? (
        <span className="note" style={{ display: "block", marginTop: 4 }}>
          {message}
        </span>
      ) : null}
    </form>
  );
}
