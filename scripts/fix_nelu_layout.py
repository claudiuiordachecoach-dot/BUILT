import re

def fix_acasa():
    with open("public/quickref/nelu-acasa-v2.html", "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Fix tabs layout to group them nicely and remove the corrupted floating tabs
    new_tabs = """<div class="tabs">
  <div class="tab active" onclick="showTab('info')">Info</div>
  <div class="tab" onclick="showTab('z1')">ANTRENAMENT: ZIUA A</div>
  <div class="tab" onclick="showTab('z2')">ANTRENAMENT: ZIUA B</div>
  <div class="tab" onclick="showTab('z3')">ANTRENAMENT: ZIUA C</div>
  <div class="tab" onclick="showTab('s1')">STRETCHING: POSTURĂ</div>
  <div class="tab" onclick="showTab('s2')">STRETCHING: ȘOLDURI</div>
  <div class="tab" onclick="showTab('s3')">STRETCHING: CERVICAL</div>
  <div class="tab" onclick="showTab('s4')">STRETCHING: LOMBAR</div>
  <div class="tab" onclick="showTab('s5')">STRETCHING: FLUX</div>
</div>"""
    
    # Replace everything from <!-- TABS --> down to <!-- ==================== TAB: INFO ==================== -->
    content = re.sub(r'<!-- TABS -->.*?<!-- ==================== TAB: INFO ==================== -->', f'<!-- TABS -->\n{new_tabs}\n\n<!-- ==================== TAB: INFO ==================== -->', content, flags=re.DOTALL)

    # 2. Update INFO tab
    new_info = """<div class="panel active" id="tab-info">
  <div class="alert-box">
    <div class="alert-ttl">Obiectivul Protocoalelor Acasă (Stil STRENGTH)</div>
    Acest plan este conceput exclusiv pe stilul STRENGTH (hipertrofie și forță), pentru zilele când ratezi sala.<br><br>
    <strong>Zilele A/B/C:</strong> Fără grabă, fără circuite cronometrate. Folosești pauze de 1 minut între serii, fix ca la sală. Te bazezi pe timpul sub tensiune (Tempo) pentru a face greutatea corpului să se simtă grea.<br>
    <strong>Stretching-ul (S1-S5):</strong> Ajută la relaxarea mușchilor rigizi de la statul prelungit pe scaun, cu accent special pe eliberarea tensiunii din zona lombară și cervicală.
  </div>

  <div class="sec-ttl">Regula de Aur a Antrenamentului Acasă</div>
  <ul class="rule-list">
    <li><strong>Regula Tempo (3-1-X):</strong> Coborâre controlată (negativ) timp de 3 secunde. Menține în izometrie (pauză jos) 1 secundă. Ridică-te exploziv (pozitiv). Această regulă face ca greutatea corpului să se simtă ca o bară cu discuri.</li>
    <li><strong>Corectitudinea execuției este mai importantă decât numărul de repetări.</strong> Concentrează-te pe o mișcare curată.</li>
    <li>Dacă nu ești sigur cum se face un exercițiu, apasă pe butonul "▶ VIDEO" pentru a vedea demonstrația directă.</li>
  </ul>
</div>"""
    content = re.sub(r'<div class="panel active" id="tab-info">.*?</div>(?=\s*<!-- ==================== TAB: Z1)', new_info, content, flags=re.DOTALL)

    with open("public/quickref/nelu-acasa-v2.html", "w", encoding="utf-8") as f:
        f.write(content)

def fix_antrenament():
    with open("public/quickref/nelu-antrenament-v2.html", "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove ACASA from JS array
    content = content.replace("['calendar','a','b','c','acasa','reguli']", "['calendar','a','b','c','reguli']")
    
    # 2. Remove ACASA from the tab bar
    content = re.sub(r'<div class="tab" onclick="showTab\(\'acasa\'\)">ACASĂ</div>\s*', '', content)

    # 3. Remove the entire ACASA panel
    content = re.sub(r'<!-- ==================== TAB: ACASĂ ==================== -->.*?<!-- ==================== TAB: REGULI ==================== -->', '<!-- ==================== TAB: REGULI ==================== -->', content, flags=re.DOTALL)

    with open("public/quickref/nelu-antrenament-v2.html", "w", encoding="utf-8") as f:
        f.write(content)

fix_acasa()
fix_antrenament()
