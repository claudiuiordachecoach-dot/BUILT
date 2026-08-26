import os

# Nelu's meals based on the mix & match plan
DAYS = [
    dict(num=1, theme="Ziua 1", sub="Iaurt · Pui · Somon", meals=[
        dict(meal="Mic dejun", title=["IAURT GRECESC", "CU WHEY"], time="⏱ 1 min", diff=1,
             ings=[("Iaurt grecesc 2%", "300g"), ("Whey Protein", "15g"), ("Banană", "120g"), ("Unt de arahide", "20g")],
             steps=["Amestecă iaurtul cu pudra proteică până se omogenizează.", "Adaugă felii de banană și untul de arahide deasupra.", "Rapid și sățios."],
             tip="Perfect pentru diminețile grăbite. Proteina din zer asigură un start anabolizant.",
             macros=(480, 35, 45, 18)),
        dict(meal="Prânz", title=["PUI GRĂTAR", "CU OREZ"], time="⏱ 30 min", diff=2,
             ings=[("Piept de pui (crud)", "200g"), ("Orez (crud)", "80g"), ("Ulei de măsline", "15g"), ("Legume mixte", "150g")],
             steps=["Gătește puiul la grătar sau în tigaie.", "Fierbe orezul (cântărit CRUD înainte).", "Sotează legumele în uleiul de măsline.", "Opțiune perfectă pentru Meal Prep de duminică."],
             tip="Duminică poți găti 3 porții de pui și orez odată pentru Luni-Miercuri.",
             macros=(650, 50, 65, 20)),
        dict(meal="Gustare", title=["BATON PROTEIC", "ȘI CAFEA"], time="⏱ 1 min", diff=1,
             ings=[("Baton Proteic (>20g P)", "1 buc"), ("Cafea neagră", "1 cană")],
             steps=["Salvează situația la ora 16:00 la cabinet.", "Mănâncă-l pe fugă ca să nu faci Binge Eating seara."],
             tip="Dacă ești pe fugă, alege un baton cu minim 20g de proteină și sub 250 kcal.",
             macros=(220, 20, 20, 7)),
        dict(meal="Cină", title=["SOMON LA CUPTOR", "CU OREZ"], time="⏱ 25 min", diff=2,
             ings=[("Somon file (crud)", "220g"), ("Orez (crud)", "100g"), ("Legume verzi", "150g")],
             steps=["Pune somonul la cuptor 20 de minute (sau la airfryer).", "Fierbe orezul (ideal împreună cu cel de la prânz, la grămadă).", "Cea mai relaxantă masă pentru seară."],
             tip="Somonul aduce grăsimi Omega-3 care ajută la recuperarea neuronală după o zi de cabinet.",
             macros=(910, 48, 80, 40))
    ]),
    dict(num=2, theme="Ziua 2", sub="Ouă · Porc · Chili", meals=[
        dict(meal="Mic dejun", title=["OUĂ ȘI", "ALBUȘ LICHID"], time="⏱ 10 min", diff=2,
             ings=[("Ouă întregi", "3 buc"), ("Albuș lichid", "100g"), ("Pâine integrală", "60g"), ("Legume (roșii)", "La discreție")],
             steps=["Fă o omletă mare din cele 3 ouă și albușul lichid (albușul e esențial pt extra proteină fără grăsime).", "Servește cu cele 2 felii de pâine."],
             tip="Albușul lichid la cutie te scapă de aruncat gălbenușuri și îți ridică proteina cu 11g.",
             macros=(430, 35, 30, 18)),
        dict(meal="Prânz", title=["PORC LA CUPTOR", "CU CARTOFI"], time="⏱ 45 min", diff=2,
             ings=[("Cotlet porc slab (crud)", "250g"), ("Cartofi (cruzi)", "350g"), ("Ulei măsline", "10g"), ("Murături", "Din plin")],
             steps=["Condimentează porcul și cartofii.", "Bagă totul la cuptor într-o tavă mare.", "Recomandat să faci porție triplă (Meal Prep)."],
             tip="Cotletul de porc (fără grăsimea albă de pe margine) este la fel de slab ca pieptul de pui.",
             macros=(680, 58, 70, 18)),
        dict(meal="Gustare", title=["IAURT", "CU MĂR"], time="⏱ 1 min", diff=1,
             ings=[("Iaurt grecesc 2%", "200g"), ("Măr", "100g")],
             steps=["Fără explicații. Deschizi și mănânci."],
             tip="Proteină lentă (cazeină) de la iaurt te va ține sătul până la cină.",
             macros=(200, 20, 20, 4)),
        dict(meal="Cină", title=["CHILI CON CARNE", "DE CASĂ"], time="⏱ 30 min", diff=2,
             ings=[("Carne vită slabă (crud)", "200g"), ("Orez (crud)", "80g"), ("Fasole roșie (conservă)", "50g"), ("Suc de roșii", "100ml")],
             steps=["Gătește carnea cu fasolea și sucul de roșii (lasă la scăzut).", "Servește peste patul de orez.", "Se ține la frigider 4 zile perfect."],
             tip="Vită tocată sub 5% grăsime (ideal) ca să putem menține caloriile sub control.",
             macros=(850, 52, 85, 30))
    ]),
    dict(num=3, theme="Ziua 3", sub="Sandwich · Paste · Tradițional", meals=[
        dict(meal="Mic dejun", title=["SANDWICH", "CU CURCAN"], time="⏱ 3 min", diff=1,
             ings=[("Șuncă curcan >80% carne", "100g"), ("Cașcaval light", "50g"), ("Pâine integrală", "60g"), ("Măr", "1 buc")],
             steps=["Pune curcanul și cașcavalul între felii.", "Poți să-l mănânci în mașină."],
             tip="Alege mereu șuncă de curcan care are minim 80% carne pe etichetă.",
             macros=(450, 39, 45, 12)),
        dict(meal="Prânz", title=["PASTE CU VITĂ", "BOLOGNESE"], time="⏱ 20 min", diff=2,
             ings=[("Paste integrale (uscate)", "100g"), ("Carne tocată vită <10%", "150g"), ("Passata roșii", "150ml")],
             steps=["Fierbe pastele. Călește carnea în tigaie și adaugă passata.", "Nu se usucă la frigider dacă iei la pachet a doua zi."],
             tip="Pastele integrale nu îți dau acel 'crash' de energie (somnolență) după masă.",
             macros=(670, 48, 75, 18)),
        dict(meal="Gustare", title=["PUDING", "CU MIGDALE"], time="⏱ 1 min", diff=1,
             ings=[("Puding proteic (Ehrmann/Zuzu)", "200g"), ("Migdale crude", "15g")],
             steps=["Ca un desert anti-stres la ora 16:00."],
             tip="Acest puding rezolvă craving-ul de dulce imediat și are 20g proteină.",
             macros=(250, 23, 15, 10)),
        dict(meal="Cină", title=["CINĂ", "TRADIȚIONALĂ"], time="⏱ 5 min", diff=1,
             ings=[("Ouă ochiuri/fierte", "4 buc"), ("Telemea light", "100g"), ("Pâine integrală", "90g"), ("Roșie mare", "1 buc")],
             steps=["Varianta de panică când ajungi mort de oboseală și vrei ceva cu gust autentic.", "Zero preparare grea."],
             tip="Brânza light e esențială aici. Cea normală are de 3 ori mai multă grăsime.",
             macros=(720, 44, 45, 38))
    ]),
    dict(num=4, theme="Ziua 4", sub="Brânză dulce · Caesar · Airfryer", meals=[
        dict(meal="Mic dejun", title=["BRÂNZĂ DULCE", "CU MIERE"], time="⏱ 2 min", diff=1,
             ings=[("Brânză de vaci slabă", "200g"), ("Miere", "20g"), ("Nuci/migdale", "30g")],
             steps=["Amestecă totul într-un bol. Are gust de prăjitură."],
             tip="Rețeta copilăriei, dar optimizată pe proteină mare.",
             macros=(460, 36, 40, 18)),
        dict(meal="Prânz", title=["SALATĂ CAESAR", "DELIVERY"], time="⏱ 0 min", diff=1,
             ings=[("Salată Caesar (restaurant)", "1 porție"), ("EXTRA Pui grătar", "100g extra"), ("Dressing", "Jumătate din el")],
             steps=["Soluție de salvare la cabinet. CRITIC: Cere extra pui, altfel are doar ~20g proteină.", "Aruncă jumătate din dressing."],
             tip="Dressingul Caesar e bazat pe maioneză/ulei. Dacă arunci jumătate, salvezi 250 kcal.",
             macros=(500, 50, 20, 25)),
        dict(meal="Gustare", title=["SHAKE PROTEIC", "CU LAPTE"], time="⏱ 1 min", diff=1,
             ings=[("Pudră proteică (Whey)", "30g"), ("Lapte 1.5%", "200ml")],
             steps=["Pus în shaker, agitat 10 secunde."],
             tip="Lichid, se digeră rapid, merge perfect înainte sau după antrenament.",
             macros=(200, 30, 12, 3)),
        dict(meal="Cină", title=["PUI CU CARTOFI", "LA AIRFRYER"], time="⏱ 25 min", diff=1,
             ings=[("Piept de pui (crud)", "250g"), ("Cartofi dulci (cruzi)", "400g"), ("Ulei măsline", "15g")],
             steps=["Taie cartofii și puiul, aruncă-le în airfryer (sau la cuptor).", "Volum uriaș de mâncare, sațietate garantată."],
             tip="Airfryer-ul îți dă textură crocantă cu 90% mai puțin ulei decât tigaia.",
             macros=(820, 58, 85, 22))
    ]),
    dict(num=5, theme="Ziua 5", sub="Ovăz · KFC Inteligent · Shaorma", meals=[
        dict(meal="Mic dejun", title=["OVERNIGHT OATS", "CU MĂR"], time="⏱ 3 min", diff=1,
             ings=[("Puding proteic", "200g"), ("Lapte 1.5%", "150ml"), ("Ovăz (crud)", "40g"), ("Măr tăiat", "1 buc")],
             steps=["Se pun la borcan în frigider de seara.", "Dimineața doar iei borcanul și mănânci."],
             tip="Micul dejun care se face singur în timp ce dormi.",
             macros=(470, 32, 60, 8)),
        dict(meal="Prânz", title=["KFC", "INTELIGENT"], time="⏱ 0 min", diff=1,
             ings=[("Crispy Strips KFC", "5 bucăți"), ("Salată Coleslaw mică", "1 buc"), ("Cola Zero", "1 pahar"), ("Cartofi", "FĂRĂ")],
             steps=["Nu iei meniu. Iei produsele individual.", "Strips-urile au carne adevărată. Fără cartofi ai tăiat 400 de calorii inutile."],
             tip="Da, poți mânca KFC dacă știi cum. Cartofii prăjiți și sosurile sunt adevărații inamici, nu puiul.",
             macros=(550, 50, 30, 25)),
        dict(meal="Gustare", title=["RULOURI DE CURCAN", "CU MĂR"], time="⏱ 1 min", diff=1,
             ings=[("Șuncă curcan >80% carne", "100g"), ("Măr", "1 buc")],
             steps=["Mănânci șunca rulată (ca niște sticksuri) alături de măr."],
             tip="Combinația dulce-sărat funcționează perfect pentru creier în a doua parte a zilei.",
             macros=(150, 18, 15, 2)),
        dict(meal="Cină", title=["SHAORMA LA", "FARFURIE"], time="⏱ 0 min", diff=1,
             ings=[("Carne pui porție dublă", "Minim 200g"), ("Salată & Tzatziki", "Din plin"), ("Lipie", "Jumătate (50g)")],
             steps=["Comandă la farfurie.", "CRITIC: Specifică clar fără cartofi. Bazează-te pe carne și salată."],
             tip="Fără cartofi prăjiți, shaorma la farfurie devine o masă arhi-sănătoasă.",
             macros=(700, 55, 45, 30))
    ]),
    dict(num=6, theme="Ziua 6", sub="Shake · Lipie · Burger", meals=[
        dict(meal="Mic dejun", title=["SHAKE", "BLENDER"], time="⏱ 2 min", diff=1,
             ings=[("Whey Protein", "45g (1.5 cupe)"), ("Lapte 1.5%", "250ml"), ("Banană", "120g"), ("Unt arahide", "20g")],
             steps=["Blenduit tot. Ai băut și ai ieșit pe ușă."],
             tip="Bea-l încet (peste 15 minute), altfel senzația de foame revine rapid.",
             macros=(510, 45, 40, 15)),
        dict(meal="Prânz", title=["LIPIE MEGA", "ȘI IAURT"], time="⏱ 0 min", diff=1,
             ings=[("Lipie cu Pui gata făcută", "1 buc mare"), ("Iaurt proteic băubil", "1 sticlă")],
             steps=["Când n-ai apucat nici să comanzi.", "Intri 2 minute într-un Mega/Kaufland."],
             tip="Iaurtul proteic băubil repară lipsa de proteine din wrap-urile de supermarket.",
             macros=(550, 45, 55, 16)),
        dict(meal="Gustare", title=["SKYR", "CU AFINE"], time="⏱ 1 min", diff=1,
             ings=[("Skyr Islandez", "200g"), ("Afine", "1 pumn")],
             steps=["Textură densă, te satură enorm."],
             tip="Skyr-ul e cel mai dens și bogat în proteine derivat lactat de pe piață.",
             macros=(150, 22, 15, 0)),
        dict(meal="Cină", title=["BURGER", "ARTIZANAL"], time="⏱ 0 min", diff=1,
             ings=[("Burger de vită (comandă)", "1 buc"), ("Cartofi", "FĂRĂ"), ("Kefir pe lângă", "1 pahar")],
             steps=["Mănânci burgerul ca atare.", "Pentru că burgerul are de obicei doar ~30g proteină, kefirul suplimentează restul."],
             tip="Bucură-te de carne și chiflă. Cartofii n-au ce căuta aici dacă vrem să slăbim.",
             macros=(750, 40, 50, 40))
    ]),
    dict(num=7, theme="Ziua 7", sub="Kefir · Ton · Pizza", meals=[
        dict(meal="Mic dejun", title=["KEFIR ȘI", "WHEY ÎN SHAKER"], time="⏱ 1 min", diff=1,
             ings=[("Kefir", "330ml"), ("Pudră Whey", "30g (1 cupă)"), ("Migdale", "40g")],
             steps=["Amestecat în shaker, luat în mașină."],
             tip="Super simplu de băut la volan dimineața.",
             macros=(490, 36, 15, 30)),
        dict(meal="Prânz", title=["SALATĂ", "CU TON"], time="⏱ 10 min", diff=1,
             ings=[("Ton în suc propriu", "150g (scurs)"), ("Orez (crud)", "80g"), ("Porumb", "50g"), ("Ulei măsline", "10g")],
             steps=["Fierbi orezul, amesteci totul rece într-un bol.", "Pui ulei de măsline deasupra."],
             tip="Tonul la conservă e cel mai ieftin și eficient hack de proteine.",
             macros=(620, 46, 65, 12)),
        dict(meal="Gustare", title=["PERLE BRÂNZĂ", "ȘI PÂINE"], time="⏱ 1 min", diff=1,
             ings=[("Cottage Cheese (Perle)", "100g"), ("Pâine integrală", "30g")],
             steps=["O gustare mai sărată, înainte de plecare spre casă."],
             tip="Cottage cheese = proteină pură cu calorii foarte puține.",
             macros=(160, 16, 18, 4)),
        dict(meal="Cină", title=["PIZZA ȘI", "SHAKE PROTEIC"], time="⏱ 0 min", diff=1,
             ings=[("Pizza Prosciutto", "3/4 dintr-o pizza medie"), ("Whey Protein", "25g (1 cupă) cu apă")],
             steps=["Mănânci un pic mai puțin din pizza.", "Bei un shake să asiguri proteina (pizza are prea puțină proteină pt tine)."],
             tip="Acoperirea deficitului de proteină dintr-un junk food (cum e pizza) e secretul moderației.",
             macros=(950, 55, 90, 35))
    ])
]

