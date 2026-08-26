import re

with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

# Define the new tab-calendar content for Nelu
new_calendar_tab = """<!-- ═══════════════════════════════ TAB 1 — CALENDAR & PROTOCOL ═══════════════════════════════ -->
<div class="panel active" id="tab-calendar">

  <div class="alert">
    <div class="alert-ttl">PROTOCOL PRE-ANTRENAMENT — OBLIGATORIU</div>
    <strong>Nu intra la sală complet pe gol.</strong> Știu că ești pe fugă dimineața cu băiețelul la grădiniță, dar un iaurt proteic + o banană la ora 07:00-07:30 îți vor oferi energia necesară pentru a trage tare la 08:30. Bea-ți cafeaua (fără zahăr, cum îți place) și hidratează-te bine.
  </div>

  <!-- CALENDARUL TĂU -->
  <div class="rule-card" style="border-color:var(--blue);">
    <div class="rule-ttl" style="color:var(--blue);">CALENDARUL TĂU DE ANTRENAMENT</div>
    <div class="rule-body">
      <div class="wgrid">
        <div class="wd"><div class="wd-n">Luni</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd"><div class="wd-n">Marți</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd"><div class="wd-n">Mier</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd on"><div class="wd-n">Joi</div><div class="wd-t">PUSH</div><div class="wd-s">A</div></div>
        <div class="wd"><div class="wd-n">Vin</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd on"><div class="wd-n">Sâm</div><div class="wd-t">PULL</div><div class="wd-s">B</div></div>
        <div class="wd on"><div class="wd-n">Dum</div><div class="wd-t">LEGS</div><div class="wd-s">C</div></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
        <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:#ccc;"><div style="width:10px;height:10px;background:rgba(39,174,96,0.7);border-radius:2px;"></div>Zi de Antrenament (A/B/C)</div>
        <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:#ccc;"><div style="width:10px;height:10px;background:rgba(192,57,43,0.7);border-radius:2px;"></div>Odihnă / Muncă</div>
      </div>
    </div>
  </div>

  <!-- NEAT -->
  <div class="rule-card" style="border-color:var(--orange);">
    <div class="rule-ttl" style="color:var(--orange);">NEAT — Pașii Tăi Zilnici</div>
    <div class="rule-body">
      Având un job sedentar (13-14 ore de activitate fără mișcare considerabilă), e vital să compensezi. Targetul tău este de <strong>minim 8.000 de pași, ideal spre 10.000+ pași zilnic</strong>.<br><br>
      Dacă ești pe fugă în timpul săptămânii, încearcă să parchezi mașina mai departe, să eviți liftul și să mergi mai mult pe jos în weekend-uri. 15 minute de mers înclinat la finalul antrenamentelor te ajută masiv la acest target.
    </div>
  </div>

  <!-- REGULI -->
  <div class="alert green" style="margin-top:4px;">
    <div class="alert-ttl">Constanță și Reguli</div>
    Programul tău permite antrenamente Joi, Sâmbătă și Duminică. Dacă ratezi o zi din cauza unui neprevăzut, <strong>nu o sări complet</strong>. Fă măcar un circuit de 15 minute acasă din planul de Home Workout. Menține reflexul activ.
  </div>

</div>
"""

# Extract the block to replace
pattern = re.compile(r'<!-- ═══════════════════════════════ TAB 1 — CALENDAR & PROTOCOL ═══════════════════════════════ -->.*?<!-- ═══════════════════════════════ ZIUA A — PUSH ═══════════════════════════════ -->', re.DOTALL)
content = pattern.sub(new_calendar_tab + "\n\n<!-- ═══════════════════════════════ ZIUA A — PUSH ═══════════════════════════════ -->", content)

with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
    f.write(content)
