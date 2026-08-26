import re

with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

new_tab_c = """<!-- ═══════════════════════════════ ZIUA C — PICIOARE + CORE ═══════════════════════════════ -->
<div class="panel" id="tab-c">

  <div class="alert">
    <div class="alert-ttl">ZIUA C — LEGS (Picioare + Core)</div>
    Picioarele necesită concentrare și stabilitate. Cele 2-3 serii per exercițiu sunt serii de lucru (Working Sets). Asigură-te că te încălzești progresiv înainte de primul exercițiu, așa cum scrie la secțiunea Reguli.
  </div>

  <!-- 1. LEG EXTENSION -->
  <div class="ex-block" id="ex-c1">
    <div class="ex-hdr" onclick="toggleEx('ex-c1')">
      <div class="ex-left">
        <div class="ex-num">01 · CVADRICEPS</div>
        <div class="ex-ttl">Extensii la aparat (Leg Extension)</div>
        <div class="ex-meta">
          <span class="tag tag-red">2 × 12–15</span>
          <span class="tag tag-orange">90 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/shorts/uM86QE59Tgc" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta open">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Ține spatele lipit de spătar și șezutul tras în scaun. Extinde picioarele complet și contractă cvadricepsul sus timp de 1 secundă. Coboară greutatea lent.</span></div>
          <div class="caseta-row"><span class="caseta-lbl">Rol</span><span class="caseta-val">Pre-epuizare pentru cvadriceps ca să încălzim bine genunchiul înainte de mișcările grele de mai jos.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="c1s1"><div class="set-num">S1</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="c1s2"><div class="set-num">S2</div><div class="set-tgt">12–15</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(90)">Start Pauză 1:30</button>
      </div>
    </div>
  </div>

  <!-- 2. LEG PRESS -->
  <div class="ex-block" id="ex-c2">
    <div class="ex-hdr" onclick="toggleEx('ex-c2')">
      <div class="ex-left">
        <div class="ex-num">02 · PICIOARE (BAZĂ)</div>
        <div class="ex-ttl">Presă pentru picioare (Leg Press)</div>
        <div class="ex-meta">
          <span class="tag tag-red">2 × 10–12</span>
          <span class="tag tag-orange">120 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+leg+press+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Picioarele la lățimea umerilor, poziționate pe mijlocul platformei. Coboară adânc atâta timp cât bazinul nu se dezlipește de pe scaun. </span></div>
          <div class="caseta-row"><span class="caseta-lbl">Atenție</span><span class="caseta-val">Nu bloca genunchii la extensia completă, ține-i foarte ușor flexați pe tot parcursul mișcării.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="c2s1"><div class="set-num">S1</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="c2s2"><div class="set-num">S2</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(120)">Start Pauză 2:00</button>
      </div>
    </div>
  </div>

  <!-- 3. GOBLET SQUAT -->
  <div class="ex-block" id="ex-c3">
    <div class="ex-hdr" onclick="toggleEx('ex-c3')">
      <div class="ex-left">
        <div class="ex-num">03 · PICIOARE (MOBILITATE & FORȚĂ)</div>
        <div class="ex-ttl">Genuflexiuni cu gantera (Goblet Squats)</div>
        <div class="ex-meta">
          <span class="tag tag-red">2 × 10–12</span>
          <span class="tag tag-orange">120 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+goblet+squat+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Ține o ganteră la piept, vertical. Ține spatele drept, împinge genunchii spre exterior (urmărind degetele picioarelor) și coboară controlat. </span></div>
          <div class="caseta-row"><span class="caseta-lbl">Beneficiu</span><span class="caseta-val">Poziția ganterei în față te obligă să ții trunchiul drept, protejând coloana lombară. </span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="c3s1"><div class="set-num">S1</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="c3s2"><div class="set-num">S2</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(120)">Start Pauză 2:00</button>
      </div>
    </div>
  </div>

  <!-- 4. LEG CURLS -->
  <div class="ex-block" id="ex-c4">
    <div class="ex-hdr" onclick="toggleEx('ex-c4')">
      <div class="ex-left">
        <div class="ex-num">04 · FEMURALI (POSTERIOR)</div>
        <div class="ex-ttl">Flexii picioare (Leg Curls la aparat)</div>
        <div class="ex-meta">
          <span class="tag tag-red">3 × 10–12</span>
          <span class="tag tag-orange">90 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+leg+curl+machine+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Din șezut sau culcat, trage greutatea spre șezut controlat. Nu lăsa greutatea să smucească piciorul pe revenire. </span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="c4s1"><div class="set-num">S1</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="c4s2"><div class="set-num">S2</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="c4s3"><div class="set-num">S3</div><div class="set-tgt">10–12</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(90)">Start Pauză 1:30</button>
      </div>
    </div>
  </div>

  <!-- 5. CALF RAISES -->
  <div class="ex-block" id="ex-c5">
    <div class="ex-hdr" onclick="toggleEx('ex-c5')">
      <div class="ex-left">
        <div class="ex-num">05 · GAMBE</div>
        <div class="ex-ttl">Ridicări pe vârfuri (Aparat/Gantere)</div>
        <div class="ex-meta">
          <span class="tag tag-red">4 × 15–20</span>
          <span class="tag tag-orange">60 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+calf+raises+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Coboară călcâiul maxim până simți întinderea gambei. Pauză 1 secundă jos, apoi explodează pe vârfuri. Pauză 1 secundă sus.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>REPS</div></div>
        <div class="set-row" data-id="c5s1"><div class="set-num">S1</div><div class="set-tgt">15–20</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="c5s2"><div class="set-num">S2</div><div class="set-tgt">15–20</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="c5s3"><div class="set-num">S3</div><div class="set-tgt">15–20</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="c5s4"><div class="set-num">S4</div><div class="set-tgt">15–20</div><input class="set-inp kg" type="number" placeholder="kg"><input class="set-inp rep" type="number" placeholder="rp"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(60)">Start Pauză 1:00</button>
      </div>
    </div>
  </div>

  <!-- 6. PLANK -->
  <div class="ex-block" id="ex-c6">
    <div class="ex-hdr" onclick="toggleEx('ex-c6')">
      <div class="ex-left">
        <div class="ex-num">06 · CORE (ABDOMEN)</div>
        <div class="ex-ttl">Plank (Scândura)</div>
        <div class="ex-meta">
          <span class="tag tag-red">3 × Max Timp</span>
          <span class="tag tag-orange">60 sec pauză</span>
        </div>
      </div>
      <div class="ex-icon">▼</div>
    </div>
    <div class="ex-body">
      <a href="https://www.youtube.com/search?btnI=1&q=site:youtube.com+perfect+plank+form+shorts" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Execuție Corectă</a>
      <div class="caseta">
        <div class="caseta-hdr" onclick="toggleCaseta(this)">
          <span class="caseta-hdr-lbl">Execuție · Formă</span>
          <span class="caseta-icon">▼</span>
        </div>
        <div class="caseta-body"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Execuție</span><span class="caseta-val">Antebrațele pe sol. Corpul perfect drept. Contractează puternic abdomenul și fesele. Nu lăsa bazinul să coboare.</span></div>
        </div></div>
      </div>
      <div class="sets-wrap">
        <div class="set-labels"><div>KG</div><div>SEC.</div></div>
        <div class="set-row" data-id="c6s1"><div class="set-num">S1</div><div class="set-tgt">MAX</div><input class="set-inp kg" type="number" placeholder="kg" disabled value="0" style="opacity:0.3;"><input class="set-inp rep" type="number" placeholder="sec"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="c6s2"><div class="set-num">S2</div><div class="set-tgt">MAX</div><input class="set-inp kg" type="number" placeholder="kg" disabled value="0" style="opacity:0.3;"><input class="set-inp rep" type="number" placeholder="sec"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <div class="set-row" data-id="c6s3"><div class="set-num">S3</div><div class="set-tgt">MAX</div><input class="set-inp kg" type="number" placeholder="kg" disabled value="0" style="opacity:0.3;"><input class="set-inp rep" type="number" placeholder="sec"><div class="set-chk" onclick="toggleSet(this)"></div></div>
        <button class="rest-btn" onclick="startRest(60)">Start Pauză 1:00</button>
      </div>
    </div>
  </div>

</div>
"""

