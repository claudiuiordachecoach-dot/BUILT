"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { addJournalEntry, deleteJournalEntry, type JournalEntry } from "../actions";
import { ImageUpload } from "@/components/ImageUpload";

type FilterType = "toate" | "meal" | "training" | "steps" | "other";

export default function JournalGallery({ 
  clientId, 
  initialEntries 
}: { 
  clientId: number, 
  initialEntries: JournalEntry[] 
}) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries || []);
  const [filter, setFilter] = useState<FilterType>("toate");
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "meal",
    label: "",
    photo_url: "",
    note: ""
  });

  const filteredEntries = entries.filter(e => filter === "toate" || e.type === filter);

  const handleSave = async () => {
    if (!formData.photo_url || !formData.type) return;
    
    setIsSubmitting(true);
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(), // Temp ID
      type: formData.type,
      label: formData.label,
      note: formData.note,
      photo_url: formData.photo_url,
      created_at: new Date().toISOString()
    };
    
    // Optimizare UI
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    
    try {
      await addJournalEntry({
        type: formData.type,
        label: formData.label,
        photo_url: formData.photo_url,
        note: formData.note
      });
      setIsAdding(false);
      setFormData({ type: "meal", label: "", photo_url: "", note: "" });
    } catch (error) {
      console.error("Eroare la salvare:", error);
      setEntries(entries);
      toast.error("A apărut o eroare la salvarea imaginii.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi această înregistrare?")) return;
    
    const updatedEntries = entries.filter(e => e.id !== id);
    setEntries(updatedEntries);
    
    try {
      await deleteJournalEntry(id);
    } catch (error) {
      console.error("Eroare la ștergere:", error);
      setEntries(entries);
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case "meal": return "Masă";
      case "training": return "Antrenament";
      case "steps": return "Pași";
      case "other": return "Altceva";
      default: return type;
    }
  };

  return (
    <>
      {/* Filtre */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "toate", label: "Toate" },
          { id: "meal", label: "Mese" },
          { id: "training", label: "Antrenament" },
          { id: "steps", label: "Pași" },
          { id: "other", label: "Altele" }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as FilterType)}
            className={`px-3 py-1.5 rounded-full text-xs font-condensed tracking-widest uppercase transition-colors press ${
              filter === f.id 
                ? "bg-built-red text-white" 
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="aspect-[3/4] bg-[#111111] border border-white/10 rounded-lg flex flex-col relative overflow-hidden group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url(${entry.photo_url})` }}
            />
            
            <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-full z-10 backdrop-blur-sm border border-white/10">
               <span className="text-[9px] font-condensed text-zinc-300 uppercase tracking-widest">
                 {getTypeLabel(entry.type)}
               </span>
            </div>

            <button
              onClick={() => handleDelete(entry.id)}
              className="absolute top-2 right-2 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-built-red z-10 text-xs press"
            >
              ✕
            </button>

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 pb-2 px-2 border-t border-white/5">
              <p className="text-xs font-bold text-white text-center truncate shadow-black drop-shadow-md">
                {entry.label || getTypeLabel(entry.type)}
              </p>
              {entry.note && (
                <p className="text-[10px] font-condensed text-zinc-300 text-center mt-0.5 line-clamp-2 leading-tight">
                  {entry.note}
                </p>
              )}
              <p className="text-[9px] text-zinc-500 text-center mt-1">
                {new Date(entry.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        <button
          onClick={() => setIsAdding(true)}
          className="aspect-[3/4] bg-[#111111] border border-white/10 rounded-lg flex flex-col items-center justify-center border-dashed hover:border-built-red/50 hover:bg-white/[0.02] transition-colors cursor-pointer group press"
        >
          <p className="text-built-gray-text text-2xl font-light group-hover:text-built-red transition-colors mb-2 group-hover:scale-110">+</p>
          <p className="text-[10px] font-condensed uppercase tracking-wider text-zinc-500">Adaugă Intrare</p>
        </button>
      </div>

      {isAdding && (
        <div
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 anim-fade-in"
          onClick={() => !isSubmitting && setIsAdding(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="anim-scale-in w-full sm:max-w-sm bg-[#111111] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-condensed text-xs uppercase tracking-widest text-built-red">Adaugă în jurnal</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-zinc-500 hover:text-white press"
                aria-label="Închide"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-condensed uppercase tracking-wider text-zinc-500 mb-1.5 block">Tip</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg text-sm p-2.5 text-white focus:outline-none focus:border-built-red transition-colors"
                >
                  <option value="meal">Masă</option>
                  <option value="training">Antrenament</option>
                  <option value="steps">Pași</option>
                  <option value="other">Altceva</option>
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-condensed uppercase tracking-wider text-zinc-500 mb-1.5 block">Titlu scurt (ex: Cină cu pește)</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg text-sm p-2.5 text-white focus:outline-none focus:border-built-red transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-condensed uppercase tracking-wider text-zinc-500 mb-1.5 block">Note suplimentare (opțional)</label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg text-sm p-2.5 text-white focus:outline-none focus:border-built-red transition-colors resize-none"
                  placeholder="Ex: 400kcal, bogat în proteine..."
                />
              </div>

              <div>
                <label className="text-[10px] font-condensed uppercase tracking-wider text-zinc-500 mb-1.5 block">Poză</label>
                <ImageUpload
                  folder="journal"
                  shape="rect"
                  value={formData.photo_url || undefined}
                  label="Alege poza"
                  onUploaded={(url) => setFormData({ ...formData, photo_url: url })}
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSubmitting || !formData.photo_url || !formData.type}
              className="w-full bg-built-red hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-lg mt-5 disabled:opacity-50 transition-colors press"
            >
              {isSubmitting ? "Se salvează..." : "Salvează în jurnal"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
