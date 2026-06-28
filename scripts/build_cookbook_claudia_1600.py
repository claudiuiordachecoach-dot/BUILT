# -*- coding: utf-8 -*-
"""Generează Cartea de rețete Claudia — 7 zile @ 1600 kcal / 140P / 125C / 60F.
Reutilizează exact CSS-ul + modul carte din fișierul vechi (1800). Rețete NOI.
Macro-urile sunt CALCULATE din ingrediente (food DB per 100g)."""
import os

OLD = os.path.join(os.path.dirname(__file__), "..", "public", "Cartea_Retete_Claudia.html")

# ── FOOD DB: per 100 g → (kcal, P, C, F) ─────────────────────────────
F = {
 "ou":(143,12.6,0.7,9.5), "albus":(52,10.9,0.7,0.2),
 "iaurt2":(73,9.0,3.8,2.0), "iaurt0":(59,10.3,3.6,0.4),
 "branza_vaci":(96,13.5,4.0,3.0),
 "pui":(120,23.0,0,2.6), "curcan":(115,24.0,0,1.5),
 "vita":(187,26.0,0,9.0), "somon":(208,20.0,0,13.0),
 "pastrav":(141,20.5,0,6.0), "peste_alb":(82,18.0,0,0.7),
 "ton":(110,25.0,0,1.0),
 "mamaliga":(85,2.0,18.0,0.6), "orez":(130,2.7,28.0,0.3),
 "cartof":(87,2.0,20.0,0.1), "ovaz":(370,13.0,60.0,7.0),
 "paine_secara":(250,8.0,46.0,1.6), "paine_int":(245,9.0,43.0,3.0),
 "paste_int":(350,13.0,65.0,2.5),
 "nuca":(654,15.0,14.0,65.0), "migdale":(575,21.0,22.0,49.0),
 "unt_arahide":(600,25.0,20.0,50.0), "seminte":(560,20.0,15.0,47.0),
 "avocado":(160,2.0,9.0,15.0), "ulei":(884,0,0,100.0),
 "telemea":(250,17.0,1.0,20.0), "cascaval":(350,25.0,1.5,27.0),
 "sunca":(110,18.0,1.5,3.5),
 "banana":(89,1.1,23.0,0.3), "mar":(52,0.3,14.0,0.2),
 "fructe_padure":(50,1.0,11.0,0.4), "mandarina":(47,0.9,12.0,0.1),
 "miere":(304,0.3,82.0,0), "porumb":(86,3.2,19.0,1.2),
 "legume":(24,1.2,4.5,0.2), "spanac":(23,2.9,3.6,0.4),
 "ciuperci":(22,3.1,3.3,0.3), "rosii":(18,0.9,3.9,0.2),
 "morcov":(41,0.9,9.6,0.2), "castravete":(15,0.7,3.6,0.1),
}

def m(key, grams):
    if key is None: return (0.0,0.0,0.0,0.0)
    k,p,c,f = F[key]
    g = grams/100.0
    return (k*g, p*g, c*g, f*g)

