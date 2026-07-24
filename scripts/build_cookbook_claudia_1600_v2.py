# -*- coding: utf-8 -*-
import os

OLD = os.path.join(os.path.dirname(__file__), "..", "public", "Cartea_Retete_Claudia.html")

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
 "slanina":(800,2.0,0.0,85.0), "kefir":(60,3.5,4.0,3.0),
 "lipie":(290,8.0,50.0,4.0), "crema_branza":(200,7.0,4.0,15.0),
 "fasole_verde":(31,1.8,7.0,0.2), "fasole_boabe":(130,8.0,22.0,0.5),
 "broccoli":(34,2.8,6.6,0.4), "varza":(25,1.3,5.8,0.1),
 "gem":(250,0.5,60.0,0.0),
}

def m(key, grams):
    if key is None: return (0.0,0.0,0.0,0.0)
    k,p,c,f = F[key]
    g = grams/100.0
    return (k*g, p*g, c*g, f*g)

DAYS = [
 dict(num=1, theme="Gust Românesc", sub="Mămăligă · sarmale · kefir",
  meals=[
   dict(meal="Mic dejun", title=["MĂMĂLIGĂ CU BRÂNZĂ,","OU ȘI SLĂNINĂ"], time="⏱ 10 min", diff=1,
    ings=[("Mămăligă caldă","100 g",100,"mamaliga"),("Brânză de vaci","150 g",150,"branza_vaci"),("Ou ochi","1 buc",55,"ou"),("Albușuri","1 buc",33,"albus"),
          ("Slănină","10 g",10,"slanina"),("Mărar, sare","după gust",0,None)],
    steps=["Fă un ou ochi (întreg + 1 albuș) în tigaia antiaderentă, fără ulei.",
           "Încălzește mămăliga și amestec-o cu brânza de vaci.",
           "Taie felia de slănină foarte subțire, de poftă.",
           "Servește totul cald."],
    tip="Slănina nu este interzisă, dar 10g sunt arhisuficiente pentru gust. Brânza de vaci îți dă volumul proteic."),
   dict(meal="Gustare", title=["KEFIR CU","CÂTEVA NUCI"], time="⏱ 2 min", diff=1,
    ings=[("Kefir 2%","200 g",200,"kefir"),("Miez de nucă","15 g",15,"nuca")],
    steps=["Bea kefirul la temperatura camerei.","Mănâncă nucile alături, încet."],
    tip="Kefirul e excelent pentru digestie. Nucile țin sațietatea datorită grăsimilor bune."),
   dict(meal="Prânz", title=["SARMALE DE CASĂ","CU MĂMĂLIGĂ"], time="⏱ 15 min", diff=2,
    ings=[("Sarmale (carne pasăre)","220 g",220,"curcan"),("Orez în sarmale (inclus)","0 g",0,None),("Varză (inclus)","0 g",0,None),
          ("Mămăligă caldă","120 g",120,"mamaliga"),("Iaurt grec 2%","50 g",50,"iaurt2")],
    steps=["Dacă le faci tu, folosește carne tocată de curcan/pui și puțin orez.",
           "Încălzește 3-4 sarmale (aprox 220g carne) cu mămăligă.",
           "Adaugă o lingură de iaurt grec în loc de smântână grasă."],
    tip="Da, poți mânca sarmale! Carnea slabă și iaurtul în loc de smântână schimbă complet profilul caloric."),
   dict(meal="Cină", title=["SALATĂ CU PUI,","AVOCADO ȘI IAURT"], time="⏱ 15 min", diff=1,
    ings=[("Piept de pui la grătar","160 g",160,"pui"),("Avocado","1/3 buc",50,"avocado"),("Salată verde + castraveți","200 g",200,"legume"),
          ("Iaurt grec 2% (dressing)","30 g",30,"iaurt2"),("Lămâie, sare","după gust",0,None)],
    steps=["Taie puiul gătit fâșii.",
           "Amestecă frunzele verzi cu avocado feliat.",
           "Fă un dressing din iaurt, zeamă de lămâie, sare și piper.","Toarnă peste salată."],
    tip="O cină plină de prospețime. Avocado are grăsimi sănătoase, iar iaurtul adaugă cremozitate fără ulei."),
  ]),
 dict(num=2, theme="Rapid & La pachet", sub="Wrap · paste · pește alb",
  meals=[
   dict(meal="Mic dejun", title=["WRAP CU ȘUNCĂ,","CAȘCAVAL ȘI LEGUME"], time="⏱ 5 min", diff=1,
    ings=[("Lipie integrală","1 buc",60,"lipie"),("Șuncă de curcan","60 g",60,"sunca"),("Cașcaval light","30 g",30,"cascaval"),
          ("Salată, roșii","50 g",50,"legume")],
    steps=["Încălzește lipia ușor pe ambele părți.",
           "Pune feliile de șuncă și cașcaval în centru.",
           "Adaugă frunze de salată și roșii, rulează strâns."],
    tip="Wrap-ul e varianta cea mai rapidă de pachet. Cașcavalul light are mai multă proteină și mai puțină grăsime."),
   dict(meal="Gustare", title=["IAURT GREC CU","FRUCTE DE PĂDURE"], time="⏱ 3 min", diff=1,
    ings=[("Iaurt grec 2%","180 g",180,"iaurt2"),("Fructe de pădure","100 g",100,"fructe_padure"),("Migdale","10 g",10,"migdale")],
    steps=["Pune iaurtul în bol.", "Adaugă fructele și migdalele sfărâmate."],
    tip="Fructele de pădure aduc volum, migdalele aduc crunch-ul de care ai nevoie când ești stresată."),
   dict(meal="Prânz", title=["PASTE INTEGRALE","BOLOGNESE"], time="⏱ 25 min", diff=2,
    ings=[("Paste integrale (uscate)","70 g",70,"paste_int"),("Carne tocată vită slabă","130 g",130,"vita"),
          ("Roșii pasate","150 g",150,"rosii"),("Ulei de măsline","1 linguriță",5,"ulei"),("Busuioc, sare","după gust",0,None)],
    steps=["Fierbe pastele al dente.",
           "Rumenește carnea de vită în lingurița de ulei.",
           "Adaugă roșiile pasate și lasă sosul să scadă.",
           "Amestecă pastele în sos și servește cald."],
    tip="Vită slabă în sos de roșii e o bombă de fier. Pastele integrale te țin plină mult mai mult timp."),
   dict(meal="Cină", title=["FILE DE PEȘTE","CU FASOLE VERDE"], time="⏱ 20 min", diff=2,
    ings=[("File de pește alb","180 g",180,"peste_alb"),("Fasole verde","150 g",150,"fasole_verde"),
          ("Ulei de măsline","1 lingură",10,"ulei"),("Usturoi, lămâie","după gust",0,None)],
    steps=["Condimentează peștele și fă-l la cuptor sau tigaie.",
           "Sotează fasolea verde în puțin ulei cu usturoi (sau la abur).",
           "Stropește peștele generos cu lămâie."],
    tip="Pește alb + verdețuri. Cina perfectă pentru o digestie ușoară și fără mâini/picioare umflate a doua zi."),
  ]),
 dict(num=3, theme="Comfort Food", sub="Omletă · pilaf · brânză de vaci",
  meals=[
   dict(meal="Mic dejun", title=["OMLETĂ CU CIUPERCI","ȘI ARDEI"], time="⏱ 10 min", diff=1,
    ings=[("Ouă","2 buc",110,"ou"),("Albușuri","2 buc",66,"albus"),("Ciuperci","80 g",80,"ciuperci"),
          ("Ardei","50 g",50,"legume"),("Pâine de secară","2 felii",60,"paine_secara")],
    steps=["Călește ardeiul și ciupercile 2-3 minute în tigaia uscată.",
           "Bate ouăle cu albușurile și toarnă peste legume.",
           "Pliază omleta. Servește cu pâinea prăjită."],
    tip="Un start excelent pentru schimbul de dimineață. Albușurile aduc proteină în plus pe zero grăsime."),
   dict(meal="Gustare", title=["BATOANE DE MORCOV","CU CREMĂ DE BRÂNZĂ"], time="⏱ 5 min", diff=1,
    ings=[("Morcov, țelină apio","150 g",150,"morcov"),("Cremă de brânză light","60 g",60,"crema_branza"),("Semințe","5 g",5,"seminte")],
    steps=["Taie legumele bețișoare.",
           "Presară semințele peste crema de brânză.",
           "Înmoaie bețișoarele în cremă."],
    tip="Te ajută să ronțăi ceva fără să strângi zeci de calorii. Mestecatul taie stresul."),
   dict(meal="Prânz", title=["PILAF DE OREZ","CU PUI ȘI VARZĂ"], time="⏱ 30 min", diff=2,
    ings=[("Piept de pui","160 g",160,"pui"),("Orez fiert","130 g",130,"orez"),("Legume în pilaf","100 g",100,"legume"),
          ("Salată de varză albă","150 g",150,"varza"),("Ulei de măsline","1 linguriță",5,"ulei")],
    steps=["Fă pilaful clasic, cu legume tocate fin și lingurița de ulei.",
           "Fierbe sau gătește puiul în pilaf.",
           "Taie varza mărunt, adaugă sare, oțet și frământ-o.",
           "Servește porția generoasă alături de salată."],
    tip="Varza are super volum caloric scăzut. Pilaf ca la mama acasă, dar măsurat inteligent."),
   dict(meal="Cină", title=["BRÂNZĂ DE VACI","CU MĂMĂLIGĂ"], time="⏱ 10 min", diff=1,
    ings=[("Brânză de vaci","200 g",200,"branza_vaci"),("Mămăligă caldă","130 g",130,"mamaliga"),("Iaurt grec 2%","50 g",50,"iaurt2"),
          ("Miez de nucă","10 g",10,"nuca")],
    steps=["Încălzește mămăliga.",
           "Așază deasupra brânza de vaci amestecată cu iaurtul.",
           "Presară miezul de nucă sfărâmat peste."],
    tip="Cea mai simplă cină românească. Fără gătit complicat seara."),
  ]),
 dict(num=4, theme="Energie la pachet", sub="Terci · ton · curcan",
  meals=[
   dict(meal="Mic dejun", title=["TERCI DE OVĂZ","CU IAURT ȘI MIGDALE"], time="⏱ 5 min", diff=1,
    ings=[("Fulgi de ovăz","45 g",45,"ovaz"),("Iaurt grec 2%","150 g",150,"iaurt2"),("Migdale","15 g",15,"migdale"),
          ("Banană","1/2 buc",60,"banana"),("Apă/lapte zero","100 ml",0,None)],
    steps=["Fierbe ovăzul în apă sau lapte (sau lasă-l peste noapte).",
           "Amestecă iaurtul grec în ovăzul răcit.",
           "Adaugă felii de banană și migdalele tăiate."],
    tip="Iaurtul grec în ovăz îi dă o textură cremoasă și rezolvă proteina fără să fie nevoie de prafuri."),
   dict(meal="Gustare", title=["UN MĂR ȘI","UN PUMN DE MIGDALE"], time="⏱ 1 min", diff=1,
    ings=[("Măr","1 buc",150,"mar"),("Migdale","20 g",20,"migdale")],
    steps=["Spală mărul și ia migdalele într-o punguță."],
    tip="Gustarea supremă on-the-go. Perfectă pentru pauzele scurte la fabrică."),
   dict(meal="Prânz", title=["SALATĂ MARE DE TON","CU PORUMB ȘI OU"], time="⏱ 10 min", diff=1,
    ings=[("Ton în suc propriu","1 cutie",120,"ton"),("Fasole boabe roșie","80 g",80,"fasole_boabe"),("Porumb","50 g",50,"porumb"),
          ("Ou fiert","1 buc",55,"ou"),("Salată verde","150 g",150,"legume"),("Ulei de măsline","1 linguriță",5,"ulei")],
    steps=["Baza de salată verde mare într-un bol.",
           "Pune deasupra tonul stors, fasolea spălată, porumbul și oul tăiat.",
           "Asezonează cu ulei, lămâie și sare."],
    tip="O salată care nu te lasă flămândă după o oră, plină de fibre și proteină."),
   dict(meal="Cină", title=["FRIPTURĂ DE CURCAN","CU BROCCOLI"], time="⏱ 20 min", diff=2,
    ings=[("Piept de curcan","170 g",170,"curcan"),("Broccoli","200 g",200,"broccoli"),("Ulei de măsline","1 lingură",10,"ulei"),
          ("Lămâie, usturoi","după gust",0,None)],
    steps=["Condimentează curcanul și fă-l la tigaie sau cuptor.",
           "Opărește broccoli-ul 3 minute sau bagă-l la cuptor stropit cu puțin ulei.",
           "Stropește generos cu lămâie."],
    tip="Simplu și curat. Curcanul e foarte slab, îți dă sațietate fără greutate în stomac noaptea."),
  ]),
 dict(num=5, theme="Sățios și simplu", sub="Avocado · supă cremă · somon",
  meals=[
   dict(meal="Mic dejun", title=["PÂINE PRĂJITĂ","CU AVOCADO ȘI OUĂ"], time="⏱ 10 min", diff=1,
    ings=[("Pâine de secară","2 felii",60,"paine_secara"),("Avocado","1/3 buc",50,"avocado"),("Ouă ochiuri","2 buc",110,"ou"),
          ("Roșii","100 g",100,"rosii"),("Sare, piper","după gust",0,None)],
    steps=["Pasează avocado-ul cu sare și zeamă de lămâie.","Întinde-l pe pâinea prăjită.",
           "Fă 2 ochiuri fără ulei.",
           "Pune ouăle peste avocado și roșiile alături."],
    tip="Fără unt, grăsimea din avocado e mult mai de calitate."),
   dict(meal="Gustare", title=["SMOOTHIE SIMPLU","CU SEMINȚE DE IN"], time="⏱ 3 min", diff=1,
    ings=[("Kefir sau Iaurt de băut","200 g",200,"kefir"),("Banană","1/2 buc",60,"banana"),("Semințe de in","10 g",10,"seminte")],
    steps=["Dă la blender kefirul, banana și semințele (sau amestecă bine dacă e iaurt)."],
    tip="Semințele de in ajută tranzitul intestinal și te mențin plină."),
   dict(meal="Prânz", title=["SUPĂ CREMĂ DE LEGUME","CU PUI ȘI CRUTOANE"], time="⏱ 25 min", diff=2,
    ings=[("Supă cremă (fără smântână)","350 g",350,"legume"),("Piept de pui (fâșii)","160 g",160,"pui"),
          ("Crutoane integrale","30 g",30,"paine_int"),("Ulei de măsline","1 linguriță",5,"ulei")],
    steps=["Fă o supă cremă din legumele preferate (morcov, dovlecel, ceapă, cartof mic).",
           "Adaugă puiul făcut la grătar tăiat fâșii direct în supă.",
           "Pune crutoanele la final."],
    tip="Lichidul fierbinte e perfect. Adăugând pui, transformi o supă într-o masă completă."),
   dict(meal="Cină", title=["SOMON LA CUPTOR","CU SPARANGHEL"], time="⏱ 20 min", diff=2,
    ings=[("File de somon","130 g",130,"somon"),("Sparanghel sau Dovlecel","200 g",200,"legume"),
          ("Ulei de măsline","1 linguriță",5,"ulei"),("Lămâie","după gust",0,None)],
    steps=["Pune somonul și legumele în tavă, pe foaie de copt.",
           "Asezonează, coace la 200 grade 12-15 minute.",
           "Stoarce lămâie din abundență."],
    tip="O masă super-premium, gata în mai puțin de 20 minute."),
  ]),
 dict(num=6, theme="Tradițional 2.0", sub="Jumări · chiftele · salată bulgărească",
  meals=[
   dict(meal="Mic dejun", title=["JUMĂRI DIN OUĂ","CU TELEMEA ȘI MĂRAR"], time="⏱ 8 min", diff=1,
    ings=[("Ouă","2 buc",110,"ou"),("Albușuri","2 buc",66,"albus"),("Telemea slabă","35 g",35,"telemea"),
          ("Pâine integrală","2 felii",60,"paine_int"),("Mărar proaspăt","după gust",0,None)],
    steps=["Bate ouăle cu albușurile și mărarul.",
           "Pune în tigaie și sfărâmă telemeaua.","Gătește lent până devin cremoase."],
    tip="Jumări perfecte, la fel de sățioase dar cu joncțiunea corectă de calorii datorită albușurilor."),
   dict(meal="Gustare", title=["BRÂNZĂ DE VACI","CU AFINE"], time="⏱ 2 min", diff=1,
    ings=[("Brânză de vaci","180 g",180,"branza_vaci"),("Afine","100 g",100,"fructe_padure"),("Nuci","10 g",10,"nuca")],
    steps=["Amestecă brânza de vaci cu fructele de pădure și nucile."],
    tip="Ceva proaspăt și dulce-acrișor între mese."),
   dict(meal="Prânz", title=["CHIFTELE LA CUPTOR","CU PIURE DE CARTOFI"], time="⏱ 35 min", diff=2,
    ings=[("Carne tocată pui/curcan","160 g",160,"curcan"),("Cartofi","150 g",150,"cartof"),("Iaurt grec 2% (pt piure)","30 g",30,"iaurt2"),
          ("Murături","100 g",100,"legume")],
    steps=["Fă chiftele (cu usturoi, pătrunjel, sare) și coace-le pe hârtie de copt 25 minute.",
           "Fierbe cartofii și pasează-i folosind iaurt în loc de unt.",
           "Servește cu o salată de murături."],
    tip="Chiftele la cuptor, nu prăjite! Au același gust de casă, zero ulei adăugat."),
   dict(meal="Cină", title=["SALATĂ BULGĂREASCĂ","UȘOARĂ"], time="⏱ 10 min", diff=1,
    ings=[("Roșii, castraveți, ardei","200 g",200,"legume"),("Șuncă slabă","50 g",50,"sunca"),("Ou fiert","1 buc",55,"ou"),
          ("Telemea slabă","40 g",40,"telemea"),("Ulei de măsline","1 linguriță",5,"ulei")],
    steps=["Taie legumele mare.",
           "Adaugă șunca, oul fiert feliat și telemeaua.",
           "Asezonează cu ulei de măsline și oțet."],
    tip="O salată sățioasă românească, care pică foarte bine seara."),
  ]),
 dict(num=7, theme="Weekend Treat", sub="Clătite ovăz · frigărui · păstrăv",
  meals=[
   dict(meal="Mic dejun", title=["CLĂTITE DIN OVĂZ","ȘI IAURT CU GEM"], time="⏱ 15 min", diff=2,
    ings=[("Ouă","1 buc",55,"ou"),("Albușuri","2 buc",66,"albus"),("Fulgi de ovăz (măcinați)","40 g",40,"ovaz"),("Iaurt grec 2%","50 g",50,"iaurt2"),
          ("Gem (fără zahăr adăugat)","30 g",30,"gem")],
    steps=["Mărunțește ovăzul în blender, adaugă ouăle și iaurtul.",
           "Fă clătite mici în tigaia antiaderentă.",
           "Unge-le cu gemul fără zahăr."],
    tip="Dezlăț, dar în bugetul caloric. Răsfață-te sâmbăta cu ele."),
   dict(meal="Gustare", title=["O MANDARINĂ ȘI","CÂTEVA NUCI"], time="⏱ 1 min", diff=1,
    ings=[("Mandarină","1 buc",90,"mandarina"),("Nuci","20 g",20,"nuca")],
    steps=["Curăță mandarina și mănâncă nucile alături."],
    tip="Simplu, rapid și curat."),
   dict(meal="Prânz", title=["FRIGĂRUI DE PUI","CU OREZ SĂLBATIC"], time="⏱ 25 min", diff=2,
    ings=[("Piept de pui","170 g",170,"pui"),("Orez sălbatic/integral","120 g",120,"orez"),("Legume pentru frigărui","150 g",150,"legume"),
          ("Ulei de măsline","1 linguriță",5,"ulei")],
    steps=["Montează frigăruile (pui, ardei, ceapă).",
           "Gătește-le la grătar sau în cuptor, stropite cu uleiul.",
           "Fierbe orezul și servește împreună."],
    tip="O masă de weekend la grătar, perfect echilibrată."),
   dict(meal="Cină", title=["PĂSTRĂV LA CUPTOR","CU CARTOFI NATUR"], time="⏱ 20 min", diff=2,
    ings=[("Păstrăv proaspăt","180 g",180,"pastrav"),("Cartofi natur","120 g",120,"cartof"),("Lămâie, pătrunjel","după gust",0,None),
          ("Unt (doar pt gust)","5 g",5,"ulei")],
    steps=["Coace păstrăvul cu lămâie înăuntru 15 minute la 200 grade.",
           "Fierbe cartofii, pune-i cu pătrunjel verde și un cubuleț minuscul de unt.",
           "Stoarce lămâie."],
    tip="Păstrăvul e un pește românesc grozav, bogat în proteină pură."),
  ]),
]

