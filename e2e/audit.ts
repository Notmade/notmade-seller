// What every panel screen must pass on a phone: nothing sideways, no small tap targets, nothing off screen.
import type { Page } from "@playwright/test";

export async function audit(page: Page, width: number) {
  return page.evaluate((w) => {
    const issues: string[] = [];
    const de = document.documentElement;
    if (de.scrollWidth > window.innerWidth) issues.push(`page scrolls sideways: ${de.scrollWidth} > ${window.innerWidth}`);
    const name = (e: Element) => `${e.tagName.toLowerCase()}${typeof e.className === "string" && e.className ? `.${e.className.split(" ")[0]}` : ""} "${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 30)}"`;
    const visible = (e: Element) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && r.right > 0 && s.visibility !== "hidden" && s.display !== "none"; };
    for (const e of Array.from(document.querySelectorAll("button, a[href], select, input:not([type=hidden]):not(.sp-file), textarea, label.sp-btn-line"))) {
      if (!visible(e) || e.closest("[hidden]")) continue;
      const r = e.getBoundingClientRect();
      // Checkboxes sit inside a larger label, a link inside a sentence is text, and chart bars have a table view
      const box = (e as HTMLInputElement).type?.match(/checkbox|radio/) || getComputedStyle(e).display === "inline" || e.classList.contains("sp-bar");
      if (w < 1024 && !box && !e.closest("p, dd") && r.height < 40) issues.push(`short target ${Math.round(r.height)}px: ${name(e)}`);
      if (w < 1024 && !box && !e.closest("p, dd") && r.width < 40) issues.push(`narrow target ${Math.round(r.width)}px: ${name(e)}`);
      const scroller = e.closest(".sp-tabs, .sp-scroll, .sp-wiz-steps, .sp-pills, [style*='overflow']");
      if (!scroller && (r.right > window.innerWidth + 1 || r.left < -1)) issues.push(`off screen: ${name(e)}`);
    }
    for (const t of Array.from(document.querySelectorAll("table"))) {
      if (visible(t) && !t.closest(".sp-scroll") && t.getBoundingClientRect().right > window.innerWidth + 1) issues.push(`table overflows: ${name(t)}`);
      if (w < 768 && t.classList.contains("sp-table") && !t.classList.contains("sp-stacked") && !t.classList.contains("sp-cards")) issues.push("table is not stacked");
    }
    return Array.from(new Set(issues));
  }, width);
}
