<div align="center">

# 🎨 UNI Tasarım — XML & XSLT Canlı Tasarım Editörü

**e-Fatura, e-Arşiv ve e-İrsaliye belgelerini XSLT şablonlarıyla canlı önizleyip sürükle-bırak ile tasarlayan masaüstü uygulaması.**

*Hiçbir fatura verisi bilgisayarınızdan dışarı çıkmaz — tamamen yerel.*

[![Electron](https://img.shields.io/badge/Electron-44-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/Lisans-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 Hakkında

**UNI Tasarım**, UBL-TR 1.2 uyumlu e-Belgeler için geliştirilmiş, WYSIWYG odaklı bir XSLT tasarım atölyesidir. GİB şablonlarıyla uyumlu **XSLT 1.0** motorunu tarayıcının yerleşik işlemcisi + `saxon-js`/`xslt3` hibrit hattıyla çalıştırır. Her sürükleme, boyutlandırma veya metin düzenlemesi doğrudan XSLT koduna geri yazılır — diske kaydedilen `.xslt` her zaman temizdir.

> [!IMPORTANT]
> Verileriniz sizde kalır: uygulama hesap, bulut, telemetri veya dış API kullanmaz. Şablon kütüphanesi `app.getPath('userData')` altında yerelde saklanır.

## ✨ Özellikler

- **Önizleme-öncelikli WYSIWYG:** Tıkla-seç, yüzen araç çubuğu, özellikler paneli, çift tıkla metin düzenleme — her işlem XSLT'ye geri yazılır
- **Hibrit sürükleme:** Akışta yeniden sırala · `Alt` ile serbest konumlandır · köşeden boyutlandır · tablo sütunu genişlet · logoya sürükle-bırak
- **3 belge türü × 3 hazır şablon:** Kurumsal / Sade / Boş — UBL-TR örnek verileriyle (`faturaXml`, `arsivXml`, `irsaliyeXml`)
- **Kod eşitleme:** Seçili öğenin XSLT satırı `CodeDrawer`'da otomatik vurgulanır
- **Şablon kütüphanem:** Tasarımlara ad ver, tek tıkla geri yükle (IPC + userData)
- **PDF & Yazdırma:** Piksel-hassas `printToPDF` veya sistem yazıcısı
- **Geri Al / Yinele** (`Ctrl+Z`/`Ctrl+Y`) ve **otomatik kayıt** ile çökme koruması

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Masaüstü | Electron 44, electron-vite 5, electron-builder (NSIS) |
| Ön Yüz | React 19, TypeScript 7, Tailwind CSS 4, Monaco Editor |
| XSLT Motoru | `xslt3` CLI (derleme → SEF) + `saxon-js` (çalıştırma) |
| Test | Vitest 4 (happy-dom) + Playwright 1.62 (e2e) |
| Araçlar | Vite 7, oxlint, saxon-check script |

## 🚀 Hızlı Başlangıç

**Gereksinimler:** Node.js 22+, npm 10+

```powershell
git clone https://github.com/<kullanici>/uni-xslt-designer.git
cd uni-xslt-designer

npm install        # bağımlılıklar
npm run dev        # geliştirme (canlı yenileme)
```

Diğer komutlar:

```powershell
npm test           # birim testler (vitest)
npm run test:e2e   # uçtan uca (playwright)
npm run dist       # NSIS kurulum paketi → release/
npm run typecheck  # tsc --noEmit
npm run lint       # oxlint src
```

> Not: Dönüşüm motoru tarayıcının yerleşik **XSLT 1.0** işlemcisini kullanır (GİB şablonlarıyla uyumlu). Monaco editör CDN'siz, yerel paketlenmiştir.

## 🏗️ Mimari

```
src/
  main/            → Electron ana süreç (ipc, xsltEngine, printToPDF)
  preload/         → IPC köprüsü (contextIsolated)
  renderer/
    src/
      core/        → transformer, xsltId, xsltWrite, validation, docTypes
      components/  → designer/, preview/, layout/, editor/, landing/
      hooks/       → usePreviewDrag, usePreviewDrop, usePreviewInteraction
      store/       → editorStore, previewStore, uiStore, toastStore
      samples/     → fatura/arsiv/irsaliye XML + templates/factories
```

- `src/core/` — `data-xslt-id` kimlik eşleme, WYSIWYG yazmaları bellek-içi kimliklerle
- `src/main/ipc.ts` — dosya diyalogları, şablon kütüphanesi, PDF üretimi
- `src/main/xsltEngine.ts` — `xslt3` derleme (SHA1 önbellek, 60sn timeout) → `saxon-js` transform

## 🔐 Veri Konumu ve Gizlilik

- Şablonlar: `app.getPath('userData')/templates`
- Geçici derleme: `app.getPath('temp')/uni-xslt`
- Hesap / bulut / telemetri / analitik **yok** — ağ trafiği yalnızca yerel Electron ↔ renderer

## 🧪 Testler

```powershell
npm test           # vitest run — xsltId, embeddedXslt, docTypes
npm run test:e2e   # playwright — app.spec.ts, designer.spec.ts
```

`scripts/saxon-check.cjs` gerçek şablonları tam motor hattıyla doğrular:
```powershell
node scripts/saxon-check.cjs "./sablonlar"
```

## 📦 Dağıtım

```powershell
npm run dist
# → release/UNI Tasarım-Kurulum-0.3.4.exe (NSIS, x64)
```

`electron-builder.yml`:
- `appId: com.unideva.unitasarim`
- `asarUnpack: node_modules/**` — ana süreç `ELECTRON_RUN_AS_NODE` ile saf Node'da çalışır
- `artifactName: ${productName}-Kurulum-${version}.${ext}`

## 🤝 Katkı Sağlama

1. Fork'layın
2. Dal oluşturun (`git checkout -b feature/harika-ozellik`)
3. Commit'leyin (`git commit -m 'feat: harika özellik'`)
4. Push'layın (`git push origin feature/harika-ozellik`)
5. Pull Request açın

## 📜 Lisans

MIT — detaylar için [LICENSE](LICENSE) dosyasına bakın. Copyright (c) 2026 Unideva

---

<div align="center">

**UNI Tasarım** — XSLT'yi görsel yap, veriyi yerelde tut.

</div>