# ── REȚETE ───────────────────────────────────────────────────────────
# ing = (nume_afisat, cantitate_afisata, grame_calcul, food_key)
DAYS = [
 dict(num=1, theme="Clasic și curat", sub="Omletă · pui · cod · orez",
  meals=[
   dict(meal="Mic dejun", title=["OMLETĂ CU SPANAC","ȘI TELEMEA"], time="⏱ 10 min", diff=1,
    ings=[("Ouă","2 buc",110,"ou"),("Albușuri","2 buc",66,"albus"),("Spanac proaspăt","100 g",100,"spanac"),
          ("Telemea","25 g",25,"telemea"),("Pâine de secară","2 felii",60,"paine_secara"),("Sare, piper","după gust",0,None)],
    steps=["Călește spanacul 1 minut în tigaia caldă, fără ulei, doar cât se înmoaie.",
           "Bate ouăle cu albușurile, sare și piper. Toarnă peste spanac.",
           "Sfărâmă telemeaua deasupra și pliază omleta când s-a legat.",
           "Servește cu pâinea de secară prăjită."],
    tip="Spanacul îți dă volum și sațietate pe aproape zero calorii. Pâinea de secară ține sațietatea mai mult decât cea albă."),
   dict(meal="Gustare", title=["IAURT GREC CU","MIGDALE ȘI MANDARINĂ"], time="⏱ 3 min", diff=1,
    ings=[("Iaurt grec 2%","200 g",200,"iaurt2"),("Migdale","18 g",18,"migdale"),("Mandarină","1 buc",90,"mandarina"),("Scorțișoară","un praf",0,None)],
    steps=["Pune iaurtul în bol.","Presară migdalele tăiate și scorțișoara.","Mănâncă mandarina alături."],
    tip="Migdalele se mănâncă încet — grăsimea bună ține foamea departe până la prânz."),
   dict(meal="Prânz", title=["PUI LA TIGAIE","CU OREZ ȘI LEGUME"], time="⏱ 20 min", diff=2,
    ings=[("Piept de pui","170 g",170,"pui"),("Orez fiert","120 g",120,"orez"),("Legume (ardei, dovlecel)","150 g",150,"legume"),
          ("Ulei de măsline","1 linguriță",7,"ulei"),("Usturoi, boia, sare","după gust",0,None)],
    steps=["Taie puiul fâșii și condimentează-l cu boia, usturoi și sare.",
           "Rumenește-l în tigaia cu o linguriță de ulei, 6-7 minute.",
           "Adaugă legumele tăiate și mai lasă 5 minute, să rămână crocante.",
           "Servește peste orezul cald."],
    tip="Gătește orez și pui dublu — ai pachetul de mâine gata, nu mai cazi pe altceva la birou."),
   dict(meal="Cină", title=["COD LA CUPTOR","CU CARTOFI ȘI SALATĂ"], time="⏱ 25 min", diff=2,
    ings=[("File de cod","180 g",180,"peste_alb"),("Cartofi","140 g",140,"cartof"),("Salată verde + roșii","150 g",150,"legume"),
          ("Ulei de măsline","1 lingură",10,"ulei"),("Lămâie, sare, piper","după gust",0,None)],
    steps=["Taie cartofii felii, condimentează și coace-i 20 de minute la 200°C.",
           "Adaugă codul lângă ei, stropit cu lămâie, încă 10-12 minute.",
           "Fă o salată simplă cu o linguriță de ulei și lămâie.",
           "Servește totul cald."],
    tip="Codul e proteină slabă, aproape fără grăsime — perfect seara, când vrei ușor dar sătul."),
  ]),
 dict(num=2, theme="Rapid", sub="Ovăz · curcan · ton · mămăligă",
  meals=[
   dict(meal="Mic dejun", title=["OVĂZ CU IAURT,","BANANĂ ȘI ARAHIDE"], time="⏱ 5 min", diff=1,
    ings=[("Fulgi de ovăz","45 g",45,"ovaz"),("Iaurt grec 2%","160 g",160,"iaurt2"),("Banană","1/2 buc",60,"banana"),
          ("Unt de arahide","15 g",15,"unt_arahide"),("Scorțișoară","un praf",0,None)],
    steps=["Lasă ovăzul 5 minute în iaurt (sau peste noapte la frigider).",
           "Taie banana felii deasupra.","Adaugă untul de arahide și scorțișoara."],
    tip="Fă-l seara, în borcan — dimineața doar îl scoți. Zero gătit, zero scuze."),
   dict(meal="Gustare", title=["BRÂNZĂ DE VACI CU","CASTRAVETE ȘI PÂINE"], time="⏱ 4 min", diff=1,
    ings=[("Brânză de vaci","180 g",180,"branza_vaci"),("Castravete","100 g",100,"castravete"),
          ("Semințe","10 g",10,"seminte"),("Pâine de secară","1 felie",30,"paine_secara"),("Mărar, sare","după gust",0,None)],
    steps=["Amestecă brânza cu mărar și un praf de sare.","Taie castravetele cuburi și pune-l deasupra.","Presară semințele și mănâncă cu pâinea de secară."],
    tip="Brânza de vaci e bomba de proteină ieftină — te ține sătulă două ore pe nimic."),
   dict(meal="Prânz", title=["CURCAN CU MĂMĂLIGĂ","ȘI ARDEI COPT"], time="⏱ 20 min", diff=2,
    ings=[("Piept de curcan","165 g",165,"curcan"),("Mămăligă caldă","170 g",170,"mamaliga"),("Ardei copt","120 g",120,"legume"),
          ("Ulei de măsline","1 lingură",8,"ulei"),("Usturoi, cimbru, sare","după gust",0,None)],
    steps=["Condimentează curcanul și gătește-l la tigaie 7-8 minute pe fiecare parte.",
           "Coace ardeii sau folosește-i din borcan, curățați de pieliță.",
           "Servește lângă mămăliga caldă."],
    tip="Curcanul e și mai slab ca puiul. Ardeiul copt aduce gust fără să adauge nimic greu."),
   dict(meal="Cină", title=["SALATĂ MARE CU TON,","OU ȘI PORUMB"], time="⏱ 10 min", diff=1,
    ings=[("Ton în suc propriu","1 cutie",120,"ton"),("Ou fiert","1 buc",55,"ou"),("Porumb","60 g",60,"porumb"),
          ("Salată + roșii + castravete","200 g",200,"legume"),("Ulei de măsline","1 lingură",10,"ulei"),("Lămâie, sare","după gust",0,None)],
    steps=["Scurge tonul bine.","Taie toate legumele și amestecă-le într-un bol mare.",
           "Adaugă tonul, oul tăiat și porumbul.","Dressing: o linguriță de ulei și lămâie."],
    tip="O salată sătulă, nu una de frunze triste. Tonul și oul îți dau proteina, porumbul gustul."),
  ]),
 dict(num=3, theme="De casă", sub="Jumări · tocăniță · brânză de vaci",
  meals=[
   dict(meal="Mic dejun", title=["JUMĂRI CU CIUPERCI","ȘI CAȘCAVAL"], time="⏱ 10 min", diff=1,
    ings=[("Ouă","2 buc",110,"ou"),("Albușuri","2 buc",66,"albus"),("Ciuperci","100 g",100,"ciuperci"),
          ("Cașcaval","22 g",22,"cascaval"),("Pâine integrală","2 felii",60,"paine_int"),("Sare, piper","după gust",0,None)],
    steps=["Călește ciupercile feliate până lasă apa și se rumenesc ușor.",
           "Bate ouăle cu albușurile, toarnă peste ciuperci și amestecă.",
           "Dă cașcavalul ras deasupra cât e cald.","Servește cu pâinea prăjită."],
    tip="Ciupercile aduc volum și gust de mâncare gătită, nu de dietă."),
   dict(meal="Gustare", title=["IAURT GREC CU FRUCTE","DE PĂDURE ȘI SEMINȚE"], time="⏱ 3 min", diff=1,
    ings=[("Iaurt grec 2%","220 g",220,"iaurt2"),("Fructe de pădure","80 g",80,"fructe_padure"),("Semințe","10 g",10,"seminte")],
    steps=["Pune iaurtul în bol.","Adaugă fructele de pădure (merg și congelate, dezghețate).","Presară semințele deasupra."],
    tip="Fructele de pădure au cele mai puține calorii dintre fructe — multă culoare, puțin zahăr."),
   dict(meal="Prânz", title=["TOCĂNIȚĂ DE PUI","CU CARTOF ȘI MORCOV"], time="⏱ 30 min", diff=2,
    ings=[("Piept de pui","170 g",170,"pui"),("Cartofi","140 g",140,"cartof"),("Morcov","80 g",80,"morcov"),
          ("Roșii pasate","100 g",100,"rosii"),("Ceapă","50 g",50,"legume"),("Ulei de măsline","1 linguriță",5,"ulei"),("Foi dafin, sare","după gust",0,None)],
    steps=["Călește ceapa tăiată mărunt în linguriță de ulei.",
           "Adaugă puiul cuburi și rumenește-l 5 minute.",
           "Pune cartoful, morcovul și roșiile pasate, plus puțină apă.",
           "Fierbe acoperit 20 de minute, până se leagă sosul."],
    tip="O oală de tocăniță îți ține 2-3 mese. Mâncare de casă, pusă în porția corectă."),
   dict(meal="Cină", title=["BRÂNZĂ DE VACI CU","LEGUME ȘI NUCĂ"], time="⏱ 7 min", diff=1,
    ings=[("Brânză de vaci","210 g",210,"branza_vaci"),("Roșii + ardei","150 g",150,"legume"),
          ("Miez de nucă","12 g",12,"nuca"),("Pâine de secară","1 felie",30,"paine_secara"),("Sare, mărar","după gust",0,None)],
    steps=["Pune brânza în bol și asezoneaz-o cu sare și mărar.","Taie legumele cuburi alături.","Presară nuca sfărâmată și mănâncă cu pâinea."],
    tip="O cină rece, fără gătit, când vii obosită seara. Proteina taie pofta de ronțăit târziu."),
  ]),
 dict(num=4, theme="Săturos", sub="Clătite · vită · pește alb",
  meals=[
   dict(meal="Mic dejun", title=["CLĂTITE PROTEICE","CU FRUCTE"], time="⏱ 12 min", diff=2,
    ings=[("Ouă","2 buc",110,"ou"),("Fulgi de ovăz","30 g",30,"ovaz"),("Brânză de vaci","100 g",100,"branza_vaci"),
          ("Fructe de pădure","80 g",80,"fructe_padure"),("Scorțișoară","un praf",0,None)],
    steps=["Mixează ouăle, ovăzul și brânza până faci un aluat fin.",
           "Toarnă porții mici în tigaia neaderentă, la foc mediu.",
           "Coace 1-2 minute pe fiecare parte.","Servește cu fructele deasupra."],
    tip="Clătite fără făină și fără zahăr, dar care chiar țin de foame. Plăcere, nu abatere."),
   dict(meal="Gustare", title=["OU FIERT, TELEMEA","ȘI MĂR"], time="⏱ 2 min", diff=1,
    ings=[("Ouă fierte","2 buc",110,"ou"),("Telemea","30 g",30,"telemea"),("Măr","1 buc",150,"mar")],
    steps=["Fierbe ouăle tare (10 minute).","Taie telemeaua cubulețe.","Mănâncă mărul alături."],
    tip="Cea mai simplă gustare cu proteină — o duci în geantă oriunde."),
   dict(meal="Prânz", title=["VITĂ SLABĂ ÎNĂBUȘITĂ","CU OREZ"], time="⏱ 35 min", diff=2,
    ings=[("Vită slabă","150 g",150,"vita"),("Orez fiert","110 g",110,"orez"),("Legume (ceapă, ardei, roșii)","150 g",150,"legume"),
          ("Ulei de măsline","1 linguriță",5,"ulei"),("Cimbru, usturoi, sare","după gust",0,None)],
    steps=["Rumenește carnea cuburi în lingurița de ulei.",
           "Adaugă legumele tăiate și puțină apă.",
           "Înăbușă acoperit 25-30 de minute, până se frăgezește carnea.",
           "Servește peste orezul cald."],
    tip="Vita slabă o dată pe săptămână îți dă fier și sațietate lungă. Porția e cu cap."),
   dict(meal="Cină", title=["PEȘTE ALB CU DOVLECEL","ȘI MĂMĂLIGĂ"], time="⏱ 20 min", diff=2,
    ings=[("File de pește alb","190 g",190,"peste_alb"),("Mămăligă caldă","150 g",150,"mamaliga"),("Dovlecel","150 g",150,"legume"),
          ("Ulei de măsline","1 linguriță",5,"ulei"),("Lămâie, usturoi, sare","după gust",0,None)],
    steps=["Taie dovlecelul felii și coace-l 10 minute la 200°C.",
           "Adaugă peștele stropit cu lămâie, încă 10 minute.",
           "Servește lângă mămăliga caldă."],
    tip="Peștele alb seara e ușor de digerat — dormi mai bine decât după o cină grea."),
  ]),
 dict(num=5, theme="Tradițional", sub="Omletă · ciorbă de pui · curcan",
  meals=[
   dict(meal="Mic dejun", title=["OMLETĂ CU ȘUNCĂ","SLABĂ ȘI ROȘII"], time="⏱ 8 min", diff=1,
    ings=[("Ouă","2 buc",110,"ou"),("Albușuri","2 buc",66,"albus"),("Șuncă slabă de curcan","40 g",40,"sunca"),
          ("Cașcaval","15 g",15,"cascaval"),("Roșii","120 g",120,"rosii"),("Mămăligă caldă","120 g",120,"mamaliga"),("Sare, piper","după gust",0,None)],
    steps=["Rumenește șunca tăiată fâșii în tigaia uscată.",
           "Bate ouăle cu albușurile și toarnă peste șuncă.",
           "Adaugă roșiile cuburi și cașcavalul ras, lasă să se lege omleta.","Servește cu mămăliga caldă."],
    tip="Șunca de curcan e slabă, nu grasă ca salamul. Gust de mic dejun adevărat, fără greutate."),
   dict(meal="Gustare", title=["IAURT GREC CU","NUCĂ ȘI MIERE"], time="⏱ 3 min", diff=1,
    ings=[("Iaurt grec 2%","200 g",200,"iaurt2"),("Miez de nucă","20 g",20,"nuca"),("Miere","1 linguriță",10,"miere")],
    steps=["Pune iaurtul în bol.","Adaugă nuca sfărâmată.","Toarnă o linguriță de miere deasupra."],
    tip="Lingurița de miere e plăcerea planificată — nu o tai, o pui cu cap."),
   dict(meal="Prânz", title=["CIORBĂ DE PUI","CONSISTENTĂ CU PÂINE"], time="⏱ 35 min", diff=2,
    ings=[("Piept de pui","140 g",140,"pui"),("Legume de ciorbă (morcov, ardei, ceapă)","200 g",200,"legume"),
          ("Cartof","80 g",80,"cartof"),("Ulei de măsline","1 linguriță",5,"ulei"),("Pâine de secară","1 felie",30,"paine_secara"),("Leuștean, sare, lămâie","după gust",0,None)],
    steps=["Călește ușor legumele în lingurița de ulei, apoi pune apa și puiul.",
           "Fierbe puiul, spumează, adaugă cartoful și fierbe 20 de minute.",
           "Acrește cu lămâie sau borș și pune leușteanul la final.",
           "Servește cu o felie de pâine."],
    tip="O ciorbă cu carne te umple pe puține calorii. Lichidul cald taie pofta de mâncat mult."),
   dict(meal="Cină", title=["CURCAN CU PIURE","UȘOR ȘI SALATĂ"], time="⏱ 25 min", diff=2,
    ings=[("Piept de curcan","150 g",150,"curcan"),("Cartofi pentru piure","140 g",140,"cartof"),("Iaurt grec 2%","30 g",30,"iaurt2"),
          ("Salată verde + castravete","150 g",150,"legume"),("Ulei de măsline","1 lingură",8,"ulei"),("Sare, piper","după gust",0,None)],
    steps=["Fierbe cartofii și pasează-i cu iaurt grec în loc de unt — cremos, dar ușor.",
           "Gătește curcanul la tigaie 7-8 minute pe parte.",
           "Servește cu piureul și o salată simplă."],
    tip="Piureul cu iaurt grec, nu cu unt și lapte, taie jumătate din grăsime și adaugă proteină."),
  ]),
 dict(num=6, theme="Variat", sub="Iaurt · pui la grătar · somon",
  meals=[
   dict(meal="Mic dejun", title=["IAURT GREC CU OVĂZ,","MĂR ȘI SCORȚIȘOARĂ"], time="⏱ 5 min", diff=1,
    ings=[("Iaurt grec 0%","250 g",250,"iaurt0"),("Fulgi de ovăz","45 g",45,"ovaz"),("Măr","1 buc",150,"mar"),("Scorțișoară","un praf",0,None)],
    steps=["Amestecă iaurtul cu ovăzul.","Taie mărul cuburi deasupra.","Presară scorțișoară."],
    tip="Iaurtul 0% îți lasă loc de grăsime la cină (somonul). Așa echilibrezi ziua, nu o strici."),
   dict(meal="Gustare", title=["TELEMEA CU ROȘII","ȘI UN OU"], time="⏱ 5 min", diff=1,
    ings=[("Telemea","40 g",40,"telemea"),("Ouă fierte","2 buc",110,"ou"),("Roșii","150 g",150,"rosii"),("Busuioc, sare","după gust",0,None)],
    steps=["Taie roșiile felii și telemeaua cubulețe.","Adaugă ouăle fierte tăiate.","Un strop de busuioc deasupra."],
    tip="Gustarea asta e mai săracă în carbo — exact ce-ți trebuie înainte de o cină cu somon."),
   dict(meal="Prânz", title=["PUI LA GRĂTAR CU","CARTOF COPT ȘI SALATĂ"], time="⏱ 20 min", diff=1,
    ings=[("Piept de pui","200 g",200,"pui"),("Cartof copt","180 g",180,"cartof"),("Salată verde + roșii","150 g",150,"legume"),
          ("Ulei de măsline","1 linguriță",5,"ulei"),("Boia, usturoi, sare","după gust",0,None)],
    steps=["Condimentează puiul și fă-l la grătar sau tigaie-grill, 6-7 minute pe parte.",
           "Coace cartoful întreg în coajă, 40 de minute (sau felii, 25).",
           "Salată simplă cu o linguriță de ulei alături."],
    tip="Cartoful copt în coajă e mai sătul decât piureul și nu cere unt."),
   dict(meal="Cină", title=["SOMON CU AVOCADO","ȘI LEGUME LA CUPTOR"], time="⏱ 20 min", diff=2,
    ings=[("File de somon","130 g",130,"somon"),("Avocado","1/3 buc",50,"avocado"),("Legume (broccoli, ardei)","180 g",180,"legume"),
          ("Lămâie, usturoi, sare","după gust",0,None)],
    steps=["Coace legumele 15 minute la 200°C.",
           "Adaugă somonul stropit cu lămâie, încă 10-12 minute.",
           "Servește cu feliile de avocado proaspăt."],
    tip="Somonul are grăsime bună (omega-3). De-aia restul zilei a fost mai slab — ca să-i faci loc."),
  ]),
 dict(num=7, theme="De weekend", sub="Ouă jumări · paste cu pui · smoothie",
  meals=[
   dict(meal="Mic dejun", title=["OUĂ JUMĂRI CU AVOCADO","ȘI ȘUNCĂ"], time="⏱ 10 min", diff=1,
    ings=[("Ouă","2 buc",110,"ou"),("Albușuri","2 buc",66,"albus"),("Avocado","1/3 buc",50,"avocado"),
          ("Șuncă slabă de curcan","30 g",30,"sunca"),("Pâine integrală","2 felii",60,"paine_int"),("Sare, piper","după gust",0,None)],
    steps=["Rumenește șunca în tigaia uscată.","Adaugă ouăle bătute cu albușul și fă-le jumări cremoase.",
           "Servește cu avocado feliat și pâinea prăjită."],
    tip="Mic dejun de weekend, fără grabă. Avocado în loc de unt — grăsime bună, nu goală."),
   dict(meal="Gustare", title=["SMOOTHIE CU IAURT","ȘI FRUCTE DE PĂDURE"], time="⏱ 4 min", diff=1,
    ings=[("Iaurt grec 2%","180 g",180,"iaurt2"),("Fructe de pădure","100 g",100,"fructe_padure"),("Banană","1/2 buc",60,"banana"),("Apă sau lapte","100 ml",0,None)],
    steps=["Pune toate în blender.","Mixează 30 de secunde până e cremos.","Bea imediat, rece."],
    tip="Smoothie-ul e gustare, nu desert lichid: iaurt grec pentru proteină, fruct pentru gust, fără zahăr adăugat."),
   dict(meal="Prânz", title=["PASTE INTEGRALE","CU PUI ȘI ROȘII"], time="⏱ 20 min", diff=2,
    ings=[("Paste integrale (uscate)","65 g",65,"paste_int"),("Piept de pui","160 g",160,"pui"),("Roșii pasate","120 g",120,"rosii"),
          ("Parmezan","10 g",10,"cascaval"),("Usturoi, busuioc, sare","după gust",0,None)],
    steps=["Fierbe pastele al dente, după instrucțiuni.",
           "Rumenește puiul cuburi, adaugă roșiile pasate și usturoiul.",
           "Amestecă pastele scurse cu sosul.","Parmezan ras deasupra."],
    tip="Pastele integrale au mai multe fibre — sațietate mai lungă decât cele albe, la aceeași porție."),
   dict(meal="Cină", title=["BRÂNZĂ DE VACI LA","CUPTOR CU LEGUME"], time="⏱ 18 min", diff=1,
    ings=[("Brânză de vaci","210 g",210,"branza_vaci"),("Ou","1 buc",55,"ou"),("Legume (ardei, roșii, spanac)","180 g",180,"legume"),
          ("Cașcaval","20 g",20,"cascaval"),("Sare, piper","după gust",0,None)],
    steps=["Amestecă brânza cu oul și legumele tăiate.",
           "Toarnă în tavă, presară cașcaval și coace 15 minute la 190°C.",
           "Lasă 2 minute și servește cald."],
    tip="Un fel de budincă sărată, caldă și sătulă, cu care închizi ziua liniștită."),
  ]),
]

