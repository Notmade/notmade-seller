import type { Metadata } from "next";
import uae from "../landing/content/ae";
import { pageMetadata } from "../lib/seo";

// Shared by /uae and by / when the visitor's market is the UAE
export const uaeMetadata: Metadata = pageMetadata({ ...uae.meta, path: "/uae", locale: "en_AE" });