TAG_M = {"Mic dejun":"Dimineața","Gustare":"Între mese","Prânz":"Prânz","Cină":"Seara"}
SLUG  = {"Mic dejun":"micdejun","Gustare":"gustare","Prânz":"pranz","Cină":"cina"}

def esc(s): return str(s).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

PREMIUM_IMAGES = [
    "greek_yogurt_bowl_premium_1778758718649.png",
    "chicken_sweet_potato_editorial_1778758701417.png",
    "protein_fluff_luxury_1778791350579.png",
    "salmon_performance_editorial_1778758645266.png",
    "recipe_omelet_bright_premium_1778756295256.png",
    "steak_asparagus_premium_1778759452913.png",
    "yogurt_mango_parfait_luxury_1778791463934.png",
    "beef_bowl_strength_max_editorial_1778876051531.png",
    "chicken_hummus_wrap_luxury_1778825800473.png",
    "pesto_chicken_pasta_editorial_1778759467266.png",
    "chia_pudding_protein_luxury_1778759482215.png",
    "shakshuka_premium_editorial_1778825694835.png",
    "cottage_cheese_walnuts_premium_1778791238349.png",
    "caesar_salad_luxury_editorial_1778825678568.png",
    "built_muscle_smoothie_luxury_1778759377496.png",
    "turkey_stir_fry_luxury_1778759338351.png",
    "overnight_oats_peanuts_premium_1778791117335.png",
    "beef_burrito_luxury_editorial_1778825627283.png",
    "date_energy_balls_luxury_1778791556040.png",
    "halloumi_quinoa_bowl_premium_1778825755247.png",
    "green_energy_smoothie_vibrant_1778791194541.png",
    "chicken_hummus_wrap_luxury_1778825800473.png",
    "berry_blast_smoothie_vibrant_1778791327344.png",
    "premium_beef_burger_editorial_1778825656454.png",
    "coffee_kick_smoothie_luxury_1778791419068.png",
    "tuna_salad_premium_editorial_1778759324344.png",
    "cottage_pancakes_strength_max_editorial_1778876071396.png",
    "frittata_ciuperci_editorial_1778944102363.png"
]