pattern_c_to_reguli = re.compile(r'<!-- ═══════════════════════════════ ZIUA C — PICIOARE \+ CORE ═══════════════════════════════ -->.*?<!-- ═══════════════════════════════ REGULI ═══════════════════════════════ -->', re.DOTALL)
content = pattern_c_to_reguli.sub(new_tab_c + "\n<!-- ═══════════════════════════════ REGULI ═══════════════════════════════ -->", content)

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
    • <strong>Warm-up Set 1:</strong> Greutate mică × 8-10 rep (pentru sânge și mobilitate)<br>
    • <strong>Warm-up Set 2:</strong> Greutate moderată × 4-6 rep (pentru adaptare)<br>
    • <strong>Warm-up Set 3:</strong> Greutate grea × 2-3 rep (opțional, pentru sistemul nervos)<br><br>
    → Abia după aceste încălziri, notezi în aplicație primele două/trei serii de lucru efectiv, acelea la care tragi până aproape de eșec.<br>
    <em>La ultimele două exerciții din zi de izolare, mușchiul e deja încălzit, ajunge o singură serie ușoară de acomodare.</em>
  </div>

  <div class="alert" style="border-left:4px solid #f59e0b;">
    <div class="alert-ttl">Constanța > Perfecțiunea</div>
    Ai ratat o zi din cauză că ai avut de stat peste program cu clienții? Nu te panica, nu încerca să recuperezi obsesiv. Reia planul din ziua următoare. Nu trebuie să fii perfect de luni până duminică, trebuie să fii constant luni de zile.
  </div>

