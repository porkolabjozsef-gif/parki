#!/bin/bash
python3 -c "
import json
with open('/data/data/com.termux/files/home/parki/app.json', 'r') as f:
    d = json.load(f)

# versionCode növelés
vc = d['expo']['android'].get('versionCode', 1)
d['expo']['android']['versionCode'] = vc + 1

# version string növelés (patch)
v = d['expo']['version'].split('.')
v[2] = str(int(v[2]) + 1)
new_version = '.'.join(v)
d['expo']['version'] = new_version

with open('/data/data/com.termux/files/home/parki/app.json', 'w') as f:
    json.dump(d, f, indent=2)
print(f'versionCode: {vc} -> {vc+1}')
print(f'version: {\".\".join(v[:2])}.{int(v[2])-1} -> {new_version}')
"
