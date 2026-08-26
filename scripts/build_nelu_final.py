import re

def build_nelu():
    with open("public/quickref/andrei-antrenament.html", "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Names and basic replacements
    content = content.replace("Andrei", "Nelu")
    content = content.replace("built_andrei_gym", "built_nelu_gym")
    content = content.replace("121 kg", "82.5 kg")
    content = content.replace("109 kg", "82.5 kg")

    # Terminology fixes
    replacements = {
        "bancă plată": "plan orizontal",
        "Bancă plată": "Plan orizontal",
        "Seated Cable Row": "Ramat la scripete din șezut",
        "Seated Cat-Cow": "Flexie/Extensie lombară din șezut",
        "Seated Row": "Ramat din șezut",
        "Pec Deck": "Pec-Deck / Butterfly",
        "Aparat culcat": "Flexii femurali la aparat (Lying Leg Curl)",
        "Squat cu gantera": "Genuflexiuni cu gantera (Goblet Squat)",
        "scripetă": "scripete",
        "Scripetă": "Scripete",
        "împins la umeri (seated)": "împins cu gantere deasupra capului din șezut"
    }
    for old, new in replacements.items():
        content = re.sub(re.escape(old), new, content, flags=re.IGNORECASE)
    
    # 2. Add WARMUP tab button
    tab_html = """  <div class="tab" onclick="showTab(this,'combo')">FULL UPPER — COMBO</div>
  <div class="tab" onclick="showTab(this,'warmup')">MOBILITATE PRE</div>"""
    content = content.replace("""  <div class="tab" onclick="showTab(this,'combo')">FULL UPPER — COMBO</div>""", tab_html)

    # 3. Add WARMUP panel content (needs to go before REGULI or at the end)
    warmup_panel = """
<!-- ==================== TAB: WARMUP ==================== -->
<div class="panel" id="tab-warmup">
  <div class="tag tag-red">Mobilitate Pre-Antrenament · Obligatoriu 10-15 min</div>
  
  <div class="alert-box">
    <div class="alert-ttl">De Ce Nu Se Sare</div>
    Ca începător cu job sedentar de birou (13-14h/zi), articulațiile și tendoanele tale sunt rigide. Fără încălzire, forțezi structuri nepregătite și riști accidentări. Acest circuit îți "unge" articulațiile și trezește sistemul nervos.
  </div>

  <div class="sec-ttl">Cardio Ușor (Lubrifiere)</div>
  <div class="ex-block">
    <div class="ex-body" style="display:block;">
      <div class="caseta open" style="margin-top:0;">
        <div class="caseta-body" style="display:block;">
          <div class="caseta-inner">
            <div class="caseta-row"><span class="caseta-lbl">5-10 Minute</span><span class="caseta-val">Bicicletă staționară sau mers pe bandă înclinată. Pulsul trebuie să crească ușor, până simți că te încălzești și respiri puțin mai des. Nu te epuiza.</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="sec-ttl">Circuit Mobilitate & Activare (2 Runde)</div>
  
  <div class="ex-block">
    <div class="ex-body" style="display:block;">
      <a href="https://youtube.com/shorts/30JkZib-u5A" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Cat-Cow</a>
      <div class="caseta open">
        <div class="caseta-body" style="display:block;"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Cat-Cow (10 reps)</span><span class="caseta-val">În 4 labe. Arcuiește coloana în sus (pisică), trage bărbia în piept. Apoi coboară burta spre podea și ridică privirea. Mobilizează coloana înțepenită de la scaun.</span></div>
        </div></div>
      </div>
    </div>
  </div>

  <div class="ex-block">
    <div class="ex-body" style="display:block;">
      <a href="https://youtube.com/shorts/pUu_h8Y8fP8" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Bird-Dog</a>
      <div class="caseta open">
        <div class="caseta-body" style="display:block;"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Bird-Dog (10/parte)</span><span class="caseta-val">Din 4 labe, întinde simultan mâna dreaptă și piciorul stâng. Menține spatele perfect drept, nu te roti. Activează zona lombară și core-ul.</span></div>
        </div></div>
      </div>
    </div>
  </div>

  <div class="ex-block">
    <div class="ex-body" style="display:block;">
      <a href="https://youtube.com/shorts/50OONc4fC40" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Glute Bridge</a>
      <div class="caseta open">
        <div class="caseta-body" style="display:block;"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Glute Bridge (15 reps)</span><span class="caseta-val">Pe spate, genunchii îndoiți. Împinge în călcâie și ridică bazinul. Strânge fesierii 2 secunde sus. Trezește fesierii amorțiți.</span></div>
        </div></div>
      </div>
    </div>
  </div>

  <div class="ex-block">
    <div class="ex-body" style="display:block;">
      <a href="https://www.youtube.com/shorts/yU-G6_2_QYk" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Band Pull-Aparts</a>
      <div class="caseta open">
        <div class="caseta-body" style="display:block;"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Band Pull-Aparts (15)</span><span class="caseta-val">Prinde un elastic cu brațele întinse în față. Trage de el până atinge pieptul, apropiind omoplații. Corectează umerii aduși în față.</span></div>
        </div></div>
      </div>
    </div>
  </div>

  <div class="ex-block">
    <div class="ex-body" style="display:block;">
      <a href="https://youtube.com/shorts/oD6hW5N-YQ0" target="_blank" class="btn-yt"><div class="btn-yt-icon"></div>YouTube — Dead Hangs</a>
      <div class="caseta open">
        <div class="caseta-body" style="display:block;"><div class="caseta-inner">
          <div class="caseta-row"><span class="caseta-lbl">Dead Hangs (30 sec)</span><span class="caseta-val">Atârnă de bara de tracțiuni, complet relaxat. Lasă gravitația să tragă de tine. Decompresie vertebrală excelentă.</span></div>
        </div></div>
      </div>
    </div>
  </div>

</div>
"""
    # Insert warmup panel before reguli
    content = content.replace('<!-- ==================== TAB: REGULI ==================== -->', warmup_panel + '\n<!-- ==================== TAB: REGULI ==================== -->')

    # 4. Modify schedule grid
    old_grid = """      <div class="wgrid">
        <div class="wd on"><div class="wd-n">Luni</div><div class="wd-t">PUSH</div><div class="wd-s">A</div></div>
        <div class="wd"><div class="wd-n">Marți</div><div class="wd-t">REST</div><div class="wd-s">Cardio Z2</div></div>
        <div class="wd on"><div class="wd-n">Mier</div><div class="wd-t">PULL</div><div class="wd-s">B</div></div>
        <div class="wd"><div class="wd-n">Joi</div><div class="wd-t">REST</div><div class="wd-s">Recuperare</div></div>
        <div class="wd on"><div class="wd-n">Vin</div><div class="wd-t">LEGS</div><div class="wd-s">C</div></div>
        <div class="wd"><div class="wd-n">Sâm</div><div class="wd-t">REST</div><div class="wd-s">Cardio Z2</div></div>
        <div class="wd"><div class="wd-n">Dum</div><div class="wd-t">REST</div><div class="wd-s">Familie</div></div>
      </div>"""
    
    new_grid = """      <div class="wgrid">
        <div class="wd"><div class="wd-n">Luni</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd"><div class="wd-n">Marți</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd"><div class="wd-n">Mier</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd on"><div class="wd-n">Joi</div><div class="wd-t">PUSH</div><div class="wd-s">A</div></div>
        <div class="wd"><div class="wd-n">Vin</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd on"><div class="wd-n">Sâm</div><div class="wd-t">PULL</div><div class="wd-s">B</div></div>
        <div class="wd on"><div class="wd-n">Dum</div><div class="wd-t">LEGS</div><div class="wd-s">C</div></div>
      </div>"""
    
    if old_grid in content:
        content = content.replace(old_grid, new_grid)

    # 5. Fix Reguli (Cardio at end + stretching at gym)
    content = content.replace("Mobilitate pre: <strong>5-7 min</strong> → Exerciții: <strong>45-50 min</strong> → Cardio: <strong>10-15 min</strong> (facultativ)",
                              "Mobilitate pre: <strong>10-15 min</strong> → Exerciții: <strong>45 min</strong> → Cardio Zone 2 (Bandă): <strong>15 min</strong>")
    content = content.replace("Stretching post: <strong>acasă</strong>", "Stretching post: <strong>10 min la sală</strong>")
    
    # NEAT
    content = content.replace('<div class="prog-val">6.000</div>', '<div class="prog-val">10.000</div>')
    content = content.replace('<div class="prog-note">Target normal, relaxat</div>', '<div class="prog-note">Pași/zi minim 8.000, ideal spre 10.000</div>')
    
    with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
        f.write(content)

build_nelu()