</div>
"""
content = re.sub(r'<!-- ═══════════════════════════════ REGULI ═══════════════════════════════ -->.*', '<!-- ═══════════════════════════════ REGULI ═══════════════════════════════ -->' + new_reguli + '\n\n<div class="timer-bar" id="t-bar" style="display:none;">\n<div class="t-info">\n<div class="t-lbl">PAUZĂ</div>\n<div class="t-val" id="t-val">00:00</div>\n</div>\n<div class="t-ctrls">\n<button class="t-btn" onclick="addTime(15)">+15s</button>\n<button class="t-btn" onclick="addTime(-15)">-15s</button>\n<button class="t-btn red" onclick="stopRest()">OPREȘTE</button>\n</div>\n</div>\n\n<script>\nlet tabIds=[\'calendar\',\'a\',\'b\',\'c\',\'reguli\'];\nfunction showTab(btn,tid){\ndocument.querySelectorAll(\'.tab\').forEach(e=>e.classList.remove(\'active\'));\nbtn.classList.add(\'active\');\ndocument.querySelectorAll(\'.panel\').forEach(e=>e.classList.remove(\'active\'));\ndocument.getElementById(\'tab-\'+tid).classList.add(\'active\');\nwindow.scrollTo(0,0);\n}\nfunction toggleEx(id){\nlet el=document.getElementById(id);\nel.classList.toggle(\'open\');\n}\nfunction toggleCaseta(hdr){\nhdr.parentElement.classList.toggle(\'open\');\n}\nfunction toggleSet(chk){\nchk.classList.toggle(\'done\');\n}\n\nlet rTimer=null,rEnd=0;\nfunction startRest(sec){\ndocument.getElementById(\'t-bar\').style.display=\'flex\';\nrEnd=Date.now()+sec*1000;\nif(rTimer) clearInterval(rTimer);\nupdateRest();\nrTimer=setInterval(updateRest,1000);\n}\nfunction addTime(s){\nif(rTimer) rEnd+=s*1000;\nupdateRest();\n}\nfunction stopRest(){\nclearInterval(rTimer);\ndocument.getElementById(\'t-bar\').style.display=\'none\';\n}\nfunction updateRest(){\nlet left=Math.round((rEnd-Date.now())/1000);\nlet tv=document.getElementById(\'t-val\');\nif(left<=0){\nclearInterval(rTimer);\ntv.innerText=\'00:00\';tv.className=\'t-val done\';\n}else{\nlet m=Math.floor(left/60),s=left%60;\ntv.innerText=(m<10?\'0\'+m:m)+\':\'+(s<10?\'0\'+s:s);\ntv.className=\'t-val active\';\n}\n}\n</script>\n</body>\n</html>', content, flags=re.DOTALL)


with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
    f.write(content)
