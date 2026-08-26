import re

file_path = "public/quickref/nelu-antrenament.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Structura Sesiunii
content = content.replace("Mobilitate pre: <strong>10 min</strong> → Exerciții: <strong>35 min</strong> → Cardio Zone 2: <strong>15 min</strong>",
                          "Mobilitate pre: <strong>10-15 min</strong> → Exerciții: <strong>40 min</strong> → Cardio (Mers pe bandă înclinată): <strong>15 min</strong>")
content = content.replace("Stretching post: <strong>7 min acasă</strong> (după mic dejun)",
                          "Stretching post: <strong>10 min la sală</strong> (imediat după antrenament)")

# 2. Reguli de Sistem
content = re.sub(r'<li><strong>Minim 1 zi de odihnă</strong> între sesiuni — întotdeauna\.</li>\s*', '', content)
content = re.sub(r'<li>Nu faci 2 sesiuni consecutive niciodată\.</li>\s*', '', content)
content = re.sub(r'<li>Intri la <strong>8:30–8:45</strong> → ieși până la <strong>9:30–9:45</strong>\.</li>\s*', '', content)
content = content.replace("<li>Stretchingul se face <strong>acasă</strong>, după micul dejun, nu în sală.</li>",
                          "<li>Stretchingul se face <strong>la sală</strong>, imediat după antrenament. Este crucial pentru o recuperare corectă a tendoanelor.</li>")

# 3. NEAT
content = content.replace('<div class="prog-val">8.000</div>', '<div class="prog-val">10.000</div>')
content = content.replace('<div class="prog-note">Pași/zi, distribuit pe tot parcursul zilei</div>',
                          '<div class="prog-note">Pași/zi minim 8.000, ideal spre 10.000 + 15 min Cardio la finalul antrenamentului.</div>')

# 4. Cardio & Stretching tags
content = content.replace("🏠 Stretching → Tab Stretching → Acasă", "🏋️ Stretching → Tab Stretching → La Sală")
content = content.replace("🏠 Se Face Acasă · După Mic Dejun · 7 min", "🏋️ Se Face La Sală · Post Antrenament · 10 min")
content = content.replace('<div class="alert-ttl">⚠ Nu în Sală</div>\n    Stretchingul se face acasă, după micul dejun (10:00–10:20). Nu mai ocupă timp din bugetul de sală.',
                          '<div class="alert-ttl">⚠ Obligatoriu în Sală</div>\n    Stretchingul se face imediat după antrenament, cât mușchii sunt calzi. Nu pleci fără să-l faci.')

# 5. Warmup Tab (Mobilitate Pre-Antrenament)
# Replace Upper A
upper_a_warmup_old = """  <div class="sec-ttl">Upper A — Joi</div>
  <div class="phase-block">
    <div class="ex-list">
      <div class="ex-item">
        <div>
          <div class="ex-name">Bicicletă staționară ușoară</div>
          <div class="ex-cue">Warm-up cardiac. Ritmul cardiac ușor ridicat.</div>
        </div>
        <div class="ex-sets">5 min</div>
      </div>
      <div class="ex-item">
        <div class="ex-name">Rotații umeri față + spate</div>
        <div class="ex-sets">2 × 10</div>
      </div>
      <div class="ex-item">
        <div class="ex-name">Band pull-aparts cu elastic (activare scapulă)</div>
        <div class="ex-sets">2 × 15</div>
      </div>
      <div class="ex-item">
        <div class="ex-name">Cat-Cow + rotații toracice pe genunchi</div>
        <div class="ex-sets">2 × 8</div>
      </div>
    </div>
  </div>"""

upper_a_warmup_new = """  <div class="sec-ttl">Upper A — Joi</div>
  <div class="phase-block">
    <div class="ex-list">
      <div class="ex-item">
        <div>
          <div class="ex-name">Bicicletă staționară sau bandă înclinată</div>
          <div class="ex-cue">Warm-up cardiac. Lubrifiere articulații și ridicarea temperaturii.</div>
        </div>
        <div class="ex-sets">5-10 min</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">Cat-Cow pentru coloană</div>
          <div class="ex-cue">Rupem postura cocoșată de la birou.</div>
        </div>
        <div class="ex-sets">2 × 10</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">Dead Hangs (Atârnat la bară)</div>
          <div class="ex-cue">Decompresie vertebrală excelentă. Stai atârnat.</div>
        </div>
        <div class="ex-sets">2 × 30s</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">Rotații externe umeri cu bandă elastică</div>
          <div class="ex-cue">Activare rotatori, vital pentru sănătatea umerilor la presat.</div>
        </div>
        <div class="ex-sets">2 × 15/parte</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">Band pull-aparts (Activare romboid/scapulă)</div>
          <div class="ex-cue">Tragi banda spre piept. Coatele drepte.</div>
        </div>
        <div class="ex-sets">2 × 15</div>
      </div>
    </div>
  </div>"""