# ── CALCUL MACRO ─────────────────────────────────────────────────────
def recipe_macros(r):
    tk=tp=tc=tf=0.0
    for (_,_,g,key) in r["ings"]:
        k,p,c,f=m(key,g); tk+=k; tp+=p; tc+=c; tf+=f
    return tk,tp,tc,tf

# ciocolata neagra de seara (planificată) — o adăugăm la totalul zilei
CHOC = (60,1.0,3.0,5.0)  # 10 g ciocolată 85%

print("VERIFICARE MACRO PER ZI (țintă 1600 / 140 / 125 / 60, + pătrat ciocolată seara)")
for d in DAYS:
    dk=dp=dc=df=0.0
    for r in d["meals"]:
        k,p,c,f=recipe_macros(r)
        r["_macros"]=(round(k),round(p),round(c),round(f))
        dk+=k; dp+=p; dc+=c; df+=f
    dk+=CHOC[0]; dp+=CHOC[1]; dc+=CHOC[2]; df+=CHOC[3]
    d["_total"]=(round(dk),round(dp),round(dc),round(df))
    print(f"  Ziua {d['num']} {d['theme']:<16} {round(dk):>4} kcal · {round(dp):>3}P · {round(dc):>3}C · {round(df):>2}F")

# ── RANDARE HTML (reutilizează head + mod carte din fișierul vechi) ──
TAG_M = {"Mic dejun":"Dimineața","Gustare":"Între mese","Prânz":"Prânz","Cină":"Seara"}
SLUG  = {"Mic dejun":"micdejun","Gustare":"gustare","Prânz":"pranz","Cină":"cina"}
PHOTO_MANIFEST = []  # (fisier, zi, masa, fel)

