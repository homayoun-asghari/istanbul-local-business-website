import Link from "next/link";
import { listSites } from "@/lib/db/sites";
import { placeholderCount } from "@/lib/studio/form";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function StudioIndex() {
  const sites = await listSites();
  const placeholders = (site: (typeof sites)[number]) =>
    site.content ? placeholderCount(site.content) : 0;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>İşletmeler</h1>
        <form action={signOut}>
          <button className="ghost" type="submit">
            Çıkış
          </button>
        </form>
      </div>
      <p className="note">{sites.length} kayıt.</p>

      {sites.length === 0 ? (
        <p className="msg" style={{ marginTop: 20 }}>
          Henüz kayıt yok. <code>npm run db:seed</code> çalıştırın.
        </p>
      ) : (
        <table style={{ marginTop: 18 }}>
          <thead>
            <tr>
              <th>İşletme</th>
              <th>Sektör</th>
              <th>Tasarım</th>
              <th>Durum</th>
              <th>Demo</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site.id}>
                <td>
                  <Link href={`/studio/${site.slug}`}>
                    {site.content?.business.name ?? site.slug}
                  </Link>
                  {placeholders(site) > 0 ? (
                    <span className="badge">{placeholders(site)} bölüm taslak</span>
                  ) : null}
                </td>
                <td>{site.pack}</td>
                <td>{site.preset}</td>
                <td>
                  {site.status === "published" ? (
                    <span className="badge live">yayında</span>
                  ) : (
                    <span className="badge">{site.status}</span>
                  )}
                </td>
                <td>
                  <a href={`/${site.slug}`} target="_blank" rel="noreferrer">
                    /{site.slug} ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
