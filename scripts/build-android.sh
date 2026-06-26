#!/bin/bash

echo "📦 versionCode és versionName növelése..."
python3 - << PYEOF
import re, json

gradle_path = '/home/porki/parki/android/app/build.gradle'
appjson_path = '/home/porki/parki/app.json'

with open(gradle_path, 'r') as f:
    content = f.read()

match_code = re.search(r'versionCode (\d+)', content)
if match_code:
    old_code = int(match_code.group(1))
    new_code = old_code + 1
    content = content.replace(f'versionCode {old_code}', f'versionCode {new_code}')
    print(f"versionCode: {old_code} → {new_code}")

match_name = re.search(r'versionName "(\d+)\.(\d+)\.(\d+)"', content)
if match_name:
    major, minor, patch = match_name.group(1), match_name.group(2), int(match_name.group(3))
    old_name = f'{major}.{minor}.{patch}'
    new_name = f'{major}.{minor}.{patch + 1}'
    content = content.replace(f'versionName "{old_name}"', f'versionName "{new_name}"')
    print(f"versionName: {old_name} → {new_name}")
    with open(appjson_path, 'r') as f:
        appjson = json.load(f)
    appjson['expo']['version'] = new_name
    with open(appjson_path, 'w') as f:
        json.dump(appjson, f, indent=2, ensure_ascii=False)
    print(f"app.json version: → {new_name}")

with open(gradle_path, 'w') as f:
    f.write(content)
PYEOF

echo "🔨 Build indítása..."
cd /home/porki/parki/android
./gradlew bundleRelease

echo ""
echo "✅ Töltsd fel a Play Console-ba, majd commitold:"
echo "cd /home/porki/parki && git add android/app/build.gradle app.json && git commit -m bump && git push"
