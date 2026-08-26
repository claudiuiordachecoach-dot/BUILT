import re

with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replacements
replacements = [
    ("Andrei", "Nelu"),
    ("bancă plată", "plan orizontal"),
    ("banca plata", "plan orizontal"),
    ("Împins cu gantere la bancă", "Împins cu gantere din plan orizontal"),
    ("Împins cu gantere la umeri (seated)", "Împins cu gantere deasupra capului din șezut"),
    ("Shoulder rotations (goalpost)", "Rotații externe pentru umeri"),
    ("Fluturări la aparat (Pec Deck)", "Fluturări la aparat (Pec-Deck / Butterfly)"),
    ("Ramat cu cablu șezut (Seated Row)", "Ramat la scripete din șezut"),
    ("Ramat cu gantera pe bancă", "Ramat cu gantera din aplecat"),
    ("Leg Curl (Aparat culcat)", "Flexii femurali la aparat (Lying Leg Curl)"),
    ("Squat cu gantera la piept (Genuflexiuni tip Goblet)", "Genuflexiuni cu gantera la piept (Goblet Squat)"),
    ("Squat cu gantera la piept", "Genuflexiuni cu gantera la piept (Goblet Squat)"),
    ("Extensii triceps în jos la scripetă (Pushdown)", "Extensii triceps la scripete (Pushdown)"),
    ("Extensii triceps deasupra capului la scripetă", "Extensii triceps deasupra capului la scripete"),
    ("scripetă", "scripete"),
    ("Scripetă", "Scripete")
]

for old, new in replacements:
    content = content.replace(old, new)

with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
    f.write(content)