def esc(s): return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

def render_recipe(num, r):
    k,p,c,f = r["_macros"]
    title = "<br>".join(r["title"])
    dish = " ".join(r["title"]).capitalize()
    badge = f"Z{num} · {r['meal'].upper()}"
    dots = "".join('<span class="on"></span>' if i < r["diff"] else '<span></span>' for i in range(3))
    ings = "".join(f'<div class="ing"><span class="ing-n">{esc(n)}</span><span class="ing-q">{esc(q)}</span></div>' for (n,q,_,_) in r["ings"])
    steps = "".join(f'<div class="step"><span class="sn">{i+1:02d}</span><div class="st">{esc(s)}</div></div>' for i,s in enumerate(r["steps"]))
    img = f"z{num}_{SLUG[r['meal']]}.png"
    PHOTO_MANIFEST.append((img, num, r["meal"], dish))
    onerr = "this.style.display='none';this.parentNode.querySelector('.ph').style.display='flex';"
    return f'''<div class="page rp">
  <div class="rp-photo">
    <img src="./cookbook-images/claudia/{img}" alt="{esc(dish)}" onerror="{onerr}">
    <div class="ph" style="display:none"><div class="ph-k">BUILT · Intelligent Fueling</div><div class="ph-d">{esc(dish)}</div></div>
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
    tk,tp,tc,tf = d["_total"]
    t1 = d["theme"].split()[0].upper(); t2 = " ".join(d["theme"].split()[1:]).upper() or "&nbsp;"
    head = f'''<div class="page day-header">
  <div class="dh-accent"></div>
  <div class="dh-num">Ziua {d["num"]:02d}</div>
  <div class="dh-title">{t1}<br>{t2}</div>
  <div class="dh-sub">{esc(d["sub"])}</div>
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
        blocks += f'<div class="idx-day"><div class="idx-day-h">Ziua {d["num"]} <em>{esc(d["theme"])}</em></div>{rows}</div>\n'
    return f'<div class="page doc-page"><div class="doc-title">CE<br><span>GĂTEȘTI</span></div><div class="idx-cols">{blocks}</div></div>'