global_recipe_index = 0

def render_recipe(num, r):
    global global_recipe_index
    k,p,c,f = r["macros"]
    title = "<br>".join(r["title"])
    dish = " ".join(r["title"]).capitalize()
    badge = f"Z{num} · {r['meal'].upper()}"
    dots = "".join('<span class="on"></span>' if i < r["diff"] else '<span></span>' for i in range(3))
    ings = "".join(f'<div class="ing"><span class="ing-n">{esc(n)}</span><span class="ing-q">{esc(q)}</span></div>' for (n,q) in r["ings"])
    steps = "".join(f'<div class="step"><span class="sn">{i+1:02d}</span><div class="st">{esc(s)}</div></div>' for i,s in enumerate(r["steps"]))
    
    img = PREMIUM_IMAGES[global_recipe_index % len(PREMIUM_IMAGES)]
    global_recipe_index += 1
    
    return f'''<div class="page rp">
  <div class="rp-photo">
    <img src="./cookbook-images/{img}" alt="{esc(dish)}" onerror="this.style.display='none';this.parentNode.querySelector('.ph').style.display='flex';">
    <div class="ph" style="display:none;position:absolute;inset:0;background:var(--ink);align-items:center;justify-content:center;flex-direction:column;border:1px solid #333;"><div class="ph-k" style="color:var(--red);font-family:'Bebas Neue';font-size:24px;">BUILT · MÂNCARE REALĂ</div><div class="ph-d" style="color:#666;font-family:'Barlow Condensed';font-size:16px;">Fără poză, dar cu gust 100%</div></div>
    <div class="rp-photo-overlay"></div>
    <div class="rp-badge">{badge}</div>
    <div class="rp-diff">{dots}</div>
  </div>
  <div class="rp-body">
    <div class="rp-head">
      <div class="rp-title">{title}</div>
      <div class="rp-tags"><span class="tag-p">Intelligent Fueling</span><span class="tag-m">{TAG_M[r["meal"]]}</span><span class="tag-t">{esc(r["time"])}</span></div>
    </div>
    <div class="rp-nut">
      <div class="nut cal"><span class="nut-l">Calorii</span><span class="nut-v">{k}</span></div>
      <div class="nut"><span class="nut-l">Proteine</span><span class="nut-v">{p}G</span></div>
      <div class="nut"><span class="nut-l">Carbohidrați</span><span class="nut-v">{c}G</span></div>
      <div class="nut"><span class="nut-l">Grăsimi</span><span class="nut-v">{f}G</span></div>
    </div>
    <div class="rp-content">
      <div><div class="col-h">Ingrediente</div>{ings}</div>
      <div><div class="col-h">Execuție</div>{steps}</div>
    </div>
  </div>
  <div class="rp-tip"><span class="tip-tag">PONT</span><div class="tip-div"></div><div class="tip-txt">{esc(r["tip"])}</div></div>
</div>'''

