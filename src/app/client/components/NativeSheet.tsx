"use client";

import { useState, useEffect, useRef } from "react";

const FORCE_OPEN = `
  .ex-body,.caseta,.caseta-body,.caseta-inner,.acc-content,.acc-body,.opt-body,.opt-content,.wu-body,.cd-body,.collapse,.collapsible{display:block!important;max-height:none!important;height:auto!important;overflow:visible!important;opacity:1!important;visibility:visible!important;}
  .ex-icon,.caseta-icon,.acc-icon,.opt-icon,.chevron,.toggle-icon{display:none!important;}
  .ex-hdr,.caseta-hdr,.acc-hdr{cursor:default!important;}`;

function ShadowHtml({ html, css, className }: { html: string; css: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const root = host.shadowRoot || host.attachShadow({ mode: "open" });
    root.innerHTML = `<style>:host{display:block;color:#F5F5F5;font-family:'DM Sans',-apple-system,sans-serif;line-height:1.6;}${css}${FORCE_OPEN}</style>${html}`;
  }, [html, css]);
  return <div ref={ref} className={className} />;
}

type Tab = { key: string; label: string; html: string };

/** Randează nativ orice foaie QuickRef (nutriție / acasă) — fără logging, doar conținut fidel
 *  în Shadow DOM + tab-uri native. Citește etichetele tab-urilor chiar din foaie. */
export default function NativeSheet({ url, topSelector }: { url: string; topSelector?: string }) {
  const [css, setCss] = useState("");
  const [topHtml, setTopHtml] = useState("");
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(url).then((r) => r.text()).then((text) => {
      if (!alive) return;
      const doc = new DOMParser().parseFromString(text, "text/html");
      setCss([...doc.querySelectorAll("style")].map((s) => s.textContent || "").join("\n").replace(/:root/g, ":host"));
      const top = topSelector ? doc.querySelector(topSelector) : null;
      setTopHtml(top ? (top as HTMLElement).outerHTML : "");
      const panels = [...doc.querySelectorAll('[id^="tab-"]')];
      const navLabels = [...doc.querySelectorAll(".tab")].map((t) => (t.textContent || "").trim()).filter(Boolean);
      const ts: Tab[] = panels.map((p, i) => ({
        key: p.id.replace("tab-", ""),
        label: navLabels.length === panels.length ? navLabels[i] : p.id.replace("tab-", "").toUpperCase(),
        html: p.innerHTML,
      })).filter((t) => t.html.trim());
      setTabs(ts);
      setActive(ts[0]?.key || "");
      setLoading(false);
    }).catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (loading) return <p className="text-zinc-500 text-sm px-1 py-4">Se încarcă…</p>;
  if (tabs.length === 0) return topHtml ? <ShadowHtml html={topHtml} css={css} /> : null;

  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className="pb-24">
      {topHtml && (
        <div className="mb-4">
          <ShadowHtml html={topHtml} css={css} />
        </div>
      )}
      <div className="sticky top-0 z-10 bg-built-black/95 backdrop-blur-sm py-2.5 mb-4 border-b border-white/5">
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActive(t.key)}
              className={`shrink-0 font-condensed text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${t.key === active ? "bg-built-red text-white" : "bg-white/5 text-zinc-400 hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <ShadowHtml key={activeTab.key} html={activeTab.html} css={css} />
    </div>
  );
}
