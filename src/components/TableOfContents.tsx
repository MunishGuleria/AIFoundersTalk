"use client";

import React, { useState, useEffect, useMemo } from "react";

interface HeadingItem {
  text: string;
  id: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>("");

  // Extract H2 and H3 headings from MDX string with memoization
  const headings = useMemo<HeadingItem[]>(() => {
    const list: HeadingItem[] = [];
    const lines = content.split("\n");

    for (const line of lines) {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h2Match) {
        const text = h2Match[1].replace(/[*_~`]/g, "").trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        list.push({ text, id, level: 2 });
      } else if (h3Match) {
        const text = h3Match[1].replace(/[*_~`]/g, "").trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        list.push({ text, id, level: 3 });
      }
    }
    return list;
  }, [content]);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0% -60% 0%",
        threshold: 0.1,
      }
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs"
      aria-label="Table of contents"
    >
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5 pb-2 border-b border-slate-200 font-sans">
        In This Guide
      </h4>
      <ul className="space-y-2 text-xs sm:text-sm font-sans list-none p-0 m-0">
        {headings.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              className={`${
                item.level === 3 ? "pl-3 text-[11px]" : "font-medium"
              }`}
            >
              <a
                href={`#${item.id}`}
                className={`transition-colors block leading-snug py-0.5 no-underline ${
                  isActive
                    ? "text-slate-900 font-bold underline underline-offset-4 decoration-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
