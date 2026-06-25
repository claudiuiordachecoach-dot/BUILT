"use client";

import { useState, useTransition } from "react";
import { INTAKE_GROUPS, ALL_INTAKE_FIELDS, type IntakeField } from "./fields";
import { submitIntake, type IntakeAnswers } from "./actions";

const RED = "#C0392B";

export default function IntakeForm({
  token,
  firstName,
}: {
  token: string;
  firstName: string;
}) {
  const [answers, setAnswers] = useState<IntakeAnswers>({});
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }));
    if (missing.has(key) && value.trim()) {
      setMissing((m) => {
        const n = new Set(m);
        n.delete(key);
        return n;
      });
    }
  }

  function handleSubmit() {
    setError(null);
    const empty = ALL_INTAKE_FIELDS.filter((f) => !(answers[f.key] ?? "").trim());
    if (empty.length > 0) {
      setMissing(new Set(empty.map((f) => f.key)));
      setError(`Mai ai ${empty.length} câmpuri de completat. Le-am marcat mai jos.`);
      const first = document.getElementById(`field-${empty[0].key}`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    startTransition(async () => {
      const res = await submitIntake(token, answers);
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  if (done) {
    return (
      <main className="min-h-screen bg-white text-zinc-900 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="font-condensed uppercase tracking-[0.3em] text-xs" style={{ color: RED }}>
            Fișa de Start
          </p>
          <h1 className="font-display text-5xl mt-3 mb-4 tracking-wide">AM PRIMIT TOT.</h1>
          <p className="text-zinc-600 leading-relaxed">
            Următorul pas vine de la mine. Îți construiesc planul pe ce mi-ai trimis — pe corpul
            tău, nu pe o copie. Bine ai venit în BUILT.
          </p>
          <p className="mt-8 font-condensed uppercase tracking-[0.25em] text-[11px] text-zinc-400">
            Base · Unbreakable · Intelligent · Lifestyle · Tough
          </p>
        </div>
      </main>
    );
  }

  let counter = 0;
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="max-w-2xl mx-auto px-5 py-10 sm:py-14">
        {/* Header */}
        <p className="font-condensed uppercase tracking-[0.3em] text-xs" style={{ color: RED }}>
          Onboarding · Fișa de Start
        </p>
        <h1 className="font-display text-4xl sm:text-5xl mt-2 tracking-wide">
          BUN VENIT, {firstName.toUpperCase()}
        </h1>
        <p className="text-zinc-600 mt-3 leading-relaxed">
          Asta e harta pe care îți construiesc tot planul. Ia-ți 10 minute liniștite și răspunde sincer —
          cu cât intri mai în detaliu, cu atât planul iese mai precis pe corpul tău. Toate câmpurile contează.
        </p>
        <div className="h-1 w-16 mt-5 mb-2" style={{ background: RED }} />

        {/* Groups */}
        {INTAKE_GROUPS.map((group) => (
          <section key={group.title} className="mt-10">
            <h2
              className="font-display text-2xl tracking-wide border-l-4 pl-3"
              style={{ borderColor: RED }}
            >
              {group.title}
            </h2>
            <div className="mt-4 space-y-5">
              {group.fields.map((field) => {
                counter += 1;
                return (
                  <FieldInput
                    key={field.key}
                    index={counter}
                    field={field}
                    value={answers[field.key] ?? ""}
                    invalid={missing.has(field.key)}
                    onChange={(v) => update(field.key, v)}
                  />
                );
              })}
            </div>
          </section>
        ))}

        {/* Submit */}
        {error && (
          <div
            className="mt-8 border-l-4 bg-red-50 px-4 py-3 text-sm text-red-800"
            style={{ borderColor: RED }}
          >
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={pending}
          className="mt-6 w-full font-condensed uppercase tracking-[0.2em] text-sm text-white py-4 disabled:opacity-60"
          style={{ background: RED }}
        >
          {pending ? "Se trimite…" : "Trimite Fișa de Start"}
        </button>
        <p className="text-center text-xs text-zinc-400 mt-4">
          Datele ajung direct la Claudiu. Le folosim doar pentru planul tău.
        </p>
      </div>
    </main>
  );
}

function FieldInput({
  index,
  field,
  value,
  invalid,
  onChange,
}: {
  index: number;
  field: IntakeField;
  value: string;
  invalid: boolean;
  onChange: (v: string) => void;
}) {
  const border = invalid ? RED : "#D4D4D8";
  return (
    <div id={`field-${field.key}`}>
      <label className="block text-sm font-medium text-zinc-800 mb-1.5">
        <span className="text-zinc-400 mr-1.5">{index}.</span>
        {field.label}
      </label>
      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[color:var(--color-built-red)]"
          style={{ borderColor: border }}
        />
      ) : (
        <input
          type={field.type}
          inputMode={field.type === "number" ? "decimal" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[color:var(--color-built-red)]"
          style={{ borderColor: border }}
        />
      )}
    </div>
  );
}
