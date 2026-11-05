"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Category } from "../lib/seller-api";
import { filterCategories, groupCategories } from "../lib/insights";

/** Searchable, grouped category combobox. Arrow keys move, Enter picks, Escape closes. */
export default function CategoryPicker({ id, categories, value, onChange }: {
  id: string; categories: Category[]; value: string; onChange: (id: string) => void;
}) {
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const groups = useMemo(() => filterCategories(groupCategories(categories), query), [categories, query]);
  const flat = useMemo(() => groups.flatMap(g => g.categories), [groups]);
  const selected = categories.find(c => c.id === value);

  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const pick = (c: Category) => { onChange(c.id); setQuery(""); setOpen(false); };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive(a => Math.min(a + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (open && flat[active]) pick(flat[active]); else setOpen(true); }
    else if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); setQuery(""); }
  };

  return (
    <div ref={box} className="sp-combo">
      <input id={id} className="field-input" role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" autoComplete="off"
        aria-activedescendant={open && flat[active] ? `${listId}-${flat[active].id}` : undefined}
        placeholder={categories.length ? "Search categories" : "Loading categories…"} value={open ? query : selected?.name ?? ""}
        onFocus={() => setOpen(true)} onClick={() => setOpen(true)} onChange={e => { setQuery(e.target.value); setOpen(true); }} onKeyDown={onKey} />
      {open && (
        <ul id={listId} role="listbox" aria-label="Categories" className="sp-combo-list">
          {flat.length === 0 && <li className="sp-combo-group" style={{ textTransform: "none", letterSpacing: 0 }}>No category matches that search.</li>}
          {groups.map(g => (
            <li key={g.name} role="presentation">
              <p className="sp-combo-group">{g.name}</p>
              <ul role="group" aria-label={g.name} style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {g.categories.map(c => (
                  <li key={c.id} id={`${listId}-${c.id}`} role="option" aria-selected={c.id === value}
                    className={flat[active]?.id === c.id ? "sp-combo-opt active" : "sp-combo-opt"}
                    onMouseEnter={() => setActive(flat.indexOf(c))} onMouseDown={e => { e.preventDefault(); pick(c); }}>
                    {c.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