COVER = '''<div class="page cover">
  <img src="./cookbook-images/claudia/cover_cookbook_claudia_1781814665731.png" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">
  <div class="cover-overlay"></div>
  <div class="cover-content">
    <div class="cover-eyebrow">Intelligent Fueling · Pilonul 3</div>
    <div class="cover-title">CARTEA DE<br><span>REȚETE</span></div>
    <div class="cover-rule"></div>
    <div class="cover-sub">Claudia · 7 zile · 1600 kcal · mâncare reală</div>
  </div>
  <div class="cover-bar"></div>
</div>'''

INTRO = '''<div class="page doc-page">
  <div class="doc-title">CUM<br><span>FOLOSEȘTI</span></div>
  <p class="doc-lead">Ai aici <strong>7 zile complete</strong>, gata calculate pe noile tale valori. Nu trebuie să treci nimic în nicio aplicație și nu trebuie să cântărești la gram — ai porțiile scrise pentru tine. Alegi ziua care îți place, gătești, mănânci. <strong>Indiferent ce zi alegi, totalul iese la circa 1600 kcal.</strong></p>
  <div class="macro-grid">
    <div class="mg cal"><span class="mg-l">Calorii / zi</span><span class="mg-v">1600</span></div>
    <div class="mg"><span class="mg-l">Proteină</span><span class="mg-v">140<span style="font-size:20px;">g</span></span></div>
    <div class="mg"><span class="mg-l">Carbohidrați</span><span class="mg-v">125<span style="font-size:20px;">g</span></span></div>
    <div class="mg"><span class="mg-l">Grăsimi</span><span class="mg-v">60<span style="font-size:20px;">g</span></span></div>
  </div>
  <div class="rule-h">REGULILE CĂRȚII</div>
  <div class="point"><span class="point-n">1</span><div class="point-t"><strong>Mesele se pot schimba între zile.</strong> Orice mic dejun merge cu orice prânz și orice cină din carte — toate sunt făcute pe aceleași valori. Dacă îți place micul dejun din Ziua 2, dar prânzul din Ziua 5, le combini liniștită. Ziua tot la 1600 iese.</div></div>
  <div class="point"><span class="point-n">2</span><div class="point-t"><strong>Proteină la fiecare masă.</strong> Asta ține foamea departe și taie pofta de dulce de seara. E firul care leagă toate rețetele — de-aia ajungi la 140 g fără să te chinui.</div></div>
  <div class="point"><span class="point-n">3</span><div class="point-t"><strong>Pătratul de ciocolată neagră (10 g, 85%) e în plan, în fiecare seară.</strong> E deja socotit în totalul zilei. Nu e o abatere, e plăcerea ta planificată. Îl mănânci după cină, încet.</div></div>
  <div class="point"><span class="point-n">4</span><div class="point-t"><strong>Nimic nu e interzis.</strong> Ai și mămăligă, și paste, și brânză. Sunt puse cu cap, în porția potrivită. Asta nu e dietă — e mâncare normală, așezată corect pe 1600.</div></div>
  <div class="point"><span class="point-n">5</span><div class="point-t"><strong>Gătești o dată, mănânci de mai multe ori.</strong> Puiul, mămăliga, ciorba — le faci în porții mai mari și ai pentru pachetul de la muncă. Ce e pregătit seara nu te lasă să cazi pe altceva dimineața.</div></div>
  <div class="point"><span class="point-n">6</span><div class="point-t"><strong>În zilele de antrenament</strong>, adaugă banana de dinainte de sală (din ghidul tău de nutriție). E energie pentru efort, nu un plus de care să te ferești.</div></div>
  <div class="rule-h" style="margin-top:38px;">DE REȚINUT</div>
  <p class="doc-lead" style="margin-bottom:0;">Porțiile sunt scrise pentru tine, la noua ta țintă. Dacă într-o zi mănânci puțin mai mult sau mai puțin, nu e nicio dramă — te întorci la masa următoare, nu „de luni". <strong>80% structură, 20% plăcere.</strong> Asta o duci toată viața.</p>
</div>'''

