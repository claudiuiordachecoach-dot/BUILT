import re

with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove NEAT and Constanță from tab-calendar
pattern_calendar = re.compile(r'<!-- NEAT -->.*?</div>\s*</div>\s*<!-- ═══════════════════════════════ ZIUA A', re.DOTALL)
content = pattern_calendar.sub('</div>\n<!-- ═══════════════════════════════ ZIUA A', content)

# 2. Update Reguli
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
    • <strong>Zilele de job (Muncă):</strong> Target <strong>minim 8.000 de pași</strong>. În zilele astea nu te antrenezi, așa că singura variantă e să parchezi intenționat mai departe sau să te asiguri că te plimbi prin cabinet.<br>
    • <strong>Zilele libere (Zilele cu Antrenament):</strong> Target <strong>minim 10.000 de pași</strong>. Ești deja la sală, deci poți face 10-15 minute de mers înclinat pe bandă la final ca să bifezi targetul ușor.
  </div>

  <div class="alert" style="border-left:4px solid #ef4444;">
    <div class="alert-ttl">Cum Progresezi (Nu doar cu greutăți)</div>
    Progresia (Progressive Overload) nu înseamnă doar să pui orbește kilograme pe bară.<br><br>
    <strong>Nivel 1:</strong> Control mai bun al mișcării (Time Under Tension) – repetări lente, pauză sus.<br>
    <strong>Nivel 2:</strong> O formă și execuție mai stricte și mai curate.<br>
    <strong>Nivel 3:</strong> Abia când atingi repetările maxime cu formă perfectă din ambele de mai sus, crești kilogramele (+2kg).<br><br>
    Forma dictează greutatea. Nu invers. Formă proastă = accidentare, nu progres.
  </div>

  <div class="alert" style="border-left:4px solid #f97316;">
    <div class="alert-ttl">Minimum Viable Effort (Cum gestionăm zilele proaste)</div>
    <strong>1. Dacă ești distrus dar ajungi la sală:</strong><br>
    Nu anula antrenamentul. Redu volumul! În loc de 15 serii de lucru, scade la 10 serii totale. Faci o sesiune mai scurtă și pleci acasă. 30 de min e de 100 de ori mai bun decât zero.<br><br>
    <strong>2. Dacă e IMPOSIBIL să ajungi la sală:</strong><br>
    Bagă un circuit din planul tău de Home Workout. Lasă scuzele, menține reflexul activ.
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
