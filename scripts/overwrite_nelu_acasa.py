import re

with open("public/quickref/nelu-acasa.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the budget bar
content = re.sub(
    r'<div class="budget-bar">.*?</div>',
    '<div class="budget-bar">\n    <span>Stil Forță</span>\n    <strong>40 MIN</strong>\n    <span>Fără Echipament</span>\n  </div>',
    content,
    flags=re.DOTALL
)

# 2. Update the TABS navigation
new_tabs = """<div class="tabs">
  <div class="tab active" onclick="showTab('info')">Info</div>
  <div class="tab" onclick="showTab('z1')">Ziua A: Lower</div>
  <div class="tab" onclick="showTab('z2')">Ziua B: Upper</div>
  <div class="tab" onclick="showTab('z3')">Ziua C: Full Body</div>
  <div class="tab" onclick="showTab('s1')">S1: Postură</div>
  <div class="tab" onclick="showTab('s2')">S2: Șolduri</div>
  <div class="tab" onclick="showTab('s3')">S3: Gât (Cervical)</div>
  <div class="tab" onclick="showTab('s4')">S4: Lombar</div>
  <div class="tab" onclick="showTab('s5')">S5: Flux</div>
</div>"""
content = re.sub(r'<div class="tabs">.*?</div>', new_tabs, content, flags=re.DOTALL)

# 3. Update the INFO tab
new_info = """<div class="panel active" id="tab-info">
  <div class="alert-box">
    <div class="alert-ttl">Obiectivul Protocoalelor Acasă (Stil STRENGTH)</div>
    Acest plan este conceput exclusiv pe stilul STRENGTH (hipertrofie și forță), pentru zilele când ratezi sala.<br><br>
    <strong>Zilele A/B/C:</strong> Fără grabă, fără circuite cronometrate. Folosești pauze de 90 de secunde între serii, fix ca la sală. Te bazezi pe timpul sub tensiune (Tempo) pentru a face greutatea corpului să se simtă grea.<br>
    <strong>Stretching-ul (S1-S5):</strong> Ajută la relaxarea mușchilor rigizi de la statul prelungit pe scaun, cu accent special pe eliberarea tensiunii din zona lombară și cervicală.
  </div>

  <div class="sec-ttl">Reguli de Bază</div>
  <ul class="rule-list">
    <li><strong>Execută lent:</strong> Dacă ești sedentar la 80kg, 15 genuflexiuni făcute încet (3 secunde pe coborâre) sunt echivalentul unei bare cu discuri.</li>
    <li><strong>Corectitudinea execuției este mai importantă decât numărul de repetări.</strong> Concentrează-te pe o mișcare curată.</li>
    <li>Dacă nu ești sigur cum se face un exercițiu, apasă pe butonul "▶ VIDEO" pentru a vedea demonstrația directă.</li>
  </ul>
</div>"""
content = re.sub(r'<div class="panel active" id="tab-info">.*?</div>(?=\s*<!-- ==================== TAB: C1)', new_info, content, flags=re.DOTALL)

# 4. Replace C1-C5 with Z1-Z3
new_workouts = """<!-- ==================== TAB: Z1 ==================== -->
<div class="panel" id="tab-z1">
  <div class="tag tag-red">Format: Forță · Pauză 90s între serii</div>
  <div class="phase-block">
    <div class="phase-hdr">
      <div class="phase-label">🔥 ZIUA A</div>
      <div class="phase-time">40 Min</div>
    </div>
    <div class="phase-title">Lower Body (Picioare, Fese, Gambe)</div>
    <div class="ex-list">
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">1. Bodyweight Squats (Tempo 3-1-1)</div>
          <div class="ex-sets">3 × 15–20</div>
        </div>
        <div class="ex-cue">Cobori lent 3 secunde, faci o secundă pauză jos, apoi explodezi în sus. Tensiunea e cheia.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+bodyweight+squat+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">2. Alternating Lunges (Fandări pe loc)</div>
          <div class="ex-sets">3 × 10–12/pic</div>
        </div>
        <div class="ex-cue">Spatele drept. Fă un pas mare în față și coboară controlat până genunchiul din spate e la un milimetru de sol.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+alternating+lunges+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">3. Glute Bridges (Ridicări de bazin)</div>
          <div class="ex-sets">3 × 15</div>
        </div>
        <div class="ex-cue">Împinge din călcâie și ține contracția fesierilor sus timp de 2 secunde la fiecare repetare.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+glute+bridges+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">4. Wall Sit (Scaun la perete)</div>
          <div class="ex-sets">3 × Max Timp</div>
        </div>
        <div class="ex-cue">Coapsele paralele cu solul. Stai lipit de perete până la epuizare completă a picioarelor.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+wall+sit+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">5. Calf Raises (Ridicări pe vârfuri)</div>
          <div class="ex-sets">3 × 20</div>
        </div>
        <div class="ex-cue">Execută pe marginea unei trepte sau a unei cărți groase pentru a obține o întindere completă la coborâre.</div>
        <a href="https://www.youtube.com/results?search_query=calf+raises+on+stairs" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
    </div>
  </div>
</div>

<!-- ==================== TAB: Z2 ==================== -->
<div class="panel" id="tab-z2">
  <div class="tag tag-red">Format: Forță · Pauză 90s între serii</div>
  <div class="phase-block">
    <div class="phase-hdr">
      <div class="phase-label">🔥 ZIUA B</div>
      <div class="phase-time">40 Min</div>
    </div>
    <div class="phase-title">Upper Body (Piept, Umeri, Triceps)</div>
    <div class="ex-list">
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">1. Decline Push-ups (Flotări declinate)</div>
          <div class="ex-sets">3 × 8–12</div>
        </div>
        <div class="ex-cue">Picioarele ridicate pe un scaun sau pat. Această unghiulație atacă pieptul superior.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+decline+push+ups+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">2. Flotări clasice (Push-ups)</div>
          <div class="ex-sets">3 × 10–15</div>
        </div>
        <div class="ex-cue">Dacă nu poți face 10 legate, fă-le cu mâinile sprijinite pe canapea/masă, nu pe genunchi.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+push+ups+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">3. Chair Dips (Flotări la scaun)</div>
          <div class="ex-sets">3 × 10–15</div>
        </div>
        <div class="ex-cue">Sprijină-te pe scaun, picioarele întinse în față. Izolează complet tricepsul.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+chair+dips+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">4. Diamond Push-ups</div>
          <div class="ex-sets">3 × 8–12</div>
        </div>
        <div class="ex-cue">Mâinile apropiate pe sol în formă de diamant. Aceasta e lovitura finală pentru triceps.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+diamond+push+ups+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">5. Forearm Plank (Planșă)</div>
          <div class="ex-sets">3 × Max Timp</div>
        </div>
        <div class="ex-cue">Stai pe antebrațe, încordează abdomenul și fesierii masiv. Menține până la cedare.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+forearm+plank+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
    </div>
  </div>
</div>

<!-- ==================== TAB: Z3 ==================== -->
<div class="panel" id="tab-z3">
  <div class="tag tag-red">Format: Forță · Pauză 90s între serii</div>
  <div class="phase-block">
    <div class="phase-hdr">
      <div class="phase-label">🔥 ZIUA C</div>
      <div class="phase-time">40 Min</div>
    </div>
    <div class="phase-title">Full Body Strength (Combo)</div>
    <div class="ex-list">
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">1. Pike Push-ups</div>
          <div class="ex-sets">3 × 8–12</div>
        </div>
        <div class="ex-cue">Bazinul ridicat în V, cobori creștetul spre sol. Singura flotare care atacă serios deltoizii (umerii).</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+pike+push+ups+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">2. Reverse Lunges (Fandări spate)</div>
          <div class="ex-sets">3 × 10–12/pic</div>
        </div>
        <div class="ex-cue">Faci pasul în spate, e mult mai sigur pe genunchi și activează foarte bine posteriorul.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+reverse+lunges+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">3. Wide Push-ups</div>
          <div class="ex-sets">3 × 10–15</div>
        </div>
        <div class="ex-cue">Flotări cu palmele mult mai late decât umerii, întinde pectoralul la maxim.</div>
        <a href="https://www.youtube.com/results?search_query=wide+push+ups+correct+form" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">4. Cossack Squats</div>
          <div class="ex-sets">3 × 8–10/pic</div>
        </div>
        <div class="ex-cue">Fandare laterală adâncă, excelentă pentru deschiderea șoldului și aductori. Execuție lentă.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+cossack+squats+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
      <div class="ex-item">
        <div class="ex-top">
          <div class="ex-name">5. Hollow Body Hold</div>
          <div class="ex-sets">3 × Max Timp</div>
        </div>
        <div class="ex-cue">Izometrie pură pentru core. Lombarul lipit obligatoriu de podea.</div>
        <a href="https://www.youtube.com/results?search_query=how+to+do+hollow+body+hold+correctly" target="_blank" class="btn-vid"><span>▶</span> Video</a>
      </div>
    </div>
  </div>
</div>
"""
content = re.sub(r'<!-- ==================== TAB: C1 ==================== -->.*?<!-- ==================== TAB: S1 ==================== -->', new_workouts + '\n<!-- ==================== TAB: S1 ==================== -->', content, flags=re.DOTALL)

with open("public/quickref/nelu-acasa.html", "w", encoding="utf-8") as f:
    f.write(content)
