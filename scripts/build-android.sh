#!/bin/bash

echo "📦 versionCode és versionName növelése..."
python3 << PYEOF
import re, sys

path = '/home/porki/parki/android/app/build.gradle'
with open(path, 'r') as f:
    content = f.read()

# versionCode növelése
match_code = re.search(r'versionCode (\d+)', content)
if match_code:
    old_code = int(match_code.group(1))
    new_code = old_code + 1
    content = content.replace(f'versionCode {old_code}', f'versionCode {new_code}')
    print(f"versionCode: {old_code} → {new_code}")

# versionName – ha van paraméter, azt használja, különben patch+1
match_name = re.search(r'versionName "(\d+)\.(\d+)\.?(\d*)"', content)
if match_name:
    old_name = match_name.group(0).replace('versionName "', '').replace('"', '')
    new_name = sys.argv[1] if len(sys.argv) > 1 else f'{match_name.group(1)}.{match_name.group(2)}.{int(match_name.group(3) or 0) + 1}'
    content = content.replace(f'versionName "{old_name}"', f'versionName "{new_name}"')
    print(f"versionName: {old_name} → {new_name}")

with open(path, 'w') as f:
    f.write(content)
PYEOF

echo "🔨 Build indítása..."
cd /home/porki/parki/android
./gradlew bundleRelease