def recipe_macros(r):
    tk=tp=tc=tf=0.0
    for (_,_,g,key) in r["ings"]:
        k,p,c,f=m(key,g); tk+=k; tp+=p; tc+=c; tf+=f
    return tk,tp,tc,tf

CHOC = (60,1.0,3.0,5.0)

print("VERIFICARE MACRO PER ZI (țintă 1600 / 140 / 125 / 60, + pătrat ciocolată seara)")
for d in DAYS:
    dk=dp=dc=df=0.0
    for r in d["meals"]:
        k,p,c,f=recipe_macros(r)
        r["_macros"]=(round(k),round(p),round(c),round(f))
        dk+=k; dp+=p; dc+=c; df+=f
    dk+=CHOC[0]; dp+=CHOC[1]; dc+=CHOC[2]; df+=CHOC[3]
    d["_total"]=(round(dk),round(dp),round(dc),round(df))
    print(f"  Ziua {d['num']} {d['theme']:<20} {round(dk):>4} kcal · {round(dp):>3}P · {round(dc):>3}C · {round(df):>2}F")

TAG_M = {"Mic dejun":"Dimineața","Gustare":"Între mese","Prânz":"Prânz","Cină":"Seara"}
SLUG  = {"Mic dejun":"micdejun","Gustare":"gustare","Prânz":"pranz","Cină":"cina"}
PHOTO_MANIFEST = []

