import json

days = [
    # Ziua 1
    {
        "m_title": "IAURT GRECESC + WHEY",
        "m_time": "1 min", "m_diff": 1, "m_img": "z1_md.png",
        "m_kcal": "480", "m_pro": "35G",
        "m_ing": [("Iaurt grecesc 2%", "300g"), ("Whey Protein", "15g"), ("Banană", "120g"), ("Unt de arahide", "20g")],
        "m_prep": ["Amestecă iaurtul cu pudra proteică până se omogenizează.", "Adaugă felii de banană și untul de arahide deasupra.", "Rapid și sățios."],

        "p_title": "PUI GRĂTAR + OREZ",
        "p_time": "30 min", "p_diff": 2, "p_img": "z1_p.png",
        "p_kcal": "650", "p_pro": "50G",
        "p_ing": [("Piept de pui (crud)", "200g"), ("Orez (crud)", "80g"), ("Ulei de măsline", "15g"), ("Legume mixte", "150g")],
        "p_prep": ["Gătește puiul la grătar sau în tigaie.", "Fierbe orezul (cântărit CRUD înainte).", "Sotează legumele în uleiul de măsline.", "Opțiune perfectă pentru Meal Prep de duminică."],

        "c_title": "SOMON LA CUPTOR + OREZ",
        "c_time": "25 min", "c_diff": 2, "c_img": "z1_c.png",
        "c_kcal": "910", "c_pro": "48G",
        "c_ing": [("Somon file (crud)", "220g"), ("Orez (crud)", "100g"), ("Legume verzi", "150g")],
        "c_prep": ["Pune somonul la cuptor 20 de minute (sau la airfryer).", "Fierbe orezul (ideal împreună cu cel de la prânz, la grămadă).", "Cea mai relaxantă masă pentru seară."],

        "g_title": "BATON PROTEIC + CAFEA",
        "g_time": "1 min", "g_img": "z1_g.png",
        "g_kcal": "220", "g_pro": "20G",
        "g_ing": [("Baton Proteic (>20g P)", "1 buc"), ("Cafea neagră", "1 cană")],
        "g_prep": ["Salvează situația la ora 16:00 la cabinet.", "Mănâncă-l pe fugă ca să nu faci Binge Eating seara."]
    },
    # Ziua 2
    {
        "m_title": "OUĂ + ALBUȘ LICHID",
        "m_time": "10 min", "m_diff": 2, "m_img": "z2_md.png",
        "m_kcal": "430", "m_pro": "35G",
        "m_ing": [("Ouă întregi", "3 buc"), ("Albuș lichid", "100g"), ("Pâine integrală", "60g"), ("Legume (roșii)", "La discreție")],
        "m_prep": ["Fă o omletă mare din cele 3 ouă și albușul lichid (albușul e esențial pt extra proteină fără grăsime).", "Servește cu cele 2 felii de pâine."],

        "p_title": "PORC LA CUPTOR",
        "p_time": "45 min", "p_diff": 2, "p_img": "z2_p.png",
        "p_kcal": "680", "p_pro": "58G",
        "p_ing": [("Cotlet porc slab (crud)", "250g"), ("Cartofi (cruzi)", "350g"), ("Ulei măsline", "10g"), ("Murături", "Din plin")],
        "p_prep": ["Condimentează porcul și cartofii.", "Bagă totul la cuptor într-o tavă mare.", "Recomandat să faci porție triplă (Meal Prep)."],

        "c_title": "CHILI CON CARNE",
        "c_time": "30 min", "c_diff": 2, "c_img": "z2_c.png",
        "c_kcal": "850", "c_pro": "52G",
        "c_ing": [("Carne vită slabă (crud)", "200g"), ("Orez (crud)", "80g"), ("Fasole roșie (conservă)", "50g"), ("Suc de roșii", "100ml")],
        "c_prep": ["Gătește carnea cu fasolea și sucul de roșii (lasă la scăzut).", "Servește peste patul de orez.", "Se ține la frigider 4 zile perfect."],

        "g_title": "IAURT + MĂR",
        "g_time": "1 min", "g_img": "z2_g.png",
        "g_kcal": "200", "g_pro": "20G",
        "g_ing": [("Iaurt grecesc 2%", "200g"), ("Măr", "100g")],
        "g_prep": ["Fără explicații. Deschizi și mănânci."]
    },
    # Ziua 3
    {
        "m_title": "SANDWICH CURCAN",
        "m_time": "3 min", "m_diff": 1, "m_img": "z3_md.png",
        "m_kcal": "450", "m_pro": "39G",
        "m_ing": [("Șuncă curcan >80% carne", "100g"), ("Cașcaval light", "50g"), ("Pâine integrală", "60g"), ("Măr", "1 buc")],
        "m_prep": ["Pune curcanul și cașcavalul între felii.", "Poți să-l mănânci în mașină."],

        "p_title": "PASTE CU VITĂ",
        "p_time": "20 min", "p_diff": 2, "p_img": "z3_p.png",
        "p_kcal": "670", "p_pro": "48G",
        "p_ing": [("Paste integrale (uscate)", "100g"), ("Carne tocată vită <10% (crudă)", "150g"), ("Passata roșii", "150ml")],
        "p_prep": ["Fierbe pastele. Călește carnea în tigaie și adaugă passata.", "Nu se usucă la frigider dacă iei la pachet a doua zi."],

        "c_title": "CINĂ TRADIȚIONALĂ",
        "c_time": "5 min", "c_diff": 1, "c_img": "z3_c.png",
        "c_kcal": "720", "c_pro": "44G",
        "c_ing": [("Ouă ochiuri/fierte", "4 buc"), ("Telemea light", "100g"), ("Pâine integrală", "90g"), ("Roșie mare", "1 buc")],
        "c_prep": ["Varianta de panică când ajungi mort de oboseală și vrei ceva cu gust autentic.", "Zero preparare grea."],

        "g_title": "PUDING + MIGDALE",
        "g_time": "1 min", "g_img": "z3_g.png",
        "g_kcal": "250", "g_pro": "23G",
        "g_ing": [("Puding proteic", "200g"), ("Migdale crunte", "15g")],
        "g_prep": ["Ca un desert anti-stres la ora 16:00."]
    },
    # Ziua 4
    {
        "m_title": "BRÂNZĂ DULCE + MIERE",
        "m_time": "2 min", "m_diff": 1, "m_img": "z4_md.png",
        "m_kcal": "460", "m_pro": "36G",
        "m_ing": [("Brânză de vaci slabă", "200g"), ("Miere", "20g"), ("Nuci/migdale", "30g")],
        "m_prep": ["Amestecă totul într-un bol. Are gust de prăjitură."],

        "p_title": "SALATĂ CAESAR DELIVERY",
        "p_time": "0 min", "p_diff": 1, "p_img": "z4_p.png",
        "p_kcal": "500", "p_pro": "50G",
        "p_ing": [("Salată Caesar de la restaurant", "1 porție"), ("EXTRA Pui grătar", "100g extra"), ("Dressing", "Jumătate din el")],
        "p_prep": ["Soluție de salvare la cabinet. CRITIC: Cere extra pui, altfel are doar ~20g proteină.", "Aruncă jumătate din dressing (acolo sunt sute de calorii din ulei)."],

        "c_title": "PUI + CARTOFI (AIRFRYER)",
        "c_time": "25 min", "c_diff": 1, "c_img": "z4_c.png",
        "c_kcal": "820", "c_pro": "58G",
        "c_ing": [("Piept de pui (crud)", "250g"), ("Cartofi dulci (cruzi)", "400g"), ("Ulei măsline", "15g")],
        "c_prep": ["Taie cartofii și puiul, aruncă-le în airfryer (sau la cuptor).", "Volum uriaș de mâncare, sațietate garantată."],

        "g_title": "SHAKE CU LAPTE",
        "g_time": "1 min", "g_img": "z4_g.png",
        "g_kcal": "200", "g_pro": "30G",
        "g_ing": [("Pudră proteică (Whey)", "30g"), ("Lapte 1.5%", "200ml")],
        "g_prep": ["Pus în shaker, agitat 10 secunde."]
    },
    # Ziua 5
    {
        "m_title": "OVERNIGHT OATS",
        "m_time": "3 min", "m_diff": 1, "m_img": "z5_md.png",
        "m_kcal": "470", "m_pro": "32G",
        "m_ing": [("Puding proteic (Ehrmann)", "200g"), ("Lapte 1.5%", "150ml"), ("Ovăz (crud)", "40g"), ("Măr tăiat", "1 buc")],
        "m_prep": ["Se pun la borcan în frigider de seara.", "Dimineața doar iei borcanul și mănânci."],

        "p_title": "KFC INTELIGENT",
        "p_time": "0 min", "p_diff": 1, "p_img": "z5_p.png",
        "p_kcal": "550", "p_pro": "50G",
        "p_ing": [("Crispy Strips KFC", "5 bucăți"), ("Salată Coleslaw mică", "1 buc"), ("Cola Zero", "1 pahar"), ("Cartofi", "FĂRĂ")],
        "p_prep": ["Nu iei meniu. Iei produsele individual.", "Strips-urile au carne adevărată. Fără cartofi ai tăiat 400 de calorii inutile."],

        "c_title": "SHAORMA LA FARFURIE",
        "c_time": "0 min", "c_diff": 1, "c_img": "z5_c.png",
        "c_kcal": "700", "c_pro": "55G",
        "c_ing": [("Carne pui porție dublă", "Minim 200g"), ("Salată & Tzatziki", "Din plin"), ("Lipie", "Jumătate (50g)")],
        "c_prep": ["Comandă la farfurie.", "CRITIC: Specifică clar fără cartofi. Bazează-te pe carne și salată."],

        "g_title": "RULOURI CURCAN + MĂR",
        "g_time": "1 min", "g_img": "z5_g.png",
        "g_kcal": "150", "g_pro": "18G",
        "g_ing": [("Șuncă curcan >80% carne", "100g"), ("Măr", "1 buc")],
        "g_prep": ["Mănânci șunca rulată (ca niște sticksuri) alături de măr."]
    },
    # Ziua 6
    {
        "m_title": "SHAKE BLENDER",
        "m_time": "2 min", "m_diff": 1, "m_img": "z6_md.png",
        "m_kcal": "510", "m_pro": "45G",
        "m_ing": [("Whey Protein", "45g (1.5 cupe)"), ("Lapte 1.5%", "250ml"), ("Banană", "120g"), ("Unt arahide", "20g")],
        "m_prep": ["Blenduit tot. Ai băut și ai ieșit pe ușă."],

        "p_title": "LIPIE MEGA + IAURT",
        "p_time": "0 min", "p_diff": 1, "p_img": "z6_p.png",
        "p_kcal": "550", "p_pro": "45G",
        "p_ing": [("Lipie cu Pui gata făcută", "1 buc mare"), ("Iaurt proteic băubil", "1 sticlă")],
        "p_prep": ["Când n-ai apucat nici să comanzi. Intri 2 minute într-un Mega/Kaufland."],

        "c_title": "BURGER ARTIZANAL",
        "c_time": "0 min", "c_diff": 1, "c_img": "z6_c.png",
        "c_kcal": "750", "c_pro": "40G",
        "c_ing": [("Burger de vită (comandă)", "1 buc"), ("Cartofi", "FĂRĂ"), ("Kefir pe lângă", "1 pahar")],
        "c_prep": ["Mănânci burgerul ca atare. Pentru că burgerul are de obicei doar ~30g proteină, kefirul suplimentează restul."],

        "g_title": "SKYR + AFINE",
        "g_time": "1 min", "g_img": "z6_g.png",
        "g_kcal": "150", "g_pro": "22G",
        "g_ing": [("Skyr Islandez", "200g"), ("Afine", "1 pumn")],
        "g_prep": ["Textură densă, te satură enorm."]
    },
    # Ziua 7
    {
        "m_title": "KEFIR + WHEY (SHAKER)",
        "m_time": "1 min", "m_diff": 1, "m_img": "z7_md.png",
        "m_kcal": "490", "m_pro": "36G",
        "m_ing": [("Kefir", "330ml"), ("Pudră Whey", "30g (1 cupă)"), ("Migdale", "40g")],
        "m_prep": ["Amestecat în shaker, luat în mașină."],

        "p_title": "TON + OREZ",
        "p_time": "10 min", "p_diff": 1, "p_img": "z7_p.png",
        "p_kcal": "620", "p_pro": "46G",
        "p_ing": [("Ton în suc propriu", "150g (scurs)"), ("Orez (crud)", "80g"), ("Porumb", "50g"), ("Ulei măsline", "10g")],
        "p_prep": ["Fierbi orezul, amesteci totul rece într-un bol. Pui ulei de măsline deasupra."],

        "c_title": "PIZZA + SHAKE WHEY",
        "c_time": "0 min", "c_diff": 1, "c_img": "z7_c.png",
        "c_kcal": "950", "c_pro": "55G",
        "c_ing": [("Pizza Prosciutto", "3/4 dintr-o pizza medie"), ("Whey Protein", "25g (1 cupă) cu apă")],
        "c_prep": ["Cum mănânci pizza fără să distrugi planul? Simplu: mănânci un pic mai puțin din ea, iar pe lângă bei un shake să asiguri proteina (pizza are prea puțină proteină pt tine)."],

        "g_title": "PERLE BRÂNZĂ + PÂINE",
        "g_time": "1 min", "g_img": "z7_g.png",
        "g_kcal": "160", "g_pro": "16G",
        "g_ing": [("Cottage Cheese (Perle)", "100g"), ("Pâine integrală", "30g")],
        "g_prep": ["O gustare mai sărată, înainte de plecare spre casă."]
    }
]

