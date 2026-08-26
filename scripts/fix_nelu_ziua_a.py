import re

with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

new_tab_a = """<!-- ═══════════════════════════════ ZIUA A — PUSH ═══════════════════════════════ -->
<div class="panel" id="tab-a">

  <div class="alert">
    <div class="alert-ttl">ZIUA A — PUSH (Piept, Umeri, Triceps)</div>
    Focusează-te pe execuție curată și pe conexiunea minte-mușchi. Ești începător, nu trebuie să impresionezi pe nimeni cu greutățile. Controlează coborârea (excentricul) la fiecare repetare.
  </div>

  <!-- 1. PEC DECK -->
  <div class="ex-block" id="ex-a1">
    <div class="ex-hdr" onclick="toggleEx('ex-a1')">
      <div class="ex-left">
        <div class="ex-num">01 · PIEPT</div>
        <div class="ex-ttl">Fluturări la aparat (Pec-Deck)</div>
        <div class="ex-meta">
          <span class="tag tag-red">3 × 12–15</span>
          <span class="tag tag-orange">90 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+pec+deck+fly+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta open">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă · Respirație</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Ține pieptul sus și umerii trași în spate. Strânge brațele în față și contractă pieptul 1 secundă pe final. Revenire lentă.</span></div>
          <div class="caseta-row"><span class="caseta-lbl">Rol</span><span class="caseta-val">Pre-epuizare și izolare perfectă pentru a simți pieptul activat înainte de exercițiile grele.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="a1s1"><div class="set-num">S1</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="a1s2"><div class="set-num">S2</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="a1s3"><div class="set-num">S3</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(90)">Start Pauză 1:30</button>
      </div>
    </div>
  </div>

  <!-- 2. INCLINE PRESS -->
  <div class="ex-block" id="ex-a2">
    <div class="ex-hdr" onclick="toggleEx('ex-a2')">
      <div class="ex-left">
        <div class="ex-num">02 · PIEPT SUPERIOR</div>
        <div class="ex-ttl">Împins pe plan înclinat (Gantere sau Bară)</div>
        <div class="ex-meta">
          <span class="tag tag-red">2 × 8–10</span>
          <span class="tag tag-orange">120 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/shorts/1V3vpcaxRYQ" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Banca setată la 30°. Coatele coboară la un unghi de 45 de grade față de trunchi, NU perfect paralele cu umerii. Împinge ferm.</span></div>
          <div class="caseta-row"><span class="caseta-lbl">Greșeală</span><span class="caseta-val"><span class="w">Deschiderea coatelor prea mult (în T)</span> — distruge articulația umărului.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="a2s1"><div class="set-num">S1</div><div class="set-tgt">8–10</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="a2s2"><div class="set-num">S2</div><div class="set-tgt">8–10</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(120)">Start Pauză 2:00</button>
      </div>
    </div>
  </div>

  <!-- 3. DIPS -->
  <div class="ex-block" id="ex-a3">
    <div class="ex-hdr" onclick="toggleEx('ex-a3')">
      <div class="ex-left">
        <div class="ex-num">03 · PIEPT INFERIOR / TRICEPS</div>
        <div class="ex-ttl">Dips (Flotări la paralele Asistat)</div>
        <div class="ex-meta">
          <span class="tag tag-red">2 × 10–12</span>
          <span class="tag tag-orange">90 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+assisted+dips+machine+chest+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Apleacă-te ușor în față ca să activezi mai mult pieptul. Coboară controlat până când umerii sunt la nivelul coatelor.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="a3s1"><div class="set-num">S1</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="a3s2"><div class="set-num">S2</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(90)">Start Pauză 1:30</button>
      </div>
    </div>
  </div>

  <!-- 4. SHOULDER PRESS -->
  <div class="ex-block" id="ex-a4">
    <div class="ex-hdr" onclick="toggleEx('ex-a4')">
      <div class="ex-left">
        <div class="ex-num">04 · UMERI</div>
        <div class="ex-ttl">Împins deasupra capului (Aparat sau Gantere)</div>
        <div class="ex-meta">
          <span class="tag tag-red">2 × 10–12</span>
          <span class="tag tag-orange">90 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+shoulder+press+machine+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Spatele lipit de spătar. Împinge greutatea deasupra capului fără să te lași pe spate exagerat. Coboară lent până la nivelul urechilor.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="a4s1"><div class="set-num">S1</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="a4s2"><div class="set-num">S2</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(90)">Start Pauză 1:30</button>
      </div>
    </div>
  </div>

  <!-- 5. SUPERSET LATERALE + TRICEPS -->
  <div class="ex-block" id="ex-a5">
    <div class="ex-hdr" onclick="toggleEx('ex-a5')">
      <div class="ex-left">
        <div class="ex-num">05 · SUPERSET UMERI + TRICEPS</div>
        <div class="ex-ttl">Laterale <span style="font-weight:400;color:#888;">+</span> Extensii Triceps deasupra capului</div>
        <div class="ex-meta">
          <span class="tag tag-red">3 Serii în Superset</span>
          <span class="tag tag-orange">Zero pauză între ele</span>
          <span class="superset">SUPERSET</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      
      <div style="padding:10px 14px 0;">
        <div style="font-size:11px;color:var(--wht);margin-bottom:6px;"><strong>A) Ridicări laterale cu ganterele</strong></div>
      </div>
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+lateral+raises+form+shorts" target="_blank" class="btn-yt" style="margin-bottom:0;"><div class="btn-yt-icon"></div>YouTube — Laterale</a>
      
      <div style="padding:10px 14px 0;margin-top:10px;border-top:1px solid rgba(255,255,255,0.05);">
        <div style="font-size:11px;color:var(--wht);margin-bottom:6px;"><strong>B) Extensii triceps deasupra capului (Scripete)</strong></div>
      </div>
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+overhead+triceps+extension+rope+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Extensii Triceps</a>

      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Cum se face Supersetul</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Regulă</span><span class="caseta-val">Faci un set de laterale, te muți Imediat la cablu și faci triceps. Abia apoi iei pauza de 60-90 secunde. Asta e o rundă.</span></div>
        </div></div>
      </div>

      <div class="sets-wrap">
        <div class="set-labels"><div>KG UMERI</div><div>KG TRICEPS</div></div>
        <div class="set-row" data-id="a5s1"><div class="set-num">R1</div><div class="set-tgt">15+15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="kg"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="a5s2"><div class="set-num">R2</div><div class="set-tgt">15+15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="kg"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="a5s3"><div class="set-num">R3</div><div class="set-tgt">15+15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="kg"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(90)">Start Pauză 1:30</button>
      </div>
    </div>
  </div>

</div>
"""

# Extract the block to replace
pattern = re.compile(r'<!-- ═══════════════════════════════ ZIUA A — PUSH ═══════════════════════════════ -->.*?<!-- ═══════════════════════════════ ZIUA B — SPATE \+ BICEPS ═══════════════════════════════ -->', re.DOTALL)
content = pattern.sub(new_tab_a + "\n<!-- ═══════════════════════════════ ZIUA B — SPATE + BICEPS ═══════════════════════════════ -->", content)

with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
    f.write(content)
