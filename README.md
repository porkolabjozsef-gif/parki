# Parki 🅿️

**Univerzális parkolás emlékeztető**

---

## Első indítás – lépésről lépésre

### 1. Expo fiók létrehozása
→ [expo.dev](https://expo.dev) → Sign Up (ingyenes)

### 2. GitHub repo létrehozása
→ [github.com](https://github.com) → New repository → `parki` (Public)

### 3. Kód feltöltése a repoba
Termuxból:
```bash
cd ~
git clone https://github.com/TE_FELHASZNALONEVED/parki.git
# másold bele a fájlokat, majd:
git add .
git commit -m "Initial commit"
git push
```

### 4. EAS projekt beállítása
Termuxból (vagy PC-ről):
```bash
npm install -g eas-cli
eas login
eas init
```
Az `eas init` frissíti az `app.json`-ban a `projectId`-t.

### 5. EXPO_TOKEN hozzáadása GitHub Secretshez
→ expo.dev → Account Settings → Access Tokens → Create token
→ GitHub repo → Settings → Secrets → New secret → `EXPO_TOKEN`

### 6. Build indítása
Pushold a kódot → GitHub Actions automatikusan elindul → 10-15 perc múlva letölthető APK

Vagy manuálisan Termuxból:
```bash
eas build --platform android --profile preview
```

---

## Engedélyek (első indításkor)

1. **Értesítési hozzáférés**: Beállítások → Értesítések → Értesítési hozzáférés → Parki ✓
2. **Fizikai aktivitás**: automatikus felugró ablak
3. **Akkumulátor**: Beállítások → Akkumulátor → Parki → Korlátlan

---

## Projekt struktúra

```
parki/
├── App.tsx                          # Belépési pont, navigáció
├── app.json                         # Expo konfiguráció
├── eas.json                         # EAS Build konfiguráció
├── plugins/
│   └── withNotificationListener.js  # Android natív plugin
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Főképernyő
│   │   ├── AppsScreen.tsx           # Alkalmazások kezelése
│   │   └── SettingsScreen.tsx       # Beállítások
│   └── services/
│       ├── notificationService.ts   # Push értesítések
│       └── storageService.ts        # Adattárolás
└── .github/workflows/
    └── eas-build.yml                # Automatikus build
```

---

## Roadmap

- [ ] iOS support
- [ ] Android Auto értesítés
- [ ] Widget
- [ ] Statisztika
- [ ] Play Store feltöltés

---

Készítette: Porki × Claude