CLOSING = '''<div class="page day-header">
  <div class="dh-accent"></div>
  <div class="dh-title" style="font-size:92px;">ASTA NU E<br><span style="color:var(--red);">O DIETĂ.</span></div>
  <p class="doc-lead" style="color:rgba(255,255,255,0.7);text-align:center;max-width:520px;margin:30px auto 0;">E felul în care mănânci de acum încolo. 1600 de calorii care chiar te satură, pentru că au proteină la fiecare masă și nimic interzis. Asta nu e o pedeapsă de 3 luni — e sistemul tău.</p>
  <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.35);text-transform:uppercase;margin-top:40px;">Arhitectura corpului pe 90 de zile</div>
</div>'''

old = open(OLD, encoding="utf-8").read()
HEAD = old.split("</head>")[0] + "</head>\n<body>\n"
NAV = "<!-- ─── NAVIGARE CARTE ─── -->" + old.split("<!-- ─── NAVIGARE CARTE ─── -->")[1]

days_html = "\n".join(render_day(d) for d in DAYS)
html = HEAD + COVER + "\n" + INTRO + "\n" + render_index() + "\n" + days_html + "\n" + CLOSING + "\n" + NAV
# titlu pagina → 1600
html = html.replace("Cartea de rețete · Claudia · 1800 kcal", "Cartea de rețete · Claudia · 1600 kcal")