def render_day(d):
    # Calculate daily totals based on the fixed macros
    tk = sum(r["macros"][0] for r in d["meals"])
    tp = sum(r["macros"][1] for r in d["meals"])
    tc = sum(r["macros"][2] for r in d["meals"])
    tf = sum(r["macros"][3] for r in d["meals"])
    
    t1 = d["theme"]
    t2 = d["sub"]
    head = f'''<div class="page day-header">
  <div class="dh-accent"></div>
  <div class="dh-num">ZIUA {d["num"]:02d}</div>
  <div class="dh-title">{t1}</div>
  <div class="dh-sub" style="font-size:32px;">{esc(t2)}</div>
  <div class="dh-total">
    <div class="dh-t"><span class="dh-t-l">Calorii</span><span class="dh-t-v red">{tk}</span></div>
    <div class="dh-t"><span class="dh-t-l">Prot.</span><span class="dh-t-v">{tp}g</span></div>
    <div class="dh-t"><span class="dh-t-l">Carbi</span><span class="dh-t-v">{tc}g</span></div>
    <div class="dh-t"><span class="dh-t-l">Grăs.</span><span class="dh-t-v">{tf}g</span></div>
  </div>
</div>'''
    recipes = "\n".join(render_recipe(d["num"], r) for r in d["meals"])
    return head + "\n" + recipes

