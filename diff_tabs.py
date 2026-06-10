# Let's compare what was the old site file and the new site file
import subprocess

out = subprocess.run(["git", "show", "HEAD:public/quickref/andrei-antrenament.html"], capture_output=True, text=True)
old_site = out.stdout

with open('/Users/iordacheclaudiu/Claude - BUILT Cowork/CLIENTS/Andrei Stamate/Antrenament_Andrei.html', 'r', encoding='utf-8') as f:
    new_local = f.read()

# find the tabs html in both
old_tabs_idx = old_site.find('<!-- TABS -->')
new_tabs_idx = new_local.find('<!-- TABS -->')

print("--- OLD SITE TABS ---")
print(old_site[old_tabs_idx:old_tabs_idx+300])
print("\n--- NEW LOCAL TABS ---")
print(new_local[new_tabs_idx:new_tabs_idx+300])

