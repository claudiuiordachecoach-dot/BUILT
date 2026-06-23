"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { saveProgressEntry, deleteProgressEntry } from "../actions";
import { ImageUpload } from "@/components/ImageUpload";

type ProgressEntry = {
  id: string;
  label: string;
  weight_kg: number;
  photo_url: string;
  date: string;
};

export default function ProgressGallery({ clientId, initialGallery }: { clientId: number, initialGallery: ProgressEntry[] }) {
  const [gallery, setGallery] = useState<ProgressEntry[]>(initialGallery || []);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    weight_kg: "",
    photo_url: ""
  });

  const handleSave = async () => {
    if (!formData.label || !formData.weight_kg || !formData.photo_url) return;
    
    setIsSubmitting(true);
    const newEntry: ProgressEntry = {
      id: crypto.randomUUID(),
      label: formData.label,
      weight_kg: parseFloat(formData.weight_kg),
      photo_url: formData.photo_url,
      date: new Date().toISOString()
    };
    
    // Optimizare UI: adaugă local prima oară pentru viteză
    const updatedGallery = [...gallery, newEntry];
    setGallery(updatedGallery);
    
    try {
      await saveProgressEntry(clientId, newEntry);
      setIsAdding(false);
      setFormData({ label: "", weight_kg: "", photo_url: "" });
    } catch (error) {
      console.error("Eroare la salvare:", error);
      // Revert in case of error
      setGallery(gallery);
      toast.error("A apărut o eroare la salvarea imaginii.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi această înregistrare?")) return;
    
    const updatedGallery = gallery.filter(g => g.id !== id);
    setGallery(updatedGallery);
    
    try {
      await deleteProgressEntry(clientId, id);
    } catch (error) {
      console.error("Eroare la ștergere:", error);
      setGallery(gallery);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.map((entry) => (
          <div key={entry.id} className="aspect-[3/4] bg-[#111111] border border-white/10 rounded-lg flex flex-col relative overflow-hidden group">
            {/* Imaginea de fundal */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url(${entry.photo_url})` }}
            />

            {/* Delete Button (Hover) */}
            <button
              onClick={() => handleDelete(entry.id)}
              className="absolute top-2 right-2 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-built-red z-10 text-xs press"
            >
              ✕
            </button>

            {/* Footer cu detalii (gradient pentru vizibilitate) */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 pb-2 px-2 border-t border-white/5">
              <p className="text-[10px] font-condensed text-built-gray-text uppercase tracking-widest text-center mb-0.5 truncate">
                {entry.label}
              </p>
              <p className="text-sm font-bold text-white text-center">
                {entry.weight_kg} kg
              </p>
            </div>
          </div>
        ))}

        {/* Buton Adaugă — deschide modalul */}
        <button
          onClick={() => setIsAdding(true)}
          className="aspect-[3/4] bg-[#111111] border border-white/10 rounded-lg flex flex-col items-center justify-center border-dashed hover:border-built-red/50 hover:bg-white/[0.02] transition-colors cursor-pointer group press"
        >
          <p className="text-built-gray-text text-2xl font-light group-hover:text-built-red transition-colors mb-2 group-hover:scale-110">+</p>
          <p className="text-[10px] font-condensed uppercase tracking-wider text-zinc-500">Adaugă Progres</p>
        </button>
      </div>

      {/* Modal — bottom-sheet pe mobil, centrat pe desktop */}
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
              <h3 className="font-condensed text-xs uppercase tracking-widest text-built-red">Intrare nouă de progres</h3>
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
                <label className="text-[10px] font-condensed uppercase tracking-wider text-zinc-500 mb-1.5 block">Etichetă (ex: Ziua 1)</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg text-sm p-2.5 text-white focus:outline-none focus:border-built-red transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-condensed uppercase tracking-wider text-zinc-500 mb-1.5 block">Kilograme (ex: 85.5)</label>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={formData.weight_kg}
                  onChange={e => setFormData({ ...formData, weight_kg: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg text-sm p-2.5 text-white focus:outline-none focus:border-built-red transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-condensed uppercase tracking-wider text-zinc-500 mb-1.5 block">Poză</label>
                <ImageUpload
                  folder="progress"
                  shape="rect"
                  value={formData.photo_url || undefined}
                  label="Alege poza"
                  onUploaded={(url) => setFormData({ ...formData, photo_url: url })}
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSubmitting || !formData.label || !formData.weight_kg || !formData.photo_url}
              className="w-full bg-built-red hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-lg mt-5 disabled:opacity-50 transition-colors press"
            >
              {isSubmitting ? "Se salvează..." : "Salvează progresul"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
