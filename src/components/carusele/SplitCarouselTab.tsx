"use client";

import { useState, useRef } from "react";

export function SplitCarouselTab() {
  const [leftImage, setLeftImage] = useState<string | null>(null);
  const [rightImage, setRightImage] = useState<string | null>(null);
  
  const [leftText, setLeftText] = useState("Pare imposibil");
  const [rightText, setRightText] = useState("Exact asta e provocarea");

  const handleImageUpload = (side: "left" | "right", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    if (side === "left") setLeftImage(url);
    else setRightImage(url);
  };

  return (
    <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Zona de control */}
      <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm h-fit">
        <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider mb-4">Controale Split</p>
        <h2 className="font-display text-2xl tracking-wider mb-6">Configurează Slide-ul</h2>
        
        <div className="space-y-6">
          <div className="p-4 border border-built-gray-2 bg-built-black">
            <h3 className="font-condensed text-xs text-built-gray-text uppercase mb-3">Partea Stângă (Before)</h3>
            <div className="mb-3">
              <label className="block text-xs font-condensed uppercase text-built-gray-text mb-1">Poza Stânga</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload("left", e)} className="text-sm text-built-white" />
            </div>
            <div>
              <label className="block text-xs font-condensed uppercase text-built-gray-text mb-1">Text Obiecție</label>
              <input 
                type="text" 
                value={leftText} 
                onChange={(e) => setLeftText(e.target.value)}
                className="w-full bg-built-gray-1 border border-built-gray-2 text-built-white text-sm p-2 focus:outline-none focus:border-built-red"
              />
            </div>
          </div>

          <div className="p-4 border border-built-gray-2 bg-built-black">
            <h3 className="font-condensed text-xs text-built-gray-text uppercase mb-3">Partea Dreaptă (After)</h3>
            <div className="mb-3">
              <label className="block text-xs font-condensed uppercase text-built-gray-text mb-1">Poza Dreapta</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload("right", e)} className="text-sm text-built-white" />
            </div>
            <div>
              <label className="block text-xs font-condensed uppercase text-built-gray-text mb-1">Text Reîncadrare</label>
              <input 
                type="text" 
                value={rightText} 
                onChange={(e) => setRightText(e.target.value)}
                className="w-full bg-built-gray-1 border border-built-gray-2 text-built-white text-sm p-2 focus:outline-none focus:border-built-red"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-built-gray-text mt-6">
          Tip: După ce configurezi pozele, poți face un Screenshot la zona din dreapta pentru a o posta pe Instagram. Preview-ul este scalat, dar păstrează formatul exact de 4:5 (Portrait).
        </p>
      </div>

      {/* Zona de preview */}
      <div className="bg-built-black border border-built-gray-2 rounded-sm p-4 flex items-center justify-center overflow-hidden">
        {/* Container proporțional Instagram Portrait (1080 x 1350) => aspect 4/5 */}
        <div 
          className="relative w-full shadow-2xl bg-[#111]"
          style={{ aspectRatio: "4/5", maxHeight: "800px" }}
        >
          <div className="absolute inset-0 flex">
            {/* Left Side */}
            <div className="w-1/2 relative h-full bg-[#222]">
              {leftImage && <img src={leftImage} alt="Left" className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
              <div className="absolute bottom-12 left-0 right-0 px-6 text-center z-10">
                <p className="font-display text-4xl text-white drop-shadow-md leading-tight" style={{ fontFamily: "Impact, sans-serif" }}>
                  &quot;{leftText}&quot;
                </p>
              </div>
            </div>
            
            {/* Right Side */}
            <div className="w-1/2 relative h-full bg-[#1a1a1a]">
              {rightImage && <img src={rightImage} alt="Right" className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
              <div className="absolute bottom-12 left-0 right-0 px-6 text-center z-10">
                <p className="font-display text-4xl text-white drop-shadow-md leading-tight" style={{ fontFamily: "Impact, sans-serif" }}>
                  &quot;{rightText}&quot;
                </p>
              </div>
            </div>

            {/* Divider Line */}
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/20 -translate-x-1/2 z-20" />
            
            {/* Center Arrow / Icon */}
            <div className="absolute top-1/2 left-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow-xl z-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
