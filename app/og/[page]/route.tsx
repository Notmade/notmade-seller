import { ImageResponse } from "next/og";
import { PUBLIC_PAGES, type PageKey } from "../../lib/public-pages";
import { OG_SIZE } from "../../lib/seo";

// One 1200×630 share image per public page, rendered at build time. Text only, so nothing is cropped.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return PUBLIC_PAGES.map((p) => ({ page: p.key }));
}

const HEADLINE: Partial<Record<PageKey, string>> = {
  home: "Sell online in India and the UAE",
  "sell-in-india": "Sell online in India",
  "sell-in-uae": "Sell online in the UAE",
};

export function GET(_req: Request, { params }: { params: { page: string } }) {
  const page = PUBLIC_PAGES.find((p) => p.key === params.page);
  if (!page) return new Response("Not found", { status: 404 });
  const headline = HEADLINE[page.key] ?? page.name;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "64px 72px", background: "#FFFFFF", color: "#0A0A0A", borderTop: "16px solid #E10600" }}>
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 44, letterSpacing: -1 }}>
          <span>NOT</span><span style={{ color: "#E10600" }}>MADE</span>
          <span style={{ marginLeft: 16, fontSize: 22, letterSpacing: 4, color: "#5C5C5C" }}>SELLER</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: headline.length > 26 ? 76 : 92, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>{headline}</div>
          <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.35, color: "#5C5C5C", maxWidth: 1000 }}>{page.description}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#5C5C5C" }}>
          <span>seller.notmade.in</span>
          <span>India · UAE</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
