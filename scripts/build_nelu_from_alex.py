import re
import os

def process_file(source_path, dest_path):
    with open(source_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Names and identifiers
    content = content.replace("Alexandru", "Nelu")
    content = content.replace("Alex", "Nelu")
    content = content.replace("built_alex_gym", "built_nelu_gym")
    content = content.replace("built_alex_home", "built_nelu_home")

    # 2. Terminology Fixes
    replacements = {
        "bancă plată": "plan orizontal",
        "Bancă plată": "Plan orizontal",
        "Seated Cable Row": "Ramat la scripete din șezut",
        "Seated Cat-Cow": "Flexie/Extensie lombară din șezut (Cat-Cow)",
        "Seated Row": "Ramat din șezut",
        "Pec Deck": "Pec-Deck / Butterfly",
        "Aparat culcat": "Flexii femurali la aparat (Lying Leg Curl)",
        "Squat cu gantera": "Genuflexiuni cu gantera (Goblet Squat)",
        "scripetă": "scripete",
        "Scripetă": "Scripete",
        "împins la umeri (seated)": "împins cu gantere deasupra capului din șezut"
    }
    
    for old, new in replacements.items():
        # case insensitive replace for exact phrases
        content = re.sub(re.escape(old), new, content, flags=re.IGNORECASE)

    # 3. Schedule mappings for Nelu: Joi (Upper A), Sâmbătă (Lower), Duminică (Upper B)
    # We replace the text headers
    content = content.replace("Zi 1 — Luni", "Zi 1 — Joi")
    content = content.replace("Zi 2 — Miercuri", "Zi 2 — Sâmbătă")
    content = content.replace("Zi 3 — Vineri", "Zi 3 — Duminică")
    
    content = content.replace("Upper A — Luni", "Upper A — Joi")
    content = content.replace("Lower — Miercuri", "Lower — Sâmbătă")
    content = content.replace("Upper B — Vineri", "Upper B — Duminică")

    # Custom context for Nelu
    content = content.replace("Glicemia ta este excelentă (85)", "Ești medic, sedentarism de 13-14h pe zi la cabinet, deci ai nevoie de un volum adaptat și postură.")

    # 4. Replace the Week Grid HTML block
    grid_pattern = re.compile(r'<div class="wgrid">.*?</div>\s*</div>\s*</div>', re.DOTALL)
    new_grid = """<div class="wgrid">
        <div class="wd"><div class="wd-n">Luni</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd"><div class="wd-n">Marți</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd"><div class="wd-n">Mier</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd on"><div class="wd-n">Joi</div><div class="wd-t">Upper A</div><div class="wd-s">Sală</div></div>
        <div class="wd"><div class="wd-n">Vin</div><div class="wd-t">Rest</div><div class="wd-s">Muncă</div></div>
        <div class="wd on"><div class="wd-n">Sâm</div><div class="wd-t">Lower</div><div class="wd-s">Sală</div></div>
        <div class="wd on"><div class="wd-n">Dum</div><div class="wd-t">Upper B</div><div class="wd-s">Sală</div></div>
      </div>
    </div>
  </div>"""
    
    if '<div class="wgrid">' in content:
        content = grid_pattern.sub(new_grid, content)

    # 5. Fix LS Key if missed
    content = content.replace("built_andrei_gym", "built_nelu_gym")
    
    with open(dest_path, "w", encoding="utf-8") as f:
        f.write(content)


# Run for both gym and home plans
os.makedirs("public/quickref", exist_ok=True)
process_file("public/quickref/alex-antrenament.html", "public/quickref/nelu-antrenament.html")
process_file("public/quickref/alex-acasa.html", "public/quickref/nelu-acasa.html")

print("Files generated successfully!")
