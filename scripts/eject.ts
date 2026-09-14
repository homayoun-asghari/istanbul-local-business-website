/**
 * `npm run eject <slug>` — the handoff.
 *
 * Produces a standalone Next.js repository containing exactly one business: ordinary,
 * readable code with no database, no studio, no analytics beacon and no other client in
 * it. The client can hire anyone to change it, bolt a CMS onto the one content file, or
 * redesign it entirely — nothing here depends on the operator's infrastructure.
 *
 * This works only because the render layer takes a validated SiteContent object and
 * nothing else. scripts/check-boundary.sh is what keeps that true.
 */
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { SiteContentSchema, type SiteContent } from "../lib/content/schema";

const ROOT = process.cwd();

/** Copied verbatim into the client's repo. Kept in one place so it cannot drift. */
const VENDORED = ["components/site", "lib/content", "packs"];

async function loadContent(slug: string): Promise<SiteContent> {
  const { getSite } = await import("../lib/db/sites");
  const site = await getSite(slug);
  if (!site?.content) throw new Error(`no publishable site for "${slug}"`);
  return SiteContentSchema.parse(site.content);
}

/**
 * Remote images are downloaded so the delivered site never hotlinks back to Google or to
 * us. Root-relative sources are already local — they are the preset's own photography,
 * copied wholesale from public/stock — and passing one to fetch() throws, which used to
 * break eject outright for every template that ships with its own pictures.
 */
async function localiseImages(content: SiteContent, outDir: string): Promise<SiteContent> {
  await mkdir(path.join(outDir, "public/images"), { recursive: true });
  const cache = new Map<string, string>();

  const download = async (url: string): Promise<string> => {
    if (url.startsWith("/")) return url;
    if (cache.has(url)) return cache.get(url)!;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`could not download ${url} (${response.status})`);
    const type = response.headers.get("content-type") ?? "";
    const extension = type.includes("png")
      ? "png"
      : type.includes("webp")
        ? "webp"
        : type.includes("avif")
          ? "avif"
          : "jpg";
    const name = `image-${cache.size + 1}.${extension}`;
    await writeFile(
      path.join(outDir, "public/images", name),
      Buffer.from(await response.arrayBuffer()),
    );
    const local = `/images/${name}`;
    cache.set(url, local);
    return local;
  };

  const sections = [];
  for (const section of content.sections) {
    if (section.type === "hero") {
      sections.push({
        ...section,
        image: { ...section.image, src: await download(section.image.src) },
      });
    } else if (section.type === "gallery") {
      const images = [];
      for (const image of section.images) images.push({ ...image, src: await download(image.src) });
      sections.push({ ...section, images });
    } else sections.push(section);
  }
  return { ...content, sections };
}

async function stripDevFiles(dir: string): Promise<void> {
  const { readdir } = await import("node:fs/promises");
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "fixtures" || entry.name === "node_modules") {
        await rm(full, { recursive: true, force: true });
        continue;
      }
      await stripDevFiles(full);
    } else if (/\.test\.(ts|tsx)$/.test(entry.name)) {
      await rm(full, { force: true });
    }
  }
}

const pkg = (slug: string, deps: Record<string, string>) =>
  JSON.stringify(
    {
      name: slug,
      version: "1.0.0",
      private: true,
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: {
        next: deps.next,
        react: deps.react,
        "react-dom": deps["react-dom"],
        zod: deps.zod,
      },
      devDependencies: {
        "@tailwindcss/postcss": deps["@tailwindcss/postcss"],
        tailwindcss: deps.tailwindcss,
        typescript: deps.typescript,
        "@types/node": deps["@types/node"],
        "@types/react": deps["@types/react"],
        "@types/react-dom": deps["@types/react-dom"],
      },
    },
    null,
    2,
  );

