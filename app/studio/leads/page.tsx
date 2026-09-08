import Link from "next/link";
import { listLeads } from "@/lib/db/leads";
import { INDUSTRY_LABELS_TR, type Industry } from "@/lib/leads/industry";
import { AddLead, BuildButton, ImportLeads } from "./LeadsTools";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await listLeads();
  const buildable = leads.filter((lead) => lead.industry === "beauty" || lead.industry === "vet");

  return (
    <>
      <p className="note">
        <Link href="/studio">← Businesses</Link>
      </p>
      <h1>Leads</h1>
      <p className="note">
        {leads.length} leads · {buildable.length} have an industry pack
      </p>

      <ImportLeads />
      <AddLead />

      {leads.length > 0 ? (
        <table style={{ marginTop: 24 }}>
          <thead>
            <tr>
              <th>Business</th>
              <th>Industry</th>
              <th>Area</th>
              <th>Rating</th>
              <th>Views</th>
              <th>Demo</th>
            </tr>
          </thead>
          <tbody>
            {[...leads]
              .sort((a, b) => b.taps - a.taps || b.views - a.views)
              .map((lead) => (
                <tr key={lead.id}>
                  <td>
                    {lead.business}
                    {lead.taps > 0 ? <span className="badge live">{lead.taps} taps</span> : null}
                  </td>
                  <td>{INDUSTRY_LABELS_TR[lead.industry as Industry] ?? lead.industry}</td>
                  <td className="note">
                    {lead.neighborhood ?? "—"} / {lead.district ?? "—"}
                  </td>
                  <td>
                    {lead.rating ?? "—"} {lead.reviews ? `(${lead.reviews})` : ""}
                  </td>
                  <td>{lead.views}</td>
                  <td>
                    {lead.hasSite ? (
                      <Link href={`/studio/${lead.slug}`}>edit →</Link>
                    ) : (
                      <BuildButton leadId={lead.id} />
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : null}
    </>
  );
}
