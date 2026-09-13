# UNI Tasarım — Stabilizasyon Tasarımı (v0.3.4 → v0.4.0 adayı)

Tarih: 2026-09-13 · Yaklaşım: A (yerinde stabilize) · Kapsam: `uni-xslt-designer` (Electron desktop).
Web (`UNI_XML_XSLT`) ve doküman (`UNI-wiki`) kapsam dışı.

## Hedef

UNI Tasarım desktop uygulamasını hatasız, sorunsuz kullanılabilir duruma getirmek:
Linux + Windows'ta kurulan, 3 belge tipinde tam akışı çalışan, testleri yeşil,
GİB örnekleriyle doğrulanmış XSLT 1.0 çıktısı üreten ürün.

## Başlangıç durumu (doğrulandı)

- `npm install` sonrası `npm run typecheck` → **126 hata**, tamamı bildirilmemiş
  bağımlılıklardan (`react`, `zustand`, `lucide-react`, `@monaco-editor/react`,
  `@electron-toolkit/*` … `package.json`'da yok).
- `npm run lint` (oxlint) temiz. Git temiz, 2 commitlik erken aşama.
- Testler: 3 unit (vitest) + 2 e2e (playwright) — çalışırlığı Faz-2'de doğrulanacak.
- Paketleme: `electron-builder` yalnızca Windows NSIS üretiyor.

## Fazlar

### Faz-1 — Bağımlılık + typecheck onarımı
- Kaynakta import edilen tüm paketleri doğru sürümlerle `dependencies`'e sabitle,
  lockfile'ı yenile, `npm ci` ile temiz kurulumu doğrula.
- `tsc --noEmit` sıfır hata. Kaynak kod değişikliği yalnızca import-hatalarının
  gizlediği gerçek tip hataları için, minimal.
- Kabul: `npm run typecheck` yeşil, `npm run lint` yeşil.

### Faz-2 — Test kalkanı
- Mevcut 3 unit + 2 e2e'yi çalıştır, kırıkları onar.
- 3 belge tipi (e-Fatura, e-Arşiv, e-İrsaliye) için "aç → tasarla → önizle → kaydet"
  e2e kapsamı ekle.
- Kabul: `npm test` + `npm run test:e2e` yeşil.

### Faz-3 — Çift platform paketleme
- `electron-builder.yml`'e Linux hedefi (AppImage) ekle; Windows NSIS korunur.
- Her iki pakette kurulum + açılış duman testi (CachyOS'ta doğrulanır).
- Kabul: iki platformda kurulan ve açılan paket.

### Faz-4 — Belge akışı + GİB doğrulama
- 3 belge tipinde tam kullanıcı akışının manuel + otomatik doğrulaması.
- Sentetik UBL-TR örnek XML'leriyle (gerçek GİB örneği yok) XSLT 1.0 çıktısının
  geçerlilik kontrolü (`saxon-check.cjs` hattı üzerinden).
- Kabul: sürüm notlu v0.4.0 adayı.

## Sınırlar

- Yeni özellik yok; yalnızca stabilizasyon.
- Mimari refactor yok (web ile kod birleştirme faz-2 işi olarak ertelendi).
- Telemetri/ağ çağrısı yok; uygulama tamamen yerel kalır.
