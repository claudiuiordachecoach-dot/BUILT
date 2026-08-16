#!/bin/bash
DIR_OLD="public/cookbook-images/claudia"
DIR_NEW="public/cookbook-images/claudia_1400"

# Day 1
cp "$DIR_OLD/z1_micdejun_omleta_1781814675793.png" "$DIR_NEW/z1_md.png"
cp "$DIR_OLD/z2_pranz_pui_1781815305368.png" "$DIR_NEW/z1_p.png" # Pui gratar (folosim pui)
cp "$DIR_OLD/z1_cina_peste_1781814707787.png" "$DIR_NEW/z1_c.png" # Peste
cp "$DIR_OLD/z7_gustare_smoothie_1781853495433.png" "$DIR_NEW/z1_g.png" # Kefir

# Day 2
cp "$DIR_OLD/z2_micdejun_iaurt_1781815284522.png" "$DIR_NEW/z2_md.png" # Terci cu iaurt
cp "$DIR_OLD/z6_cina_salata_ton_1781853456499.png" "$DIR_NEW/z2_p.png" # Salata ton
cp "$DIR_OLD/z2_cina_pui_salata_1781815314465.png" "$DIR_NEW/z2_c.png" # Salata caldă pui
cp "$DIR_OLD/z1_gustare_iaurt_1781814685679.png" "$DIR_NEW/z2_g.png" # Iaurt grecesc

# Day 3
cp "$DIR_OLD/z7_cina_somon_1781853516074.png" "$DIR_NEW/z3_md.png" # Toast somon (folosim somon)
cp "$DIR_OLD/z4_pranz_tocanita_1781815391505.png" "$DIR_NEW/z3_p.png" # Ficatei/tocanita
cp "$DIR_OLD/z4_cina_branza_legume_1781853354873.png" "$DIR_NEW/z3_c.png" # Mamaliga cu branza
cp "$DIR_OLD/z3_gustare_pui_1781815332131.png" "$DIR_NEW/z3_g.png" # Rulouri

# Day 4
cp "$DIR_OLD/z4_micdejun_branza_1781815374608.png" "$DIR_NEW/z4_md.png" # Jumari telemea
cp "$DIR_OLD/z3_pranz_sarmale_1781815341722.png" "$DIR_NEW/z4_p.png" # Sarmale
cp "$DIR_OLD/z1_pranz_pastrav_1781814697848.png" "$DIR_NEW/z4_c.png" # Salau/peste gratar
cp "$DIR_OLD/z7_gustare_smoothie_1781853495433.png" "$DIR_NEW/z4_g.png" # Whey & Afine (shake)

# Day 5
cp "$DIR_OLD/z7_gustare_smoothie_1781853495433.png" "$DIR_NEW/z5_md.png" # Smoothie
cp "$DIR_OLD/z5_pranz_ciorba_1781853387712.png" "$DIR_NEW/z5_p.png" # Gulas / Ciorba
cp "$DIR_OLD/z5_cina_supa_friptura_1781853397211.png" "$DIR_NEW/z5_c.png" # Chiftele (friptura pui)
cp "$DIR_OLD/z5_gustare_iaurt_1781853376957.png" "$DIR_NEW/z5_g.png" # Branza perle

# Day 6
cp "$DIR_OLD/z3_micdejun_clatite_1781815323415.png" "$DIR_NEW/z6_md.png" # Clatite proteice
cp "$DIR_OLD/z6_pranz_curcan_1781853446709.png" "$DIR_NEW/z6_p.png" # Paste curcan
cp "$DIR_OLD/z2_pranz_pui_1781815305368.png" "$DIR_NEW/z6_c.png" # Fasii pui
cp "$DIR_OLD/z7_gustare_smoothie_1781853495433.png" "$DIR_NEW/z6_g.png" # Kefir

# Day 7
cp "$DIR_OLD/z1_gustare_iaurt_1781814685679.png" "$DIR_NEW/z7_md.png" # Iaurt grecesc
cp "$DIR_OLD/z5_cina_supa_friptura_1781853397211.png" "$DIR_NEW/z7_p.png" # Cotlet porc (carne)
cp "$DIR_OLD/z7_cina_somon_1781853516074.png" "$DIR_NEW/z7_c.png" # Pastrav cupto
cp "$DIR_OLD/z1_gustare_iaurt_1781814685679.png" "$DIR_NEW/z7_g.png" # Iaurt grecesc

echo "Done"
