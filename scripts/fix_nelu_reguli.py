import re

with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

new_reguli = """
<div class="panel" id="tab-reguli">

  <div class="alert" style="border-left:4px solid #10b981;">
    <div class="alert-ttl">Hidratarea — Crucială</div>
    Ca să susții 3 antrenamente pe săptămână și o viață sedentară la birou, bea <strong>minim 3-4 litri de apă zilnic</strong>. La antrenament trebuie să ai cel puțin o sticlă de 1L cu tine din care să bei constat în pauze. Oboseala și lipsa de energie pe parcursul zilei sunt adesea doar deshidratare.
  </div>

  <div class="alert" style="border-left:4px solid #3b82f6;">
    <div class="alert-ttl">Protocol de Încălzire (Warm-Up)</div>
    Pentru <strong>exercițiile principale</strong> de la începutul antrenamentului, trebuie să faci 2-3 serii de încălzire progresivă <strong>înainte de a începe seriile de lucru (Working Sets)</strong> listate în plan. Încălzește-te cât consideri că ai nevoie ca să te simți confortabil cu greutatea mare.<br><br>
    <em>Model Jeff Nippard:</em><br>
    • <strong>Warm-up Set 1:</strong> Greutate mică × 8-10 rep<br>
    • <strong>Warm-up Set 2:</strong> Greutate moderată × 4-6 rep<br>
    • <strong>Warm-up Set 3:</strong> Greutate grea × 2-3 rep (opțional)<br><br>
    → Abia după aceste încălziri, notezi în aplicație primele două/trei serii de lucru efectiv, acelea la care tragi până aproape de eșec.<br>
    <em>La ultimele două exerciții din zi de izolare, mușchiul e deja încălzit, ajunge o singură serie ușoară de acomodare.</em>
  </div>

  <div class="alert" style="border-left:4px solid #8b5cf6;">
    <div class="alert-ttl">Pașii Zilnici (NEAT) — Antidotul pentru stat la birou</div>
    Având în vedere că lucrezi 13-14 ore pe scaun la cabinet, corpul tău are nevoie de mișcare extra pentru a nu înțepeni și pentru a susține arderea grăsimilor.<br><br>
    • <strong>Zilele de job:</strong> Target <strong>minim 8.000 de pași</strong>. Poți rezolva asta dacă mergi 15 min pe bandă la înclinație după sală sau parchezi mai departe.<br>
    • <strong>Zilele de pauză:</strong> Target <strong>minim 10.000 de pași</strong>.
  </div>

  <div class="alert" style="border-left:4px solid #ef4444;">
    <div class="alert-ttl">Double Progression — Cum crești greutatea</div>
    <strong>Pasul 1 — Repetări:</strong> Lucrează la intervalul indicat (ex: 10–12). Dacă nu scoți minimul (10) → rămâi la aceeași greutate.<br><br>
    <strong>Pasul 2 — Greutate:</strong> Când scoți maximul (12) din TOATE seriile de lucru cu formă perfectă → adaugi <strong>2–2.5 kg</strong> la sesiunea următoare.<br><br>
    Forma dictează greutatea. Nu invers. Formă proastă = accidentare, nu progres.
  </div>

  <div class="alert" style="border-left:4px solid #f97316;">
    <div class="alert-ttl">Minimum Viable Effort (Jumătate e mai bine decât deloc)</div>
    Dacă ai stat 14 ore la birou, ești distrus fizic și mental, și vrei să anulezi sala... <strong>Nu o face. Fă varianta Esențială.</strong><br><br>
    Vii la sală și faci DOAR primele 3 exerciții din plan (câte 2 serii fiecare). Durează 25 de minute. O sesiune de 25 min e de 100 de ori mai bună decât zero. Rămâi în ritm.
  </div>

  <div class="alert" style="border-left:4px solid #64748b;">
    <div class="alert-ttl">Durerile musculare vs. Articulare</div>
    Dureri musculare (febra) la 24–48 de ore după antrenament = <strong>normal, înseamnă că mușchii se adaptează.</strong><br><br>
    Durere ascuțită în articulație în timpul efortului (umăr, genunchi) = oprești imediat exercițiul. Nu forța prin durere articulară!
  </div>

  <div class="alert" style="border-left:4px solid #eab308;">
    <div class="alert-ttl">Constanța bate Perfecțiunea</div>
    Ai ratat o zi din cauză că ai stat peste program la cabinet? Nu te panica. Următorul tău antrenament va fi fix cel pe care l-ai ratat. Menții ordinea A → B → C, indiferent în ce zile ale săptămânii pică. Nu trebuie să fii perfect, trebuie să fii constant luni de zile.
  </div>

</div>
"""

content = re.sub(r'<div class="panel" id="tab-reguli">.*</div>\s*<div class="timer-bar"', new_reguli + '\n\n<div class="timer-bar"', content, flags=re.DOTALL)

with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
    f.write(content)