content = content.replace(upper_a_warmup_old, upper_a_warmup_new)

# Replace Upper B
upper_b_warmup_old = """  <div class="sec-ttl">Upper B — Duminică</div>
  <div class="phase-block">
    <div class="ex-list">
      <div class="ex-item">
        <div>
          <div class="ex-name">Vâslă ergometru ușoară</div>
          <div class="ex-cue">Warm-up cardiac ușor, nu performanță.</div>
        </div>
        <div class="ex-sets">5 min</div>
      </div>
      <div class="ex-item">
        <div class="ex-name">Band pull-aparts (activare romboid + scapulă)</div>
        <div class="ex-sets">2 × 20</div>
      </div>
      <div class="ex-item">
        <div class="ex-name">Rotații externe umăr cu elastic</div>
        <div class="ex-sets">2 × 15/parte</div>
      </div>
    </div>
  </div>"""

upper_b_warmup_new = """  <div class="sec-ttl">Upper B — Duminică</div>
  <div class="phase-block">
    <div class="ex-list">
      <div class="ex-item">
        <div>
          <div class="ex-name">Bicicletă staționară sau bandă înclinată</div>
          <div class="ex-cue">Warm-up cardiac. Ridicarea pulsului treptat.</div>
        </div>
        <div class="ex-sets">5-10 min</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">Cat-Cow pentru coloană</div>
          <div class="ex-cue">Mobilizare a coloanei după scaun.</div>
        </div>
        <div class="ex-sets">2 × 10</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">Dead Hangs (Atârnat la bară)</div>
          <div class="ex-cue">Decompresie vertebrală totală.</div>
        </div>
        <div class="ex-sets">2 × 30s</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">Rotații externe umeri cu bandă elastică</div>
          <div class="ex-cue">Combate rotirea umerilor în față (cifoza de birou).</div>
        </div>
        <div class="ex-sets">2 × 15/parte</div>
      </div>
    </div>
  </div>"""
content = content.replace(upper_b_warmup_old, upper_b_warmup_new)

# Replace Lower
lower_warmup_old = """  <div class="sec-ttl">Lower — Sâmbătă</div>
  <div class="phase-block">
    <div class="ex-list">
      <div class="ex-item">
        <div class="ex-name">Hip 90/90 pe podea (mobilitate șolduri)</div>
        <div class="ex-sets">5/parte</div>
      </div>
      <div class="ex-item">
        <div class="ex-name">Banded Clamshells cu elastic (activare fesieri)</div>
        <div class="ex-sets">2 × 15/parte</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">Goblet Squat bodyweight</div>
          <div class="ex-cue">Ținut 3 sec jos. Adâncime maximă.</div>
        </div>
        <div class="ex-sets">2 × 8</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">World's Greatest Stretch</div>
          <div class="ex-cue">Fandare + rotație toracică. Cel mai complet warm-up de șold.</div>
        </div>
        <div class="ex-sets">5/parte</div>
      </div>
    </div>
  </div>"""

lower_warmup_new = """  <div class="sec-ttl">Lower — Sâmbătă</div>
  <div class="phase-block">
    <div class="ex-list">
      <div class="ex-item">
        <div>
          <div class="ex-name">Bicicletă staționară</div>
          <div class="ex-cue">Lubrifierea articulației genunchiului (fără impact).</div>
        </div>
        <div class="ex-sets">5-10 min</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">Bird-Dog (Activare Core + Lombar)</div>
          <div class="ex-cue">Ține coloana neutră. Întinzi mână și picior opus.</div>
        </div>
        <div class="ex-sets">2 × 10/parte</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">Glute Bridges (Activare fesieri)</div>
          <div class="ex-cue">Fesierii tăi sunt inhibați de la scaun. Strânge sus 2 sec.</div>
        </div>
        <div class="ex-sets">2 × 15</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">World's Greatest Stretch</div>
          <div class="ex-cue">Mobilitate șolduri. Fandare adâncă.</div>
        </div>
        <div class="ex-sets">5/parte</div>
      </div>
      <div class="ex-item">
        <div>
          <div class="ex-name">Goblet Squat bodyweight</div>
          <div class="ex-cue">Ținut 3 secunde jos, activează tot trenul inferior.</div>
        </div>
        <div class="ex-sets">2 × 8</div>
      </div>
    </div>
  </div>"""
content = content.replace(lower_warmup_old, lower_warmup_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
