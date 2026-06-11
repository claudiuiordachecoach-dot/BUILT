"use client";

import { useState, useTransition } from "react";
import { scoreMyPost, type MyPost, type PostScore } from "@/app/competitors/actions";

function formatViews(v: number | null) {
  const n = v ?? 0;
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);
}

export function MyPostsPanel({ posts }: { posts: MyPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
        <p className="font-display text-xl text-foreground tracking-wide mb-1">Nicio postare sincronizată</p>
        <p className="text-sm text-muted-foreground">Rulează sync-ul Instagram, apoi revino aici.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-[13px] text-muted-foreground mb-6 max-w-2xl">
        Postările tale care au performat. Apasă <strong className="text-foreground">Scorează</strong> pe oricare
        ca să vezi DE CE a mers și ce pattern poți repeta.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((p) => (
          <MyPostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

function MyPostCard({ post }: { post: MyPost }) {
  const [score, setScore] = useState<PostScore | null>(null);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function run() {
    setErr(null);
    start(async () => {
      const r = await scoreMyPost(post.id);
      if (r.ok) setScore(r.data);
      else setErr(r.error);
    });
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="font-display text-lg text-foreground leading-none">{formatViews(post.views)}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">views</span>
        {post.format_type && (
          <span className="ml-auto font-condensed text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
            {post.format_type}
          </span>
        )}
      </div>

      <p className="text-[13px] text-foreground/90 line-clamp-3 leading-snug min-h-[3.4em]">
        {post.caption || <span className="italic text-muted-foreground">fără caption</span>}
      </p>

      {err && <p className="text-built-red text-xs">⚠ {err}</p>}

      {!score ? (
        <button
          onClick={run}
          disabled={pending}
          className="font-condensed text-[11px] uppercase tracking-wider py-2.5 rounded-lg border border-border text-foreground hover:border-white/20 disabled:opacity-40 transition-colors"
        >
          {pending ? "Scorez..." : "Scorează"}
        </button>
      ) : (
        <div className="border-t border-border pt-3 space-y-2.5">
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl text-built-red leading-none">{score.score}</span>
            <div className="flex-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-built-red rounded-full" style={{ width: `${Math.min(100, Math.max(0, score.score))}%` }} />
              </div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">scor / 100</p>
            </div>
          </div>
          <div>
            <p className="font-condensed text-[9px] uppercase tracking-widest text-muted-foreground mb-1">De ce a mers</p>
            <p className="text-[12px] text-foreground/85 leading-snug">{score.why_worked}</p>
          </div>
          <div>
            <p className="font-condensed text-[9px] uppercase tracking-widest text-built-red mb-1">Pattern de repetat</p>
            <p className="text-[12px] text-foreground/85 leading-snug">{score.repeatable_pattern}</p>
          </div>
        </div>
      )}
    </div>
  );
}
