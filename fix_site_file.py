import re

with open('/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/quickref/andrei-antrenament.html', 'r', encoding='utf-8') as f:
    text = f.read()

replacements = [
    (r"Imaginează-ți că torni apă dintr-o cană — coatele ușor în față\.", "Ridică brațele în plan scapular (ușor în fața trunchiului, la ~30°). Nu roti intern încheietura (\"nu vărsa apa\") — e un mit învechit care provoacă impingement subacromial (distruge tendonul umărului)."),
    (r"Repetări mari \(20–25\) — gambele nu răspund la repetări mici\.", "Multe repetări (12–15). Secretul biomecanic: tendonul Ahile este un arc elastic uriaș. Dacă nu faci o pauză moartă de 1-2 secunde în partea de jos (în alungire completă), tendonul te va arunca înapoi în sus din inerție și mușchiul gambei va face zero muncă."),
    (r"Mâinile sunt cârlige\.", "Folosește o priză fără degetul mare (thumbless grip) — te va ajuta să dezactivezi bicepsul și antebrațul și să tragi strict din dorsal."),
    (r"3 × 20–25", "3 × 12–15"),
    (r"20–25</div>", "12–15</div>"),
    (r"\(15–20 min\)", ""),
    (r"\(15-20 min\)", ""),
    (r"Repetări mari", "Multe repetări"),
    (r"Repetări rapide", "Repetări prea rapide"),
    (r"Faci Legs \(C\) normal", "Fă Legs (C) normal"),
    (r"Nu anulezi\. Faci MVE și pleci\.", "Nu anula. Fă MVE și pleacă."),
    (r"Facem doar pe zilele libere\.", "Antrenamentul se face doar în zilele libere."),
    (r"mănânci ceva solid", "mănâncă ceva solid"),
    (r"mănânci ceva dulce", "mănâncă ceva dulce"),
    (r"continui\. Nu e o problemă", "continuă. Nu e o problemă"),
    (r"continui\.", "continuă."),
    (r"Nu mergi la epuizare", "Nu merge la epuizare"),
    (r"Nu sari direct la greutatea reală", "Nu sări direct la greutatea reală"),
    (r"Reduce și lucrează cu formă\.", "Redu greutatea și lucrează corect."),
    (r"Reduce la jumătate\.", "Redu greutatea la jumătate."),
    (r"Reduce greutatea până execuția e complet curată\.", "Redu greutatea până când execuția e complet curată."),
    (r"Nu forța inutil\.", "Nu forța inutil."),
    (r"Lucrezi la intervalul indicat", "Lucrează la intervalul indicat"),
    (r"Lucrezi la RPE 7–8", "Lucrează la RPE 7–8"),
    (r"Nu adaugi ore de alergat", "Nu adăuga ore de alergat"),
    (r"adaugi 2–2\.5 kg", "adaugă 2-2.5 kg"),
    (r"nu mai adaugi nimic extra", "nu mai adăuga nimic extra"),
    (r"Nu obosești — doar ridici temperatura", "Aici nu obosești — scopul e doar să ridici temperatura"),
    (r"Pornesc de la nivelul urechilor", "Pornește mișcarea de la nivelul urechilor"),
    (r"Lași greutatea să cadă rapid", "Lăsarea greutății să cadă rapid"),
    (r"Coatele lipite de corp și reduci greutatea", "Ține coatele lipite de corp și redu greutatea"),
    (r"oprești imediat acel exercițiu și reduci greutatea", "oprește imediat acel exercițiu și redu greutatea"),
    (r"Folosești asta în săptămânile", "Folosește asta în săptămânile"),
    (r"Folosești aparatul de tracțiuni", "Folosește aparatul de tracțiuni"),
    (r"Notezi în câmpul KG", "Notează în câmpul KG"),
    (r"Te balansezi sau dai cu picioarele", "Balansarea sau datul din picioare"),
    (r"Se îmbunătățește", "Se va îmbunătăți"),
    (r"privești podeaua", "privește podeaua"),
    (r"nu mai lucrează pieptul", "astfel nu mai lucrează pieptul"),
    (r"nu mai poți ține coatele sus", "ceea ce înseamnă că nu mai poți ține coatele sus"),
    (r"nu mai izolezi tricepsul", "astfel nu mai izolezi tricepsul"),
    (r"nu mai lucrează spatele", "astfel nu mai lucrează spatele"),
    (r"Săritul peste serii de activare", "Ignorarea seriilor de activare"),
    (r"\bgândești\b", "gândește-te"),
    (r"(?<!să )\breduci\b", "redu"),
    (r"\bRevii\b", "Revino"),
    (r"\brevii\b", "revino"),
    (r"\bStrângi\b", "Strânge"),
    (r"\bstrângi\b", "strânge"),
    (r"\bAlternezi\b", "Alternează"),
    (r"\balternezi\b", "alternează"),
    (r"Faci ambele brațe simultan", "Făcutul ambelor brațe simultan"),
    (r"Nu strângi omoplații", "Lipsa strângerii omoplaților")
]

for k, v in replacements:
    text = re.sub(k, v, text)

# Write to the site file
with open('/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/quickref/andrei-antrenament.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Applied fixes to the real site file!")
