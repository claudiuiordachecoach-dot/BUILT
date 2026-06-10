import subprocess
out = subprocess.run(["git", "show", "HEAD:public/quickref/andrei-antrenament.html"], capture_output=True, text=True)
old_site = out.stdout

with open('/Users/iordacheclaudiu/Claude - BUILT Cowork/CLIENTS/Andrei Stamate/Antrenament_Andrei.html', 'r', encoding='utf-8') as f:
    new_local = f.read()

print("old site length:", len(old_site))
print("new local length:", len(new_local))

import difflib
diff = list(difflib.unified_diff(old_site.splitlines(), new_local.splitlines(), n=0))
print("Number of changed lines:", len(diff))