def render_index():
    blocks = ""
    for d in DAYS:
        rows = "".join(f'<div class="idx-row"><span class="idx-tag">{r["meal"]}</span><span class="idx-name">{esc(" ".join(r["title"]).capitalize())}</span></div>' for r in d["meals"])
        blocks += f'<div class="idx-day"><div class="idx-day-h">{d["theme"]} <em>{esc(d["sub"])}</em></div>{rows}</div>\n'
    return f'<div class="page doc-page"><div class="doc-title">CE<br><span>GĂTEȘTI</span></div><div class="idx-cols">{blocks}</div></div>'

COVER = '''<div class="page cover">
  <div class="ph-fill"></div>
  <div class="cover-overlay"></div>
  <div class="cover-content">
    <div class="cover-eyebrow">Intelligent Fueling · Pilonul 3</div>
    <div class="cover-title">CARTEA DE<br><span>REȚETE</span></div>
    <div class="cover-rule"></div>
    <div class="cover-sub">Nelu · 7 zile Mix & Match · 2440 kcal · Mâncare Reală</div>
  </div>
  <div class="cover-bar"></div>
</div>'''

INTRO = '''<div class="page doc-page">
  <div class="doc-title">CUM<br><span>FOLOSEȘTI</span></div>
  <p class="doc-lead">Ai aici <strong>7 variante complete pe zi</strong>, gata calculate. Ești pe principiul Mix & Match. Indiferent ce mic dejun combini cu ce prânz sau cină din carte, <strong>totalul zilei va atinge garantat țintele de mai jos.</strong></p>
  <div class="macro-grid">
    <div class="mg cal"><span class="mg-l">Calorii / zi</span><span class="mg-l">2440</span></div>
    <div class="mg"><span class="mg-l">Proteină</span><span class="mg-v">165<span style="font-size:20px;">g</span></span></div>
    <div class="mg"><span class="mg-l">Carbohidrați</span><span class="mg-v">265<span style="font-size:20px;">g</span></span></div>
    <div class="mg"><span class="mg-l">Grăsimi</span><span class="mg-v">80<span style="font-size:20px;">g</span></span></div>
  </div>
  <div class="rule-h">REGULILE MEAL PREP-ULUI</div>
  <div class="point"><span class="point-n">1</span><div class="point-t"><strong>Batch Cooking Duminica.</strong> Alege UN SINGUR prânz și O SINGURĂ cină pentru Luni, Marți și Miercuri. Fă-le în cantități triple. Așa nu mai stai zilnic în bucătărie.</div></div>
  <div class="point"><span class="point-n">2</span><div class="point-t"><strong>Mini-prep Miercuri seara.</strong> Gătește pentru Joi și Vineri. Aceeași strategie, eficiență maximă.</div></div>
  <div class="point"><span class="point-n">3</span><div class="point-t"><strong>Micul dejun și Gustările = 2 minute.</strong> Sunt gândite să le asamblezi direct, fără gătit termic prelungit (iaurt, ovăz, pudră proteică, batoane, șuncă curcan).</div></div>
  
  <div class="rule-h" style="margin-top:38px;">LISTA DE CUMPĂRĂTURI BAZĂ</div>
  <div style="display:flex; gap: 40px; margin-top:20px;">
    <div style="flex:1;">
      <p style="font-family:'Bebas Neue',sans-serif; color:var(--red); font-size:22px; letter-spacing:1px; margin-bottom:8px;">PROTEINE</p>
      <p style="font-size:16px; color:#444; line-height:1.7;">Piept de pui, Cotlet porc slab, Carne vită slabă, Somon, Ton (conservă), Ouă, Albuș lichid, Șuncă curcan.</p>
    </div>
    <div style="flex:1;">
      <p style="font-family:'Bebas Neue',sans-serif; color:var(--red); font-size:22px; letter-spacing:1px; margin-bottom:8px;">CARBOHIDRAȚI</p>
      <p style="font-size:16px; color:#444; line-height:1.7;">Orez, Cartofi albi/dulci, Paste integrale, Fulgi ovăz, Pâine integrală.</p>
    </div>
  </div>
  <div style="display:flex; gap: 40px; margin-top:20px;">
    <div style="flex:1;">
      <p style="font-family:'Bebas Neue',sans-serif; color:var(--red); font-size:22px; letter-spacing:1px; margin-bottom:8px;">LACTATE & GRĂSIMI</p>
      <p style="font-size:16px; color:#444; line-height:1.7;">Iaurt grecesc 2%, Kefir, Puding Proteic, Brânză vaci slabă, Cașcaval light, Unt de arahide, Migdale/Nuci, Ulei măsline.</p>
    </div>
    <div style="flex:1;">
      <p style="font-family:'Bebas Neue',sans-serif; color:var(--red); font-size:22px; letter-spacing:1px; margin-bottom:8px;">Fructe / Diverse</p>
      <p style="font-size:16px; color:#444; line-height:1.7;">Banane, Mere, Legume, Pudră proteică (Whey), Batoane proteice.</p>
    </div>
  </div>
  <div class="rule-h" style="margin-top:48px; border-bottom: none; color:var(--red);">IMPORTANT: Toate gramajele la carne, orez, cartofi, paste sunt pentru forma lor CRUDĂ (înainte de gătire)!</div>
</div>'''