OUT1 = os.path.join(os.path.dirname(__file__), "..", "public", "Cartea_Retete_Claudia.html")
OUT2 = os.path.join(os.path.dirname(__file__), "..", "..", "CLIENTS", "Claudia David", "Cartea_Retete_Claudia.html")
# backup vechi
import shutil
shutil.copy(OUT1, OUT1.replace(".html", "_1800_OLD.html"))
for o in (OUT1, OUT2):
    open(o, "w", encoding="utf-8").write(html)
    print("scris:", os.path.relpath(o))
print(f"pagini: {html.count('class=\"page')} · rețete: {html.count('class=\"page rp\"')}")

# ── BRIEF GEMINI: lista de poze de generat ──────────────────────────
img_dir = os.path.join(os.path.dirname(__file__), "..", "public", "cookbook-images", "claudia")
brief = ["# Poze carte de rețete Claudia — pentru Gemini\n",
 "Generează 28 de fotografii de mâncare și pune-le în ACEST folder cu EXACT numele din coloana fișier.",
 "Cartea le încarcă automat (acum afișează un placeholder; când apare fișierul, devine poză).\n",
 "**Stil unitar (același pentru toate):** fotografie de mâncare reală, de sus sau ușor lateral, lumină naturală,",
 "farfurie/bol simplu pe fundal închis (lemn închis / piatră gri-negru), apetisant dar curat, fără text, fără mâini.",
 "Format pătrat sau peisaj, minim 1200px lățime. Mâncare românească reală, porții normale.\n",
 "| fișier | zi | masă | felul |", "|---|---|---|---|"]
for (img, num, meal, dish) in PHOTO_MANIFEST:
    brief.append(f"| `{img}` | {num} | {meal} | {dish} |")
brief.append("\nDupă ce pui pozele în folder, dă-mi de știre — verific că se încarcă și fac deploy.")
open(os.path.join(img_dir, "_GEMINI_POZE.md"), "w", encoding="utf-8").write("\n".join(brief))
print(f"\nmanifest poze: public/cookbook-images/claudia/_GEMINI_POZE.md ({len(PHOTO_MANIFEST)} poze)")
print("primele:", ", ".join(x[0] for x in PHOTO_MANIFEST[:4]), "...")
