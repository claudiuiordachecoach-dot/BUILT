with open("public/quickref/nelu-antrenament.html", "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    # 1. Fix alert in Ziua B
    'Fiecare tragere din spate trebuie făcută inițiind mișcarea din omoplați (scapulă), nu din brațe. Concentrează-te pe control, nu pe inerție.': 'Orice exercițiu pentru spate începe prin strângerea omoplaților. Concentrează-te pe control, lasă egoul la ușă și nu folosi inerția.',
    
    # 2. Fix warm-up sets (remove parenthesis)
    '• <strong>Warm-up Set 1:</strong> Greutate mică × 8-10 rep (pentru sânge și mobilitate)<br>': '• <strong>Warm-up Set 1:</strong> Greutate mică × 8-10 rep<br>',
    '• <strong>Warm-up Set 2:</strong> Greutate moderată × 4-6 rep (pentru adaptare)<br>': '• <strong>Warm-up Set 2:</strong> Greutate moderată × 4-6 rep<br>',
    '• <strong>Warm-up Set 3:</strong> Greutate grea × 2-3 rep (opțional, pentru sistemul nervos)<br><br>': '• <strong>Warm-up Set 3:</strong> Greutate grea × 2-3 rep (opțional)<br><br>',
    
    # 3. Fix the skipped day logic
    'Ai ratat o zi din cauză că ai avut de stat peste program cu clienții? Nu te panica, nu încerca să recuperezi obsesiv. Reia planul din ziua următoare. Nu trebuie să fii perfect de luni până duminică, trebuie să fii constant luni de zile.': 'Ai ratat o zi din cauză că ai stat peste program la cabinet? Nu te panica. Următorul tău antrenament va fi fix cel pe care l-ai ratat. Menții ordinea A → B → C, indiferent în ce zile ale săptămânii pică. Nu trebuie să fii perfect, trebuie să fii constant.'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open("public/quickref/nelu-antrenament.html", "w", encoding="utf-8") as f:
    f.write(content)
