import re
import os

file_path = '/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/public/quickref/ciprian-antrenament-v2.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

all_tabs_html = """<!-- ==================== TAB 2: ZIUA A ==================== -->
<div class="panel" id="tab-ziuaA">
  <div class="tag tag-red">Ziua A — Luni · Lower Body (Fundație)</div>

  <div class="acc-card open">
    <div class="acc-hdr" onclick="toggleAcc(this)">
      <div class="acc-title-area">
        <div class="acc-label">💪 Exerciții Principale</div>
        <div class="acc-name">Hipertrofie &amp; Control</div>
      </div>
      <div class="acc-icon">▼</div>
    </div>
    <div class="acc-content">
      <div class="acc-body">
        <div class="ex-list">
          <div class="ex-item">
            <div>
              <div class="ex-name">1. Squat cu greutatea corpului</div>
              <div class="ex-cue">Tempo 3-1-1. Picioarele la lățimea umerilor. Coborâre lentă. Protejează umărul.</div>
              <a href="https://www.youtube.com/shorts/O1x7AoUf5Vs" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">4 × 15 repetări</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">2. Fandare alternativă</div>
              <div class="ex-cue">Tempo 3-1-1. Un pas mare, cobori controlat genunchiul din spate spre podea.</div>
              <a href="https://www.youtube.com/shorts/oLyP6sORFOc" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">4 × 10 repetări/picior</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">3. Hip Thrust (Ridicări de bazin)</div>
              <div class="ex-cue">Tempo 1-2-1. Din culcat pe spate, împingi în călcâie și ridici bazinul. Strânge fesele sus.</div>
              <a href="https://www.youtube.com/shorts/iuYB_fLp26Q" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">4 × 15 repetări</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">4. Step-up pe treaptă / scaun</div>
              <div class="ex-cue">Tempo 3-1-1. Urcare controlată, coborâre foarte lentă pentru tensiune pe cvadriceps.</div>
              <a href="https://www.youtube.com/shorts/uTKJk5KVgZo" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">3 × 12 repetări/picior</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">5. Calf Raises (Ridicări pe vârfuri)</div>
              <div class="ex-cue">Tempo 3-1-1. Mișcare completă, susținere scurtă în vârf.</div>
              <a href="https://www.youtube.com/shorts/rFsSeClGnNA" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">4 × 20 repetări</div>
              <div class="ex-rest">Rest 45s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="acc-card orange open">
    <div class="acc-hdr" onclick="toggleAcc(this)">
      <div class="acc-title-area">
        <div class="acc-label">⚡ 3 Runde (Circuit)</div>
        <div class="acc-name" style="color:var(--orange);">Finisher Core & Conditioning</div>
      </div>
      <div class="acc-icon">▼</div>
    </div>
    <div class="acc-content">
      <div class="acc-body">
        <div class="ex-list">
          <div class="ex-item">
            <div>
              <div class="ex-name">1. Hollow Body Hold</div>
              <div class="ex-cue">Lombarul lipit ferm de podea, picioarele ridicate.</div>
              <a href="https://www.youtube.com/shorts/pN_YFk4Lx8Q" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div class="ex-sets">30-45s</div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">2. Hip Thrust rapid (podea)</div>
              <div class="ex-cue">Fără bancă, ritm accelerat pentru pompare.</div>
              <a href="https://www.youtube.com/shorts/Z7gLnOCO89c" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div class="ex-sets">15 repetări</div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">3. Mountain Climber (brațul stâng)</div>
              <div class="ex-cue">Din plank pe antebrațe (protejezi dreapta), alternezi picioarele.</div>
              <a href="https://www.youtube.com/shorts/i-BBrCVNT9A" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div class="ex-sets">20 repetări</div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">4. Triceps Floor Press (braț stâng)</div>
              <div class="ex-cue">Împins de pe podea doar cu brațul sănătos.</div>
              <a href="https://www.youtube.com/shorts/uGs1CACL4mw" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div class="ex-sets">15 repetări</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ==================== TAB 3: ZIUA B (CORE) ==================== -->
<div class="panel" id="tab-ziuaB">
  <div class="tag tag-red">Ziua B — Marți · Lower Body 2</div>
  
  <div class="alert-box red">
    <div class="alert-ttl">UPDATE ANTRENAMENT</div>
    Varianta revizuită pentru protecția umărului și exerciții bilaterale noi (RDL).
  </div>

  <div class="acc-card open">
    <div class="acc-hdr" onclick="toggleAcc(this)">
      <div class="acc-title-area">
        <div class="acc-label">💪 Exerciții Principale (40 min)</div>
        <div class="acc-name">Ziua 2 (Lanț Posterior)</div>
      </div>
      <div class="acc-icon">▼</div>
    </div>
    <div class="acc-content">
      <div class="acc-body">
        <div class="ex-list">
          <div class="ex-item">
            <div>
              <div class="ex-name">1. Goblet Squat (Genuflexiune cu greutate)</div>
              <div class="ex-cue">Tempo 3-1-1. Greutatea ținută la piept, spatele drept, genunchii în afară.</div>
              <a href="https://www.youtube.com/shorts/cuUPtfanAFQ" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">4 × 12</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">2. RDL cu ambele mâini (Romanian Deadlift)</div>
              <div class="ex-cue">Picioarele apropiate, genunchii ușor flexați. Aplecare din șold cu spatele perfect drept.</div>
              <a href="https://www.youtube.com/shorts/hu3jRvTc_po" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">4 × 12</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">3. Hip Bridges</div>
              <div class="ex-cue">Pe spate, împinge în călcâie și ridică bazinul strângând fesele în vârf.</div>
              <a href="https://www.youtube.com/shorts/RrU4zx4ysnI" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">4 × 15</div>
              <div class="ex-rest">Rest 45s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">4. Calf Raises pe un picior (Deficit)</div>
              <div class="ex-cue">Pe o treaptă, cobori călcâiul sub nivel pentru întindere completă.</div>
              <a href="https://www.youtube.com/shorts/Gib5N2U6gDM" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">3 × 15/parte</div>
              <div class="ex-rest">Rest 45s</div>
            </div>
          </div>
          
          <div class="ex-item">
            <div>
              <div class="ex-name">5. Finisher Circuit: Isometric Squat + Lunge + Plank <span class="superset">Circuit</span></div>
              <div class="ex-cue">
                Circuit (3 runde, 30s pauză între runde):<br>
                • <strong>Isometric Squat Hold:</strong> 45s <a href="https://www.youtube.com/shorts/SJ7r9mPL5a0" target="_blank" style="color:var(--orange);">[Video]</a><br>
                • <strong>Reverse Lunge:</strong> 10/10 <a href="https://www.youtube.com/shorts/b_2qgdXT_QQ" target="_blank" style="color:var(--orange);">[Video]</a><br>
                • <strong>Plank:</strong> max timp <a href="https://www.youtube.com/shorts/xe2MXatLTUw" target="_blank" style="color:var(--orange);">[Video]</a>
              </div>
            </div>
            <div>
              <div class="ex-sets">3 runde</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ==================== TAB 4: ZIUA C ==================== -->
<div class="panel" id="tab-ziuaC">
  <div class="tag tag-red">Ziua C — Joi · Upper Body + Core</div>

  <div class="acc-card open">
    <div class="acc-hdr" onclick="toggleAcc(this)">
      <div class="acc-title-area">
        <div class="acc-label">💪 Exerciții Principale (40 min)</div>
        <div class="acc-name">Ziua 3 (Upper Body)</div>
      </div>
      <div class="acc-icon">▼</div>
    </div>
    <div class="acc-content">
      <div class="acc-body">
        <div class="ex-list">
          <div class="ex-item">
            <div>
              <div class="ex-name">1. Ramat cu o ganteră (Dumbbell Row)</div>
              <div class="ex-cue">Sprijin pe băncuță/scaun, tragi gantera spre șold ținând cotul pe lângă corp. Nu smuci.</div>
              <a href="https://www.youtube.com/shorts/vu_YDt9nGv4" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">4 × 10/parte</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">2. Zottman Curls</div>
              <div class="ex-cue">Flexii normale pe urcare (palmele în sus), rotești încheietura sus și cobori cu palmele în jos (pronație).</div>
              <a href="https://www.youtube.com/shorts/5Go_uOTnFl0" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">3 × 12</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">3. Extensii triceps deasupra capului</div>
              <div class="ex-cue">Din picioare sau șezut, ții o ganteră cu ambele mâini deasupra capului. Cobori gantera în spatele capului, apoi extinzi.</div>
              <a href="https://www.youtube.com/shorts/b_r_LW4HEcM" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">3 × 12</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">4. Pullover de pe băncuță</div>
              <div class="ex-cue">Pe spate pe băncuță, brațele ușor îndoite țin o ganteră. Cobori gantera peste cap controlat, apoi o tragi înapoi.</div>
              <a href="https://www.youtube.com/shorts/Datv2L6t3-4" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">3 × 12</div>
              <div class="ex-rest">Rest 45s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">5. Reverse Crunches</div>
              <div class="ex-cue">Pe spate, tragi genunchii spre piept ridicând ușor bazinul de pe podea. Control la coborâre.</div>
              <a href="https://www.youtube.com/shorts/CteJ7rs2n-8" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">3 × 15</div>
              <div class="ex-rest">Rest 45s</div>
            </div>
          </div>

          <div class="ex-item">
            <div>
              <div class="ex-name">6. Finisher Circuit: Dead Bug + Hammer Curl + Russian Twist + Floor Press <span class="superset">Circuit</span></div>
              <div class="ex-cue">
                Circuit (3 runde, 30s pauză între runde):<br>
                • <strong>Dead Bug:</strong> 10/10 <a href="https://www.youtube.com/shorts/DqLL45uk2Tk" target="_blank" style="color:var(--red);">[Video]</a><br>
                • <strong>Hammer Curls:</strong> 15 rep <a href="https://www.youtube.com/shorts/Z7gLnOCO89c" target="_blank" style="color:var(--red);">[Video]</a><br>
                • <strong>Russian Twist:</strong> 20 rep <a href="https://www.youtube.com/shorts/MKfv0WiTeEQ" target="_blank" style="color:var(--red);">[Video]</a><br>
                • <strong>Dumbbell Floor Press:</strong> 15 rep <a href="https://www.youtube.com/shorts/O1x7AoUf5Vs" target="_blank" style="color:var(--red);">[Video]</a>
              </div>
            </div>
            <div>
              <div class="ex-sets">3 runde</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ==================== TAB 5: ZIUA D ==================== -->
<div class="panel" id="tab-ziuaD">
  <div class="tag tag-red">Ziua D — Vineri/Sâmbătă · Lower Body Intens</div>

  <div class="acc-card open">
    <div class="acc-hdr" onclick="toggleAcc(this)">
      <div class="acc-title-area">
        <div class="acc-label">💪 Exerciții Principale (40 min)</div>
        <div class="acc-name">Ziua 4 (Picioare și Volum)</div>
      </div>
      <div class="acc-icon">▼</div>
    </div>
    <div class="acc-content">
      <div class="acc-body">
        <div class="ex-list">
          <div class="ex-item">
            <div>
              <div class="ex-name">1. Bulgarian Split Squat</div>
              <div class="ex-cue">Sprijini un picior pe un scaun/bancă în spate. Cobori controlat și împingi în călcâiul din față.</div>
              <a href="https://www.youtube.com/shorts/or1frhkjBDc" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">3 × 10/parte</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">2. Fandări în față (Forward Lunges)</div>
              <div class="ex-cue">Pas în față, control la coborâre, împingere puternică înapoi.</div>
              <a href="https://www.youtube.com/shorts/mJilHWIBWO8" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">3 × 12/parte</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">3. Sumo Squat</div>
              <div class="ex-cue">Picioarele depărtate, vârfurile spre exterior. Accent pe interiorul coapsei și fesieri.</div>
              <a href="https://www.youtube.com/shorts/sQ-lwJtpwUc" target="_blank" class="btn-vid"><span>▶</span> Video</a>
            </div>
            <div>
              <div class="ex-sets">4 × 15</div>
              <div class="ex-rest">Rest 60s</div>
            </div>
          </div>
          <div class="ex-item">
            <div>
              <div class="ex-name">4. Ridicări pe vârfuri pt gambe</div>
              <div class="ex-cue">Execuție simplă, mișcare completă sus-jos.</div>
              
            </div>
            <div>
              <div class="ex-sets">4 × 20</div>
              <div class="ex-rest">Rest 45s</div>
            </div>
          </div>
          
          <div class="ex-item">
            <div>
              <div class="ex-name">5. Finisher Circuit: Wall Sit + Fast Squats + Hollow Hold <span class="superset">Circuit</span></div>
              <div class="ex-cue">
                Circuit (3 runde, 30s pauză între runde):<br>
                • <strong>Wall Sit:</strong> 45s <a href="https://www.youtube.com/shorts/UZp11A98yyU" target="_blank" style="color:var(--orange);">[Video]</a><br>
                • <strong>Bodyweight Squats rapide:</strong> 20 rep <a href="https://www.youtube.com/shorts/BVQh8jT4hLs" target="_blank" style="color:var(--orange);">[Video]</a><br>
                • <strong>Hollow Body Hold:</strong> max timp <a href="https://www.youtube.com/shorts/pN_YFk4Lx8Q" target="_blank" style="color:var(--orange);">[Video]</a>
              </div>
            </div>
            <div>
              <div class="ex-sets">3 runde</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
"""

pattern = re.compile(r'<!-- ==================== TAB 2: ZIUA A.*?<!-- ==================== TAB 6: MOBILITATE', re.DOTALL)
new_content = pattern.sub(all_tabs_html + "\n<!-- ==================== TAB 6: MOBILITATE", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully replaced all 4 days in ciprian-antrenament-v2.html")
