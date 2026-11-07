import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import IndiaLanding from "@/app/components/landing/IndiaLanding";
import UaeLanding from "@/app/components/landing/UaeLanding";
import india from "@/app/landing/content/in";
import uae from "@/app/landing/content/ae";

const CHAPTERS = [
  ["Welcome", 0], ["Register", 7], ["Business details", 17], ["Rates and agreement", 27],
  ["List products", 39], ["Manage orders", 51], ["Get paid", 62], ["Register now", 71],
] as const;

const pages = [
  { name: "India", content: india, file: "india", html: () => renderToStaticMarkup(<IndiaLanding />) },
  { name: "UAE", content: uae, file: "uae", html: () => renderToStaticMarkup(<UaeLanding payments={null} signupOpen />) },
];

describe.each(pages)("$name tutorial video", ({ content, file, html }) => {
  const t = content.tutorial;
  const pub = (p: string) => join(process.cwd(), "public", p);

  it("points at its own country's files, which exist", () => {
    expect(t.src).toBe(`/video/notmade-seller-tutorial-${file}.mp4`);
    expect(t.captions).toBe(`/video/notmade-seller-tutorial-${file}.vtt`);
    expect(t.poster).toBe(`/video/poster-${file}.jpg`);
    for (const p of [t.src, t.captions, t.poster]) expect(existsSync(pub(p)), p).toBe(true);
    expect(readFileSync(pub(t.captions), "utf8").startsWith("WEBVTT")).toBe(true);
  });

  it("is 79 seconds with the agreed chapters", () => {
    expect(t.duration).toBe(79);
    expect(t.chapters.map((c) => [c.title, c.start])).toEqual(CHAPTERS);
  });

  it("renders with the poster, a captions track that starts off, and every chapter", () => {
    const out = html();
    expect(out).toContain(`poster="${t.poster}"`);
    expect(out).toContain(`src="${t.src}"`);
    expect(out).toContain(`<track kind="captions" src="${t.captions}" srcLang="en" label="English"/>`);
    // Off until the viewer turns on CC: the video already shows this text on screen
    expect(out).not.toMatch(/<track[^>]*default/);
    for (const [title] of CHAPTERS) expect(out).toContain(title);
  });
});