def esc(s): return str(s).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

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
    <img src="./cookbook-images/claudia_v2/{img}" alt="{esc(dish)}" onerror="{onerr}">
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
    <div class="mg cal"><span class="mg-l">Calorii / zi</span><span class="mg-l">1600</span></div>
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

OLD_FILE = os.path.join(os.path.dirname(__file__), "..", "public", "Cartea_Retete_Claudia.html")
try:
    old = open(OLD_FILE, encoding="utf-8").read()
    HEAD = old.split("</head>")[0] + "</head>\n<body>\n"
    NAV = "<!-- ─── NAVIGARE CARTE ─── -->" + old.split("<!-- ─── NAVIGARE CARTE ─── -->")[1]
except Exception as e:
    print("Cannot read OLD file, making fallback HTML headers.")
    HEAD = "<html><head><meta charset='utf-8'><title>Cartea de rețete · Claudia · 1600 kcal</title><link rel='stylesheet' href='style.css'></head><body>"
    NAV = "</body></html>"

days_html = "\n".join(render_day(d) for d in DAYS)
html = HEAD + COVER + "\n" + INTRO + "\n" + render_index() + "\n" + days_html + "\n" + CLOSING + "\n" + NAV
html = html.replace("Cartea de rețete · Claudia · 1800 kcal", "Cartea de rețete · Claudia · 1600 kcal")

OUT2 = os.path.join(os.path.dirname(__file__), "..", "..", "CLIENTS", "Claudia David", "Cartea_Retete_Claudia_v2.html")

with open(OUT2, "w", encoding="utf-8") as f:
    f.write(html)
print(f"Scris: {OUT2}")