async function main() {
  const slug = process.argv[2];
  if (!slug) throw new Error("usage: npm run eject <slug>");

  const outDir = path.join(ROOT, "clients", slug);
  const content = SiteContentSchema.parse(await loadContent(slug));

  await rm(outDir, { recursive: true, force: true });
  await mkdir(path.join(outDir, "app"), { recursive: true });

  for (const dir of VENDORED) {
    await cp(path.join(ROOT, dir), path.join(outDir, dir), { recursive: true });
  }
  // Tests and the operator's own fixtures are not the client's business, and a stray
  // test file fails their build by importing a fixture that was not copied.
  await stripDevFiles(outDir);

  // The presets carry their own photography and reference it by root-relative path, so
  // it has to travel with them or the client's site renders a page of broken images.
  await cp(path.join(ROOT, "public/stock"), path.join(outDir, "public/stock"), {
    recursive: true,
  });

  const local = await localiseImages(content, outDir);
  await writeFile(path.join(outDir, "site.content.json"), `${JSON.stringify(local, null, 2)}\n`);

  for (const file of ["postcss.config.mjs", "tsconfig.json", "app/globals.css"]) {
    await cp(path.join(ROOT, file), path.join(outDir, file));
  }

  // Pinned explicitly: without it Next walks up, adopts the operator's project as the
  // workspace root and tries to compile its middleware into the client's site.
  await writeFile(
    path.join(outDir, "next.config.ts"),
    `import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(import.meta.dirname) },
  outputFileTracingRoot: path.resolve(import.meta.dirname),
};

export default nextConfig;
`,
  );

  const root = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  await writeFile(
    path.join(outDir, "package.json"),
    `${pkg(slug, { ...root.dependencies, ...root.devDependencies })}\n`,
  );

  // The one file that differs from the demo host: content comes from disk, not Postgres.
  await writeFile(
    path.join(outDir, "app/page.tsx"),
    `import { Site } from "@/components/site/Site";
import { SiteContentSchema } from "@/lib/content/schema";
import content from "../site.content.json";

export default function Page() {
  return <Site content={SiteContentSchema.parse(content)} now={new Date()} />;
}
`,
  );

  await writeFile(
    path.join(outDir, "app/layout.tsx"),
    `import type { Metadata } from "next";
import { fontVariables } from "@/components/site/fonts";
import content from "../site.content.json";
import "./globals.css";

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={fontVariables}
    >
      <body>{children}</body>
    </html>
  );
}
`,
  );

  await writeFile(
    path.join(outDir, "app/robots.ts"),
    `import type { MetadataRoute } from "next";

// Unlike the demo host, this site is meant to be found.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" } };
}
`,
  );

  await mkdir(path.join(outDir, "app/kvkk"), { recursive: true });
  await writeFile(
    path.join(outDir, "app/kvkk/page.tsx"),
    `export default function Kvkk() {
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "64px 24px", lineHeight: 1.7 }}>
      <h1>KVKK Aydınlatma Metni</h1>
      <p>
        Bu internet sitesi üzerinden tarafımıza ilettiğiniz ad, telefon numarası ve mesaj
        içeriği; yalnızca randevu taleplerinizi karşılamak ve size geri dönüş yapmak amacıyla
        işlenir. Verileriniz üçüncü kişilerle paylaşılmaz ve pazarlama amacıyla kullanılmaz.
      </p>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki taleplerinizi
        sitedeki telefon numarası üzerinden bize iletebilirsiniz.
      </p>
      <p>
        Sitede yalnızca sitenin çalışması için gerekli çerezler kullanılır; reklam veya
        takip çerezi kullanılmaz.
      </p>
    </main>
  );
}
`,
  );

  await writeFile(
    path.join(outDir, "README.md"),
    `# ${local.business.name}

Bu klasör, sitenizin tam kaynak kodudur. Size aittir.

## Çalıştırmak

\`\`\`bash
npm install
npm run dev
\`\`\`

Tarayıcıda http://localhost:3000 adresini açın.

## Yayına almak

\`\`\`bash
npm run build
\`\`\`

Vercel, Netlify veya Node.js çalıştırabilen herhangi bir sunucuda yayınlanabilir.

## İçeriği değiştirmek

Sitedeki bütün metinler, fotoğraf adresleri, hizmetler ve çalışma saatleri tek bir
dosyadadır: \`site.content.json\`. Dosyayı düzenleyip yeniden yayınlamak yeterlidir.

Fotoğraflar \`public/images/\` klasöründedir; hiçbir dış siteye bağımlı değildir.

## Teknik notlar

- Next.js ${root.dependencies.next} · TypeScript · Tailwind CSS
- Veritabanı yoktur, yönetim paneli yoktur, dış servise bağımlılık yoktur.
- \`app/kvkk\` altında KVKK aydınlatma metni bulunur.
`,
  );

  await writeFile(path.join(outDir, ".gitignore"), "node_modules\n.next\n.env*\n.DS_Store\n");

  const stray = VENDORED.flatMap((dir) => [path.join(outDir, dir)]).filter((dir) =>
    existsSync(dir),
  );

  console.log(`ejected ${slug} → clients/${slug}`);
  console.log(`  vendored: ${stray.map((d) => path.relative(outDir, d)).join(", ")}`);
  console.log(
    `  images:   ${(await import("node:fs")).readdirSync(path.join(outDir, "public/images")).length}`,
  );
  console.log(`  next:     cd clients/${slug} && npm install && npm run build`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