CLOSING = '''<div class="page day-header">
  <div class="dh-accent"></div>
  <div class="dh-title" style="font-size:92px;">ARHITECTURA<br><span style="color:var(--red);">CORPULUI.</span></div>
  <p class="doc-lead" style="color:rgba(255,255,255,0.7);text-align:center;max-width:520px;margin:30px auto 0;">Ești ocupat, stresat și pe grabă. Mesele astea sunt făcute să îți simplifice viața, nu să ți-o complice. Batch Cooking duminica. Mănânci curat, puternic, fără fâs-fâs-uri fitnessești.</p>
  <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.35);text-transform:uppercase;margin-top:40px;">Arhitectura corpului pe 90 de zile</div>
</div>'''

SOURCE_HTML = os.path.join(os.path.dirname(__file__), "..", "public", "Cartea_Retete_Claudia_v3.html")
try:
    source_content = open(SOURCE_HTML, encoding="utf-8").read()
    HEAD = source_content.split("</head>")[0] + "</head>\n<body>\n"
except Exception as e:
    print("Cannot read SOURCE HTML.")
    exit(1)

days_html = "\n".join(render_day(d) for d in DAYS)
html = HEAD + COVER + "\n" + INTRO + "\n" + render_index() + "\n" + days_html + "\n" + CLOSING + "\n</body></html>"

OUT_FILE = os.path.join(os.path.dirname(__file__), "..", "public", "Cartea_Retete_Nelu.html")

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write(html)
print(f"Scris: {OUT_FILE}")
