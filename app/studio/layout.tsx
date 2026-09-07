import type { Metadata } from "next";
import { NOINDEX } from "@/lib/content/seo";
import "./studio.css";

export const metadata: Metadata = { title: "Vitrin Studio", robots: NOINDEX };

export default function StudioLayout({ children }: LayoutProps<"/studio">) {
  return (
    <div className="studio">
      <div className="studio-wrap">{children}</div>
    </div>
  );
}
