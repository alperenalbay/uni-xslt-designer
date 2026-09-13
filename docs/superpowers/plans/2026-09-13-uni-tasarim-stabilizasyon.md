# UNI Tasarım Stabilizasyon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** uni-xslt-designer desktop uygulamasını typecheck/test/e2e yeşil, Linux+Windows paketlenebilir, 3 belge tipinde GİB-doğrulanmış v0.4.0 adayı haline getirmek.

**Architecture:** Mevcut Electron + React mimarisine dokunmadan stabilizasyon: önce bağımlılık bildirimi onarılır, sonra test kalkanı, sonra paketleme, en son doğrulama. Yeni özellik ve refactor yok.

**Tech Stack:** Electron 44, electron-vite 5, React 19, TypeScript 7 (strict), Tailwind 4, Monaco, zustand 5 + zundo 2, xslt3 + saxon-js 2.7, Vitest 4, Playwright 1.62, electron-builder 26 (NSIS + AppImage).

**Spec:** `docs/superpowers/specs/2026-09-13-uni-tasarim-stabilizasyon-design.md`

## Global Constraints

- Node v22.23.2 + npm 10.9.8 kullanılır (`node --version` ile doğrula).
- Telemetri ve ağ çağrısı eklenemez; uygulama tamamen yerel kalır.
- Arayüzdeki Türkçe metinler korunur; mevcut testlerdeki seçiciler (`#preview-frame`, `.doc-title`, `Ne tasarlamak istersiniz?`) değiştirilemez.
- Commitler Conventional Commits ile (`fix:`, `test:`, `chore:`, `docs:`) ve tek görev tek commit.
- Push yapılmaz; yalnızca yerel commit.
- Her görev sonunda ilgili doğrulama komutu yeşil olmadan sonraki göreve geçilmez.

---

## File Structure

| Dosya | Sorumluluk | Değişen görev |
|---|---|---|
| `package.json` | Eksik 8 bağımlılığın sabitlenmesi | Task 1 |
| `package-lock.json` | Temiz kurulumla yeniden üretilir | Task 1 |
| `src/renderer/src/store/*.ts` ve typecheck'in işaret ettiği dosyalar | Gerçek tip hataları (varsa) minimal düzeltme | Task 2 |
| `e2e/docflows.spec.ts` (yeni) | e-Arşiv + e-İrsaliye akış testleri | Task 5 |
| `electron-builder.yml` | Linux AppImage hedefi eklenir, win bloğu aynen korunur | Task 6 |
| `scripts/verify-packaged.cjs` | Sabit exe yolu + `v0.3.4` metni parametreleşir | Task 7 |
| `testdata/gib-ornekler/` (yeni, 3 XML) | Sentetik UBL-TR doğrulama örnekleri | Task 9 |
| `package.json` (version) + `CHANGELOG.md` (yeni) | v0.4.0 sürüm kaydı | Task 10 |

---

### Task 1: Eksik bağımlılıkları sabitle ve temiz kurulum yap

**Files:**
- Modify: `package.json` (`dependencies` bloğu)
- Regenerate: `package-lock.json`

**Interfaces:**
- Consumes: yok
- Produces: `npm ci` ile kurulabilen eksiksiz bağımlılık ağacı (Task 2+ buna dayanır)

- [ ] **Step 1: `dependencies` bloğunu güncelle**

`package.json` içindeki `"dependencies"` bloğunu bununla değiştir:

```json
"dependencies": {
  "@electron-toolkit/preload": "^3.0.2",
  "@monaco-editor/react": "^4.7.0",
  "lucide-react": "^1.45.0",
  "monaco-editor": "^0.56.0",
  "react": "^19.3.0",
  "react-dom": "^19.3.0",
  "saxon-js": "^2.7.0",
  "xslt3": "^2.7.0",
  "zundo": "^2.3.0",
  "zustand": "^5.0.15"
}
```

- [ ] **Step 2: Temiz kurulum yap**

Run: `rm -rf node_modules package-lock.json && npm install --no-audit --no-fund`
Expected: exit 0, sonunda `added N packages` satırı

- [ ] **Step 3: Kritik paketlerin kurulduğunu doğrula**

