import re

with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

new_tab_b = """<!-- ═══════════════════════════════ ZIUA B — SPATE + BICEPS ═══════════════════════════════ -->
<div class="panel" id="tab-b">

  <div class="alert">
    <div class="alert-ttl">ZIUA B — PULL (Spate, Biceps, Umăr Posterior)</div>
    Postura ta stă în acest antrenament. Fiecare tragere din spate trebuie făcută inițiind mișcarea din omoplați (scapulă), nu din brațe. Concentrează-te pe control, nu pe inerție.
  </div>

  <!-- 1. PULLOVER -->
  <div class="ex-block" id="ex-b1">
    <div class="ex-hdr" onclick="toggleEx('ex-b1')">
      <div class="ex-left">
        <div class="ex-num">01 · SPATE (PRE-Epuizare)</div>
        <div class="ex-ttl">Pullover la scripete</div>
        <div class="ex-meta">
          <span class="tag tag-red">2 × 12–15</span>
          <span class="tag tag-orange">90 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+cable+pullover+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta open">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Ține brațele ușor îndoite și blocate. Trage din umeri (nu din cot) descriind un arc de cerc larg până la coapse.</span></div>
          <div class="caseta-row"><span class="caseta-lbl">Rol</span><span class="caseta-val">Activează marele dorsal fără să obosească bicepsul. Te ajută să „simți” spatele.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="b1s1"><div class="set-num">S1</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="b1s2"><div class="set-num">S2</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(90)">Start Pauză 1:30</button>
      </div>
    </div>
  </div>

  <!-- 2. LAT PULLDOWN -->
  <div class="ex-block" id="ex-b2">
    <div class="ex-hdr" onclick="toggleEx('ex-b2')">
      <div class="ex-left">
        <div class="ex-num">02 · SPATE (TRACȚIUNE VERTICALĂ)</div>
        <div class="ex-ttl">Tracțiuni la aparat (Lat Pulldown)</div>
        <div class="ex-meta">
          <span class="tag tag-red">3 × 10–12</span>
          <span class="tag tag-orange">120 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+lat+pulldown+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Trage bara spre partea superioară a pieptului. Începe mișcarea trăgând umerii în jos (depresie scapulară). Controlează ridicarea (excentricul).</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="b2s1"><div class="set-num">S1</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="b2s2"><div class="set-num">S2</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="b2s3"><div class="set-num">S3</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(120)">Start Pauză 2:00</button>
      </div>
    </div>
  </div>

  <!-- 3. CHEST SUPPORTED HIGH ROW -->
  <div class="ex-block" id="ex-b3">
    <div class="ex-hdr" onclick="toggleEx('ex-b3')">
      <div class="ex-left">
        <div class="ex-num">03 · SPATE SUPERIOR</div>
        <div class="ex-ttl">Ramat cu sprijin pe piept (High Row)</div>
        <div class="ex-meta">
          <span class="tag tag-red">3 × 10–12</span>
          <span class="tag tag-orange">120 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+chest+supported+high+row+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Trage cu coatele sus (mai aproape de nivelul umerilor, unghi de ~45-60°). Asta mută tot efortul pe upper back. Sprijinul te protejează 100% de dureri lombare.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="b3s1"><div class="set-num">S1</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="b3s2"><div class="set-num">S2</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="b3s3"><div class="set-num">S3</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(120)">Start Pauză 2:00</button>
      </div>
    </div>
  </div>

  <!-- 4. SHRUGS -->
  <div class="ex-block" id="ex-b4">
    <div class="ex-hdr" onclick="toggleEx('ex-b4')">
      <div class="ex-left">
        <div class="ex-num">04 · TRAPEZ</div>
        <div class="ex-ttl">Ridicări de umeri (Shrugs) cu ganterele</div>
        <div class="ex-meta">
          <span class="tag tag-red">2 × 12–15</span>
          <span class="tag tag-orange">60 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+dumbbell+shrugs+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Ridicări strict verticale spre urechi. Ține contracția sus 1 secundă întreagă. NU roti umerii — mișcarea e doar sus-jos.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="b4s1"><div class="set-num">S1</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="b4s2"><div class="set-num">S2</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(60)">Start Pauză 1:00</button>
      </div>
    </div>
  </div>

  <!-- 5. BAYESIAN CURLS -->
  <div class="ex-block" id="ex-b5">
    <div class="ex-hdr" onclick="toggleEx('ex-b5')">
      <div class="ex-left">
        <div class="ex-num">05 · BICEPS</div>
        <div class="ex-ttl">Bayesian Curls (la cablu)</div>
        <div class="ex-meta">
          <span class="tag tag-red">3 × 10–12</span>
          <span class="tag tag-orange">90 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+bayesian+cable+curl+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Stai cu spatele la aparat. Lasă cablul să îți tragă brațul ușor în spate (alungire maximă a bicepsului). Flexează controlat fără să arunci umărul în față.</span></div>
          <div class="caseta-row"><span class="caseta-lbl">Beneficiu</span><span class="caseta-val">Alungirea bicepsului te ajută la postura umerilor căzuți, specifică sedentarismului.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="b5s1"><div class="set-num">S1</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="b5s2"><div class="set-num">S2</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="b5s3"><div class="set-num">S3</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(90)">Start Pauză 1:30</button>
      </div>
    </div>
  </div>

  <!-- 6. FACE PULLS -->
  <div class="ex-block" id="ex-b6">
    <div class="ex-hdr" onclick="toggleEx('ex-b6')">
      <div class="ex-left">
        <div class="ex-num">06 · UMĂR POSTERIOR</div>
        <div class="ex-ttl">Face Pulls la scripete</div>
        <div class="ex-meta">
          <span class="tag tag-red">3 × 12–15</span>
          <span class="tag tag-orange">60 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+face+pull+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Trage frânghia spre nivelul ochilor și rotește extern brațele spre final (arată bicepsul). Nu folosi inerția. E cheia pentru sănătatea umerilor tăi.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="b6s1"><div class="set-num">S1</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="b6s2"><div class="set-num">S2</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="b6s3"><div class="set-num">S3</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(60)">Start Pauză 1:00</button>
      </div>
    </div>
  </div>

</div>
"""

pattern = re.compile(r'<!-- ═══════════════════════════════ ZIUA B — SPATE \+ BICEPS ═══════════════════════════════ -->.*?<!-- ═══════════════════════════════ ZIUA C — PICIOARE \+ CORE ═══════════════════════════════ -->', re.DOTALL)
content = pattern.sub(new_tab_b + "\n<!-- ═══════════════════════════════ ZIUA C — PICIOARE + CORE ═══════════════════════════════ -->", content)

with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
    f.write(content)