html_template = """<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>BUILT — Rețete · Nelu</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --blk:#0A0A0A;--drk:#141414;--drk2:#1A1A1A;
  --red:#C0392B;--rdim:rgba(192,57,43,0.12);
  --wht:#F5F5F5;--muted:#777;--brd:#252525;--card:#111;
  --orange:#E67E22;--green:#27AE60;--blue:#2980B9;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:var(--blk);color:var(--wht);font-family:'DM Sans',sans-serif;line-height:1.5;overflow-x:hidden;padding-bottom:120px;}
a{text-decoration:none;color:inherit;cursor:pointer;}
ul{list-style:none;}

/* TYPOGRAPHY */
h1,h2,h3,h4,.bebas{font-family:'Bebas Neue',sans-serif;letter-spacing:0.5px;text-transform:uppercase;font-weight:400;line-height:1.1;}
.mono{font-family:'DM Mono',monospace;}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;background:rgba(10,10,10,0.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:100;border-bottom:1px solid var(--brd);display:flex;align-items:center;justify-content:center;height:60px;}
.nav-logo{color:var(--red);font-size:28px;letter-spacing:1px;}
.nav-logo span{color:var(--wht);}

/* HEADER */
.hero{padding:100px 20px 40px;text-align:center;border-bottom:1px solid var(--brd);background:linear-gradient(180deg,var(--drk2) 0%,var(--blk) 100%);position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:150%;height:100%;background:radial-gradient(circle at top,var(--rdim) 0%,transparent 60%);pointer-events:none;}
.hero-tag{display:inline-block;padding:6px 12px;background:var(--card);border:1px solid var(--brd);border-radius:100px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:20px;font-weight:600;}
.hero-tag span{color:var(--red);}
.hero h1{font-size:56px;margin-bottom:16px;}
.hero p{font-size:16px;color:var(--muted);max-width:400px;margin:0 auto;line-height:1.6;}
.macro-ribbon{display:flex;align-items:center;justify-content:center;gap:15px;margin-top:30px;flex-wrap:wrap;}
.mr-item{display:flex;flex-direction:column;align-items:center;}
.mr-val{font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--wht);line-height:1;}
.mr-lbl{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);font-weight:600;margin-top:4px;}
.mr-div{width:1px;height:24px;background:var(--brd);}

/* FILTER BAR */
.filter-wrap{position:sticky;top:60px;z-index:90;background:var(--blk);border-bottom:1px solid var(--brd);padding:0 20px;}
.filter-scroll{display:flex;gap:10px;overflow-x:auto;padding:15px 0;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.filter-scroll::-webkit-scrollbar{display:none;}
.f-btn{white-space:nowrap;padding:10px 20px;background:var(--card);border:1px solid var(--brd);border-radius:100px;color:var(--muted);font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;transition:all 0.2s;}
.f-btn.active{background:var(--wht);color:var(--blk);border-color:var(--wht);}

/* RECIPE LIST */
.container{padding:20px;max-width:600px;margin:0 auto;}
.day-group{margin-bottom:60px;display:none;animation:fadeIn 0.3s ease forwards;}
.day-group.active{display:block;}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}

.recipe-card{background:var(--card);border:1px solid var(--brd);border-radius:16px;overflow:hidden;margin-bottom:24px;position:relative;}
.rp-img{width:100%;height:220px;background:var(--drk);position:relative;}
.ph-fill{position:absolute;inset:0;background:var(--drk);display:flex;align-items:center;justify-content:center;color:var(--brd);font-size:40px;}
.rp-img img{width:100%;height:100%;object-fit:cover;display:block;position:absolute;inset:0;z-index:1;}
.rp-badge{position:absolute;top:15px;left:15px;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:6px 12px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:1px;color:var(--wht);border:1px solid rgba(255,255,255,0.1);z-index:2;}
.rp-diff{position:absolute;top:15px;right:15px;display:flex;gap:4px;z-index:2;}
.rp-diff span{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2);}
.rp-diff span.on{background:var(--red);}

.rp-body{padding:24px;}
.rp-head{margin-bottom:20px;}
.rp-title{font-family:'Bebas Neue',sans-serif;font-size:26px;line-height:1.1;color:var(--wht);margin-bottom:12px;letter-spacing:0.5px;}
.rp-tags{display:flex;gap:8px;flex-wrap:wrap;}
.rp-tags span{padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;}
.tag-p{background:rgba(230,126,34,0.15);color:var(--orange);}
.tag-time{background:var(--drk2);color:var(--muted);border:1px solid var(--brd);}

.rp-nut{display:flex;gap:8px;margin-bottom:24px;}
.nut{flex:1;background:var(--drk);border:1px solid var(--brd);border-radius:8px;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.nut-l{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);font-weight:600;margin-bottom:4px;}
.nut-v{font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--wht);line-height:1;}
.nut.cal .nut-v{color:var(--red);}

.rp-div{height:1px;background:var(--brd);margin:24px 0;}

.rp-sec{margin-bottom:24px;}
.rp-sec:last-child{margin-bottom:0;}
.sec-title{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
.sec-title::after{content:'';flex:1;height:1px;background:var(--brd);}
.ing-list{list-style:none;}
.ing-list li{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed var(--brd);font-size:14px;color:var(--wht);}
.ing-list li:last-child{border-bottom:none;}
.ing-n{font-weight:500;}
.ing-q{color:var(--muted);font-family:'DM Mono',monospace;font-size:13px;}

.prep-list{list-style:none;counter-reset:prep-counter;}
.prep-list li{position:relative;padding-left:32px;margin-bottom:16px;font-size:14px;color:var(--muted);line-height:1.6;}
.prep-list li::before{counter-increment:prep-counter;content:counter(prep-counter);position:absolute;left:0;top:0;width:20px;height:20px;background:var(--drk);border:1px solid var(--brd);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--wht);}

.alert-box{border-left:3px solid var(--red);background:var(--red-dim);padding:14px;margin-bottom:24px;border-radius:0 6px 6px 0;font-size:13px;color:#ccc;line-height:1.6;}
</style>
</head>
<body>

<nav>
  <div class="nav-logo bebas">BUILT<span>NUTRITION</span></div>
</nav>

<header class="hero">
  <div class="hero-tag">Plan Nutrițional <span>Nelu</span></div>
  <h1 class="bebas">CARTEA DE REȚETE<br>MIX & MATCH</h1>
  <p>Opțiuni rapide, gândite pentru medici și profesioniști fără timp de stat în bucătărie. Zero gătit dimineața, meal prep duminica.</p>
  
  <div class="macro-ribbon">
    <div class="mr-item"><div class="mr-val">2.440</div><div class="mr-lbl">Kcal / Zi</div></div>
    <div class="mr-div"></div>
    <div class="mr-item"><div class="mr-val">165g</div><div class="mr-lbl">Proteină Fixă</div></div>
  </div>
</header>

<div class="filter-wrap">
  <div class="filter-scroll">
    <button class="f-btn active" data-target="z1">Ziua 1</button>
    <button class="f-btn" data-target="z2">Ziua 2</button>
    <button class="f-btn" data-target="z3">Ziua 3</button>
    <button class="f-btn" data-target="z4">Ziua 4</button>
    <button class="f-btn" data-target="z5">Ziua 5</button>
    <button class="f-btn" data-target="z6">Ziua 6</button>
    <button class="f-btn" data-target="z7">Ziua 7</button>
  </div>
</div>

<div class="container">
  
  <div class="alert-box">
    <strong style="color:var(--red);font-family:'Bebas Neue';font-size:16px;letter-spacing:1px;display:block;margin-bottom:4px;">IMPORTANT: CÂNTĂREȘTE PE CRUD</strong>
    Toate gramajele la carne, orez, cartofi sau paste sunt calculate pentru forma lor CRUDĂ (înainte de gătire). Nu le cântări fierte/prăjite, cantitățile se vor schimba masiv!
  </div>

"""