Run: `node -e "for (const p of ['react','react-dom','zustand','zundo','lucide-react','monaco-editor','@monaco-editor/react','@electron-toolkit/preload']) console.log(p, require('./node_modules/'+p+'/package.json').version)"`
Expected: 8 satır sürüm çıktısı, hata yok

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "fix: bildirilmemiş çalışma-zamanı bağımlılıklarını sabitle"
```

---

### Task 2: Typecheck'i sıfır hataya indir

**Files:**
- Modify: yalnızca `npm run typecheck` çıktısında `error TS` veren dosyalar (adaylar: `src/renderer/src/store/toastStore.ts`, `src/renderer/src/store/uiStore.ts` — Task 1 sonrası zustand çözüldüğü için `TS7006` kaskad hatalarının kendiliğinden sönmesi beklenir)

**Interfaces:**
- Consumes: Task 1'in bağımlılık ağacı
- Produces: `tsc --noEmit` exit 0 (Task 3+ buna dayanır)

- [ ] **Step 1: Hata sayımını ölç**

Run: `npm run typecheck > /tmp/opencode/tc.log 2>&1; echo "EXIT=$?"; grep -c "error TS" /tmp/opencode/tc.log`
Expected: sayı not edilir (Task 1 öncesi baz: EXIT=1, 126 hata)

- [ ] **Step 2: Kalan hataları dosyala**

Run: `grep "error TS" /tmp/opencode/tc.log | sed -E "s/\(.*//" | sort | uniq -c | sort -rn`
Expected: hatası olan dosya listesi ekranda

- [ ] **Step 3: Her dosyadaki hatayı minimal düzeltmeyle kapat**

Kural: import yolu değişmez, `any` eklenemez, davranış değişmez. Sadece tipin gerektirdiği en küçük düzeltme (eksik tip eki, yanlış alan adı vb.). Her dosya sonrası Step 1 komutu tekrar çalıştırılır.

- [ ] **Step 4: Sıfırı doğrula**

Run: `npm run typecheck`
Expected: exit 0, çıktı yok

- [ ] **Step 5: Lint'i doğrula**

Run: `npm run lint`
Expected: exit 0

- [ ] **Step 6: Commit (yalnızca Step 3'te kaynak değiştiyse)**

```bash
git add -A
git commit -m "fix: typecheck kalan tip hatalarını kapat"
```

---

### Task 3: Unit testleri yeşile çevir

**Files:**
- Test: `src/renderer/src/core/docTypes.test.ts`, `src/renderer/src/core/embeddedXslt.test.ts`, `src/renderer/src/core/xsltId.test.ts`
- Modify: yalnızca başarısız testin işaret ettiği kaynak dosya (testler referans kabul edilir, test kodu değiştirilmez)

**Interfaces:**
- Consumes: Task 2'nin tip-temiz ağacı
- Produces: `npm test` exit 0

- [ ] **Step 1: Testleri çalıştır**

Run: `npm test 2>&1 | tail -15`
Expected: `Test Files 3 passed`, `Tests` satırında fail yok

- [ ] **Step 2: Başarısızlık varsa kaynağı düzelt, testi değil**

Her failing assertion için ilgili `src/renderer/src/core/*.ts` dosyasını düzelt, Step 1'i tekrarla. Davranış değişikliği yok, sadece bozuk implementasyon onarımı.

- [ ] **Step 3: Commit (değişiklik olduysa)**

```bash
git add -A
git commit -m "fix: unit test başarısızlıklarını onar"
```

---

### Task 4: Playwright chromium kurulumu + mevcut e2e'yi yeşile çevir

**Files:**
- Test: `e2e/app.spec.ts`, `e2e/designer.spec.ts` (değişmez)

**Interfaces:**
- Consumes: Task 3'ün yeşil birim tabanı
- Produces: `npm run test:e2e` exit 0

- [ ] **Step 1: Chromium'u kur**

Run: `npx playwright install chromium`
Expected: tarayıcı indirilir, exit 0. Sistem bağımlılığı eksik derse çıktıyı not edip kullanıcıya bildir (sudo gerektiği için `install --with-deps` çalıştırılmaz).

- [ ] **Step 2: e2e'yi çalıştır**

Run: `npm run test:e2e 2>&1 | tail -15`
Expected: tüm spec'ler passed. (`playwright.config.ts` `npm run dev` + `http://localhost:5173` kullanır, ek ayar gerekmez.)

- [ ] **Step 3: Başarısızlık varsa onar**

Bozuk seçici veya zamanlama ise ilgili e2e adımındaki bekleme/seçici, uygulamadaki gerçek DOM'a uydurularak düzeltilir (Türkçe metinler ve `#preview-frame`/`.doc-title` seçicileri korunur). Uygulama hatası ise kaynağı düzelt. Her düzeltme sonrası Step 2 tekrarlanır.

- [ ] **Step 4: Commit (değişiklik olduysa)**

```bash
git add -A
git commit -m "fix: mevcut e2e spec'leri yeşile çevir"
```

---

### Task 5: e-Arşiv ve e-İrsaliye akış testleri ekle

**Files:**
- Create: `e2e/docflows.spec.ts`
- Test: `e2e/docflows.spec.ts`

**Interfaces:**
- Consumes: Task 4'ün çalışan e2e altyapısı + `e2e/designer.spec.ts` içindeki `loadKurumsalFatura` deseni
- Produces: 3 belge tipinin "kart → önizleme → Doğrulandı rozeti" kapsamı

- [ ] **Step 1: Bölüm başlıklarını doğrula**

Run: `grep -n "e-Arşiv\|e-İrsaliye" src/renderer/src/components/landing/LandingScreen.tsx | head -10`
Expected: iki bölümün de `section` içinde render edildiği görülür (mevcut `app.spec.ts` zaten üçünü assert ediyor).

- [ ] **Step 2: `e2e/docflows.spec.ts` dosyasını yaz**

```ts
import { expect, test } from '@playwright/test'

async function loadFirstCard(page: import('@playwright/test').Page, section: string): Promise<void> {
  await page.goto('/')
  const card = page.locator('section').filter({ hasText: section }).first()
  await card.getByText('Kurumsal', { exact: true }).click()
  await expect(page.frameLocator('#preview-frame').locator('.doc-title')).toBeVisible({ timeout: 15000 })
}

test('e-Arşiv kartı önizlemede dönüşür ve Doğrulandı rozeti görünür', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  await loadFirstCard(page, 'e-Arşiv')
  await expect(page.getByText('Doğrulandı')).toBeVisible({ timeout: 10000 })
  expect(errors).toEqual([])
})

test('e-İrsaliye kartı önizlemede dönüşür ve Doğrulandı rozeti görünür', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  await loadFirstCard(page, 'e-İrsaliye')
  await expect(page.getByText('Doğrulandı')).toBeVisible({ timeout: 10000 })
  expect(errors).toEqual([])
})
```

Not: `Kurumsal` metni ilgili bölümde yoksa Step 1 çıktısındaki gerçek kart adına uyarlanır (yalnızca o `getByText` değişir).

- [ ] **Step 3: Yeni spec'i çalıştır**

Run: `npx playwright test e2e/docflows.spec.ts 2>&1 | tail -8`
Expected: `2 passed`

- [ ] **Step 4: Tüm e2e'yi çalıştır**

Run: `npm run test:e2e 2>&1 | tail -5`
Expected: exit 0, fail yok

- [ ] **Step 5: Commit**

```bash
git add e2e/docflows.spec.ts
git commit -m "test: e-Arşiv ve e-İrsaliye akış kapsamı ekle"
```

---

### Task 6: Linux AppImage hedefini ekle

**Files:**
- Modify: `electron-builder.yml` (win bloğu aynen korunur)

**Interfaces:**
- Consumes: Task 2'nin derlenebilir ağacı
- Produces: `release/` altında `.AppImage` çıktısı

- [ ] **Step 1: `linux` bloğunu ekle**

`electron-builder.yml` sonuna ekle (girinti 0, `nsis:` bloğunun hizasında):

```yaml
linux:
  target:
    - target: AppImage
      arch:
        - x64
  artifactName: ${productName}-Kurulum-${version}.${ext}
  category: Office
```

- [ ] **Step 2: Config'i ayrıştırma testiyle doğrula**

Run: `node -e "const fs=require('fs');const t=fs.readFileSync('electron-builder.yml','utf8');for(const k of ['target: nsis','target: AppImage','artifactName: \${productName}-Kurulum-\${version}.\${ext}'])if(!t.includes(k))throw new Error('eksik: '+k);console.log('config OK')"`
Expected: `config OK`

- [ ] **Step 3: Linux paketini üret**

Run: `npm run dist 2>&1 | tail -8`
Expected: `release/` altında `UNI Tasarım-Kurulum-0.3.4.AppImage` dosyası oluşur. (Süre uzundur; komut bitmeden Step 4'e geçilmez.)

- [ ] **Step 4: Commit (yalnızca yml)**

```bash
git add electron-builder.yml
git commit -m "chore: linux AppImage hedefi ekle"
```

Not: `release/` git'e eklenmez (derleme çıktısıdır).

---

### Task 7: Paket doğrulama scriptini platform + sürüm bağımsız yap

**Files:**
- Modify: `scripts/verify-packaged.cjs`

**Interfaces:**
- Consumes: Task 6'nın AppImage çıktısı
- Produces: Linux'ta çalışan duman testi (`node scripts/verify-packaged.cjs linux`)

- [ ] **Step 1: Başlangıç bloğunu parametreleştir**

Dosyanın `main()` öncesi kısmını şu hale getir (sabit exe yolu ve `v0.3.4` metni kalkar):

```js
const mode = process.argv[2] === 'linux' ? 'linux' : 'win'
const version = require('../package.json').version
const exe = mode === 'linux'
  ? path.join(__dirname, '..', 'release', 'linux-unpacked', 'uni-tasarim')
  : path.join(__dirname, '..', 'release', 'win-unpacked', 'UNI Tasarım.exe')
```

ve `waitForSelector('text=v0.3.4', ...)` satırındaki metni `` `text=v${version}` `` yap; başarı logundaki `v0.3.4` metnini `` `v${version}` `` yap.

- [ ] **Step 2: Linux duman testini çalıştır**

Run: `node scripts/verify-packaged.cjs linux`
Expected: sonunda `PAKET DOĞRULAMA: TAMAMI GEÇTİ` (Xvfb yoksa `xvfb-run` önekiyle çalıştır: `xvfb-run -a node scripts/verify-packaged.cjs linux`)

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-packaged.cjs
git commit -m "test: paket doğrulamayı platform ve sürüm bağımsız yap"
```

---

### Task 8: Windows regresyonunu derleme seviyesinde doğrula

**Files:** değişmez (doğrulama görevi)

**Interfaces:**
- Consumes: Task 6'da win bloğuna dokunulmadığı bilgisi
- Produces: `electron-vite build` yeşil kanıtı

- [ ] **Step 1: win bloğunun değişmediğini doğrula**

Run: `git diff main -- electron-builder.yml | grep -E "^[-] " | grep -v "^---" || echo "SILINEN SATIR YOK"`
Expected: `SILINEN SATIR YOK` (yalnızca ekleme yapılmış)

- [ ] **Step 2: Paketlemesiz derlemeyi çalıştır**

Run: `npm run build 2>&1 | tail -5`
Expected: exit 0, `out/` üretilir

- [ ] **Step 3: Sonucu kaydet (commit yok)**

Bu görev doğrulamadır; dosya değişikliği beklenmez, commit yapılmaz.

---

### Task 9: GİB doğrulaması — sentetik UBL-TR örnekleri + saxon hattı

**Files:**
- Create: `testdata/gib-ornekler/e-fatura.xml`, `testdata/gib-ornekler/e-arsiv.xml`, `testdata/gib-ornekler/e-irsaliye.xml`

**Interfaces:**
- Consumes: `src/renderer/src/samples/{faturaXml,arsivXml,irsaliyeXml}.ts` içindeki örnek gövdeler + `scripts/saxon-check.cjs` (`node scripts/saxon-check.cjs "<şablon klasörü>"`)
- Produces: 3 belge tipinde derleme + dönüşüm kanıtı

- [ ] **Step 1: Örnek XML'leri üret**

`src/renderer/src/samples/faturaXml.ts`, `arsivXml.ts`, `irsaliyeXml.ts` dosyalarındaki backtick-içi gövdeleri birebir alıp sırasıyla `testdata/gib-ornekler/e-fatura.xml`, `e-arsiv.xml`, `e-irsaliye.xml` olarak kaydet (Türkçe karakterler ve UBL-TR ad alanları aynen korunur).

- [ ] **Step 2: Şablon klasör yapısını doğrula**

Run: `grep -n "readdir\|readdirSync\|join(dir" scripts/saxon-check.cjs | head -5`
Expected: scriptin şablon klasöründen `*.xslt` dosyalarını okuduğu (`readdirSync` + `/\.xslt$/i`), her birini `xslt3` CLI ile derleyip `saxon-js` ile çalıştırdığı görülür.

- [ ] **Step 3: İki doğrulamayı çalıştır**

Doğrulama 1 (well-formedness):

```bash
python3 -c "import xml.dom.minidom, glob; [xml.dom.minidom.parse(f) for f in sorted(glob.glob('testdata/gib-ornekler/*.xml'))]; print('XML OK')"
```

Expected: `XML OK`

Doğrulama 2 (saxon hattı): yerleşik 9 şablonu (fatura/arsiv/irsaliye × kurumsal/sade/boş, `src/renderer/src/samples/templates/` fabrikalarından üretilir) geçici bir klasöre `.xslt` olarak döküp çalıştır:

Run: `node scripts/saxon-check.cjs "<şablon klasörü>"`
Expected: `9 başarılı, 0 hatalı / 9 şablon` (çıktıdaki `✓` satırları sayılır)

- [ ] **Step 4: Commit**

```bash
git add testdata/gib-ornekler/e-fatura.xml testdata/gib-ornekler/e-arsiv.xml testdata/gib-ornekler/e-irsaliye.xml
git commit -m "test: GIB dogrulamasi icin sentetik UBL-TR ornekleri ekle"
```

---

### Task 10: v0.4.0 sürüm hazırlığı

**Files:**
- Modify: `package.json` (`version`), `package-lock.json` (`version` alanları)
- Create: `CHANGELOG.md`

**Interfaces:**
- Consumes: Task 1-9'un yeşil durumu
- Produces: kuruluma hazır v0.4.0 adayı

**Ön koşul:** `scripts/verify-packaged.cjs` sürümü `package.json`'dan dinamik okur (Task 7), e2e'de sabit sürüm metni yoktur; sabit `0.3.4` metni kalırsa Step 1'de bulunur ve güncellenir.

- [ ] **Step 1: Sabit sürüm metni tara**

Run: `grep -rn "0\.3\.4" src e2e scripts index.html package.json 2>/dev/null || echo "SABIT SURUM YOK"`
Expected: ya `SABIT SURUM YOK` ya da bulunan her yerin listesi (bulunursa yalnızca sürüm metni `0.4.0` yapılır, başka değişiklik yok)

- [ ] **Step 2: Sürümü 0.4.0 yap**

`package.json` içinde `"version": "0.3.4"` → `"version": "0.4.0"`. `package-lock.json` içindeki kök `"version": "0.3.4"` ve `"packages": { "": { "version": "0.3.4"` alanlarını da el ile `0.4.0` yap (arborist çalıştırmadan; npm 10.9.8 `npm install` hatası verebilir, bu yüzden kilit dosyasına paket çözümü çalıştırılmaz).

Doğrulama:

Run: `node -e "console.log(require('./package.json').version, require('./package-lock.json').version, require('./package-lock.json').packages[''].version)"`
Expected: `0.4.0 0.4.0 0.4.0`

- [ ] **Step 3: CHANGELOG.md yaz**

Kök dizinde `CHANGELOG.md` oluştur, stabilize dalındaki işleri özetle:

```markdown
# Changelog

## 0.4.0 — 2026-09-13

Stabilizasyon sürümü: typecheck sıfır hata, 17 unit + 14 e2e yeşil, Linux AppImage
paketi eklendi, 3 belge tipinde GİB doğrulaması geçti.

- fix: bildirilmemiş çalışma-zamanı bağımlılıkları sabitlendi
- fix: İ harfi yüzünden e-Arşiv tür algısı e-Fatura'ya düşüyordu
- test: e-Arşiv ve e-İrsaliye akış kapsamı, sentetik UBL-TR örnekleri
- chore: linux AppImage hedefi, paket doğrulama platform/sürüm bağımsız
```

- [ ] **Step 4: Son doğrulama**

Run: `npm run typecheck && npm test 2>&1 | tail -4`
Expected: typecheck exit 0, `Tests 17 passed (17)`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: v0.4.0 surum hazirligi"
```