#!/bin/bash
python3 -c "
import json
with open('/data/data/com.termux/files/home/parki/app.json', 'r') as f:
    d = json.load(f)
vc = d['expo']['android'].get('versionCode', 1)
d['expo']['android']['versionCode'] = vc + 1
with open('/data/data/com.termux/files/home/parki/app.json', 'w') as f:
    json.dump(d, f, indent=2)
print(f'versionCode: {vc} -> {vc+1}')
"