def render_meal(meal_type, label, m):
    prefix = meal_type
    
    title = m[f"{prefix}_title"]
    time = m[f"{prefix}_time"]
    diff = m.get(f"{prefix}_diff", 1)
    img = m[f"{prefix}_img"]
    kcal = m[f"{prefix}_kcal"]
    pro = m[f"{prefix}_pro"]
    ing = m[f"{prefix}_ing"]
    prep = m[f"{prefix}_prep"]
    
    diff_html = "".join(['<span class="on"></span>' if i < diff else '<span></span>' for i in range(3)])

    tag_time = f'<span class="tag-time">⏱ {time}</span>'

    ing_html = "".join([f'<li><span class="ing-n">{n}</span><span class="ing-q">{q}</span></li>' for n, q in ing])
    prep_html = "".join([f'<li>{p}</li>' for p in prep])

    return f"""
<div class="recipe-card">
  <div class="rp-img">
    <div class="ph-fill">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    </div>
    <img src="/cookbook-images/nelu_2400/{img}" alt="{title.replace('<br>',' ')}" onerror="this.style.display='none';this.previousElementSibling.style.display='flex';">
    <div class="rp-badge">{label}</div>
    <div class="rp-diff">{diff_html}</div>
  </div>
  <div class="rp-body">
    <div class="rp-head">
      <div class="rp-title">{title}</div>
      <div class="rp-tags">{tag_time}</div>
    </div>
    <div class="rp-nut">
      <div class="nut cal"><span class="nut-l">Calorii</span><span class="nut-v">{kcal}</span></div>
      <div class="nut"><span class="nut-l">Proteine</span><span class="nut-v">{pro}</span></div>
    </div>
    <div class="rp-div"></div>
    <div class="rp-sec">
      <div class="sec-title">Ingrediente & Cantități</div>
      <ul class="ing-list">
        {ing_html}
      </ul>
    </div>
    <div class="rp-sec">
      <div class="sec-title">Preparare / Explicații</div>
      <ul class="prep-list">
        {prep_html}
      </ul>
    </div>
  </div>
</div>
"""

out = html_template

for i, day in enumerate(days):
    dnum = i + 1
    cls = "day-group active" if dnum == 1 else "day-group"
    out += f'\n<div class="{cls}" id="z{dnum}">\n'
    out += render_meal('m', f"Z{dnum} · MIC DEJUN", day)
    out += render_meal('p', f"Z{dnum} · PRÂNZ", day)
    out += render_meal('g', f"Z{dnum} · GUSTARE", day)
    out += render_meal('c', f"Z{dnum} · CINĂ", day)
    out += '</div>\n'

out += """
</div>

<script>
document.querySelectorAll('.f-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.day-group').forEach(grp => grp.classList.remove('active'));
    const target = document.getElementById(btn.dataset.target);
    if(target) {
      target.classList.add('active');
      window.scrollTo({top:0, behavior:'smooth'});
    }
  });
});
</script>
</body>
</html>
"""

with open("/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center/scripts/Cartea_Retete_Nelu.html", "w", encoding="utf-8") as f:
    f.write(out)

print("Cartea de retete pentru Nelu a fost generata cu succes in Cartea_Retete_Nelu.html")
