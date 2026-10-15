"use client";

import { useRef, useState } from "react";
import { api, type OptionImage } from "../lib/seller-api";
import { RED } from "./portal-ui";

// Ordered photos for one option value (e.g. every photo of the Red colourway). Never shown for Size.
// The first photo is the value's main image. Max 8, drag to reorder.

export const MAX_VALUE_IMAGES = 8;

export default function ValueGallery({ label, images, onChange, productId }: {
  label: string;
  images: OptionImage[];
  onChange: (next: OptionImage[]) => void;
  productId?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const [error, setError] = useState("");

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const room = MAX_VALUE_IMAGES - images.length;
    const list = Array.from(files).slice(0, room);
    if (files.length > room) setError(`Max ${MAX_VALUE_IMAGES} photos per ${label}`);
    let next = [...images];
    setBusy(list.length);
    for (const f of list) {
      try {
        if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) throw new Error("Use JPG, PNG or WEBP");
        if (f.size > 8 * 1024 * 1024) throw new Error(`${f.name} is larger than 8 MB`);
        const r = await api.uploadVariantImage(f, productId);
        next = [...next, { url: r.url, jpg_url: r.image_jpg_url }];
        onChange(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy((b) => b - 1);
      }
    }
    if (input.current) input.current.value = "";
  };

  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  };

  const tile: React.CSSProperties = { width: 56, height: 70, borderRadius: 8, overflow: "hidden", position: "relative", flexShrink: 0 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ width: 90, fontSize: 13, fontWeight: 700, color: "#333333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={label}>{label}</span>
      {images.map((img, i) => (
        <div key={img.url} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (drag !== null) move(drag, i); setDrag(null); }} onDragEnd={() => setDrag(null)}
          title={i === 0 ? "Main photo · drag to reorder" : "Drag to reorder"}
          style={{ ...tile, cursor: "grab", opacity: drag === i ? 0.4 : 1, border: `2px solid ${i === 0 ? RED : "#EEEEEE"}`, background: "#F3F3F3" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.jpg_url || img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
          <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1} of ${label}`}
            style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.65)", color: "#FFFFFF", fontSize: 12, lineHeight: "18px", padding: 0, cursor: "pointer" }}>×</button>
          {i === 0 && <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: RED, color: "#FFFFFF", fontSize: 8, fontWeight: 800, textAlign: "center", letterSpacing: "0.08em" }}>MAIN</span>}
        </div>
      ))}
      {images.length < MAX_VALUE_IMAGES && (
        <button type="button" onClick={() => input.current?.click()} disabled={busy > 0}
          style={{ ...tile, border: "1.5px dashed #CCCCCC", background: "#FFFFFF", color: "#888888", cursor: busy ? "wait" : "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit" }}>
          {busy > 0 ? "Uploading…" : "+ Photos"}
        </button>
      )}
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => void add(e.target.files)} />
      {error && <span role="alert" style={{ fontSize: 12, color: RED }}>{error}</span>}
    </div>
  );
}
