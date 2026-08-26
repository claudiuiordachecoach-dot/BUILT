import re

with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add the tab button
content = content.replace(
    '<div class="tab" onclick="showTab(this,\'c\')">LEGS — C</div>',
    '<div class="tab" onclick="showTab(this,\'c\')">LEGS — C</div>\n  <div class="tab" onclick="showTab(this,\'acasa\')">ACASĂ (HOME)</div>'
)

# 2. Update JS to include 'acasa' in tabIds
content = content.replace("['calendar','a','b','c','reguli']", "['calendar','a','b','c','acasa','reguli']")

# 3. Create the tab content using Nelu's CSS structures (.ex-block)
new_tab_acasa = """
<!-- ═══════════════════════════════ ACASĂ (HOME) ═══════════════════════════════ -->
<div class="panel" id="tab-acasa">

  <div class="alert">
    <div class="alert-ttl">MVE: Minimum Viable Effort</div>
    Când ești epuizat după o zi groaznică la birou și sala e imposibilă, ai acest circuit de urgență. 20 de minute în sufragerie te mențin în formă și nu te lasă să ieși din ritm. Zero scuze.
  </div>

  <!-- CIRCUITUL DE ACASA -->
  <div class="ex-block open" id="hm-circ">
    <div class="ex-hdr" onclick="toggleEx('hm-circ')">
      <div class="ex-left">
        <div class="ex-num">🔥 5 RUNDE · ZERO SCUZE</div>
        <div class="ex-ttl">Circuit MVE de Urgență (20 min)</div>
        <div class="ex-meta">
          <span class="tag tag-orange">45 sec lucru / 15 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <div class="caseta open">
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Structura</span><span class="caseta-val">Faci fiecare exercițiu de mai jos 45s urmate de 15s pauză, apoi treci imediat la următorul. 4 exerciții = 1 rundă (4 min). Repeți de 5 ori. Pauză între runde: 30-60 secunde.</span></div>
        </div></div>
      </div>
      
      <div class="wu-item">
        <div><div class="wu-name">1. Bodyweight Squats (Genuflexiuni libere)</div><div class="wu-cue">Ritm constant, coborâre completă. Spatele drept. Împinge în călcâie.</div></div>
      </div>
      <div class="wu-item">
        <div><div class="wu-name">2. Glute Bridge pe podea (Ridicări de bazin)</div><div class="wu-cue">Pe spate, împingi în călcâie, ridici bazinul și strângi fesele sus 1 secundă.</div></div>
      </div>
      <div class="wu-item">
        <div><div class="wu-name">3. Reverse Crunch (Abdomen)</div><div class="wu-cue">Pe spate, tragi genunchii și bazinul spre piept rulând coloana ușor. Control din abdomen, nu inerție.</div></div>
      </div>
      <div class="wu-item">
        <div><div class="wu-name">4. Hollow Body Hold (Izometrie abdomen)</div><div class="wu-cue">Lombarul lipit de podea, umerii și picioarele ușor ridicate. Menții poziția. Dacă cedezi, îndoi genunchii și continui.</div></div>
      </div>
    </div>
  </div>

  <!-- STRETCHING -->
  <div class="ex-block" id="hm-str">
    <div class="ex-hdr" onclick="toggleEx('hm-str')">
      <div class="ex-left">
        <div class="ex-num">🧘 RECUPERARE</div>
        <div class="ex-ttl">Rutina de Stretching (5 min)</div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <div class="caseta">
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">De ce?</span><span class="caseta-val">Fă asta după antrenament sau în zilele de pauză pentru a preveni durerile lombare provocate de statul pe scaun. Menții 30 secunde fiecare poziție.</span></div>
        </div></div>
      </div>
      
      <div class="wu-item">
        <div><div class="wu-name">1. Quad Stretch (Coapsa anterioară)</div><div class="wu-cue">Din picioare, tragi glezna la spate spre fesă. Ține genunchii apropiați. (30s / picior)</div></div>
      </div>
      <div class="wu-item">
        <div><div class="wu-name">2. Hip Flexor Stretch (Fandare statică)</div><div class="wu-cue">Un genunchi pe podea. Împingi bazinul ușor înainte până simți întinderea. (30s / picior)</div></div>
      </div>
      <div class="wu-item">
        <div><div class="wu-name">3. Pigeon Pose (Fesieri)</div><div class="wu-cue">Pe podea, un picior îndoit în față, celălalt extins în spate. Apleacă-te peste el. (30s / picior)</div></div>
      </div>
    </div>
  </div>

</div>
"""

# Insert tab-acasa before tab-reguli
pattern_reguli = re.compile(r'<!-- ═══════════════════════════════ REGULI ═══════════════════════════════ -->')
content = pattern_reguli.sub(new_tab_acasa + '\n<!-- ═══════════════════════════════ REGULI ═══════════════════════════════ -->', content)

with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
    f.write(content)
