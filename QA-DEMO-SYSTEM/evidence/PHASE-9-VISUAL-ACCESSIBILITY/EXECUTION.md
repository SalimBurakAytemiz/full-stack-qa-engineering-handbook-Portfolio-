# PHASE 9 — Visual & Accessibility — Execution Evidence

**Branch:** `feat/phase-6-19-full-completion-campaign`
**Campaign statüsü:** CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT
**Tarih:** 2026-09-24

> Evidence Integrity: aşağıdaki tüm sayılar bu oturumda gerçekten
> çalıştırılan komutların gerçek çıktısıdır. Kesin base/head commit
> SHA'ları `.ai/PHASE-6-19-CAMPAIGN-STATE.md`'de ve bu paketi kapatan
> checkpoint commit mesajında belirtilir.

---

## 1. Kapsam (ROADMAP.md Phase 9) ve Karşılık Gelen Kanıt

### 1.1 Visual

| Kapsam maddesi | Kanıt | Not |
|---|---|---|
| Pixel Perfect | `visual-regression.spec.js` — login+products sayfası gerçek piksel karşılaştırması | Playwright'ın yerleşik `toHaveScreenshot()` (pixelmatch tabanlı) |
| Figma Comparison | **YOK — bkz. Bölüm 4** | Gerçek Figma dosyası/hesabı yok |
| Screenshot Comparison | `visual-regression.spec.js` | Baseline PNG'lere karşı gerçek karşılaştırma |
| Difference Visualization | `visual-regression.spec.js` (negatif kontrol testi) | Gerçek bir piksel farkının GERÇEKTEN yakalandığı kanıtlandı |
| Threshold / Tolerance | `visual-regression.spec.js` | `maxDiffPixelRatio: 0.01` (baseline testleri) vs. `0` (negatif kontrol) — bkz. Bölüm 3 |
| Visual Regression | `visual-regression.spec.js` (tüm dosya) | — |

### 1.2 Accessibility

| Kapsam maddesi | Kanıt | Not |
|---|---|---|
| Keyboard Navigation | `accessibility.spec.js` — Tab sırası + yalnızca klavyeyle tam form submit | — |
| Focus | `accessibility.spec.js` — `toBeFocused()` ile her adımda gerçek DOM focus doğrulaması | — |
| Accessibility Labels | `accessibility.spec.js` — `toHaveAccessibleName()` (gerçek accessible-name hesaplaması) | — |
| Screen Reader controls | **Kısmi — bkz. Bölüm 4** | ARIA/accessible-name (ekran okuyucuların dayandığı gerçek mekanizma) test edildi; gerçek NVDA/VoiceOver YAZILIMI çalıştırılmadı |
| Contrast | `accessibility.spec.js` — axe-core `color-contrast` kuralı | Gerçek CSS renkleri üzerinden |
| WCAG concepts | `accessibility.spec.js` — axe-core `wcag2a`+`wcag2aa` tag'leri, tüm sayfalarda | — |

---

## 2. Yeni Dependency — `@axe-core/playwright`

- **Versiyon:** `^4.13.0` (gerçekte kurulan: 4.13.0), yalnızca
  `devDependency`.
- **Lisans:** MPL-2.0 (dosya-seviyesi copyleft) — bu proje axe-core'un
  kendi kaynak dosyalarını DEĞİŞTİRMEDEN, yalnızca bir test bağımlılığı
  olarak (dağıtılan bir üründe değil) kullanır; bu kullanım şeklinde
  MPL-2.0 riski yoktur.
- **Gerekçe:** Endüstri standardı, otomatik WCAG kural motoru — gerçek
  bir WCAG taraması için pratik alternatif yoktur (elle yazılmış ARIA
  kontrolleri axe-core'un kapsadığı yüzlerce kuralın küçük bir alt
  kümesini kapsayabilirdi).
- **Güvenlik:** `npm install` sonrası `0 vulnerability` (aynı
  `npm audit` sonucu, ayrı bir tarama gerekmedi).
- **Bağımlılık artışı:** `@axe-core/playwright` + kendi `axe-core`
  transitive dependency'si — küçük, resmi paket zinciri.

---

## 3. Gerçek Test Çalıştırmaları

### 3.1 İlk çalıştırma (baseline'lar henüz yoktu — beklenen davranış)

```
$ npx playwright test
...
  6/6 accessibility testleri PASS (axe-core GERÇEKTEN 0 violation buldu — bastırılmadı)
  2 visual-regression testi FAIL: "A snapshot doesn't exist ... writing actual."
  1 negatif-kontrol testi: "Expected to fail, but passed" (baseline henüz yoktu, karşılaştırma hiç olmadı)
```

### 3.2 Baseline oluşturma (tek seferlik, standart Playwright akışı)

```
$ npx playwright test tests/visual-regression.spec.js --grep "matches its baseline" --update-snapshots
2 passed
```
Oluşan dosyalar (repoya commit edildi — bunlar golden reference
görüntüleridir, tesadüfi üretilen artifact DEĞİLDİR, bkz.
`visual-regression.spec.js` dosya başı yorumu):
- `tests/visual-regression.spec.js-snapshots/login-page-chromium-linux.png` (11.9 KB)
- `tests/visual-regression.spec.js-snapshots/products-page-chromium-linux.png` (27.2 KB)

### 3.3 Baseline sonrası tam suite (3 ardışık çalıştırma, flaky olmadığı doğrulandı)

```
$ npx playwright test   # run 1: 23 passed (9.3s)
$ npx playwright test   # run 2: 23 passed (9.2s)
$ npx playwright test   # run 3: 23 passed (9.3s)
```
(Negatif-kontrol testi her üç çalıştırmada da per-test satırda `✘`
görünür — bu GERÇEKTEN başarısız olduğu, ancak `test.fail()` ile
"başarısız olması beklenen" olarak işaretlendiği için genel sonucu
PASS'e çevirdiği anlamına gelir; bkz. Bölüm 5.)

### 3.4 Tam backend regresyonu

```
$ node --test tests/**/*.test.js tests/*.test.js
tests 111, pass 111, fail 0
```

---

## 4. Dürüst Sınıflandırma — Uygulanmayan Alt-Maddeler

**Figma Comparison:** Bu ortamda gerçek bir Figma dosyası, tasarım
export'u veya Figma hesabı YOKTUR. Sahte/rastgele bir "tasarım"
görüntüsü üretip ona karşı karşılaştırma yapmak yanıltıcı olurdu (gerçek
bir tasarım kaynağını temsil etmez). **Sınıflandırma: LEARNING-only,
NOT TESTED, BLOCKER DEĞİL** — kavramsal olarak: gerçek bir projede bu,
Figma'nın REST API'si veya export edilmiş PNG'leri üzerinden
`toHaveScreenshot()`'a benzer bir piksel-karşılaştırma akışıyla
yapılırdı; bu proje bunun yerine kendi geçmiş çalıştırmalarına karşı
(baseline'lar) karşılaştırma yapar, bu da "Screenshot Comparison" /
"Visual Regression" maddelerini tam olarak kanıtlar.

**Screen Reader controls (yazılım kısmı):** Gerçek NVDA/VoiceOver gibi
ekran okuyucu yazılımları bu headless container'da çalıştırılamaz
(GUI/ses çıktısı gerektirir). Bunun yerine, bu yazılımların TAM OLARAK
dayandığı temel mekanizma — accessible name hesaplaması
(`label[for]`→input eşleşmesi, ARIA) — `toHaveAccessibleName()` ile
GERÇEKTEN test edildi. **Sınıflandırma:** mekanizma seviyesinde TESTED,
gerçek yazılım-okuma seviyesinde LEARNING-only.

---

## 5. Self-Review Sırasında Bulunan ve Düzeltilen Sorun

| # | Sorun | Düzeltme |
|---|---|---|
| 1 | Negatif-kontrol testi (login sayfasını products-page.png baseline'ına karşı kasıtlı yanlış karşılaştırma) ilk denemede `maxDiffPixelRatio: 0.01` ile "Expected to fail, but passed" verdi — çünkü iki sayfanın farklı içeriği, büyük paylaşılan boş arkaplan (`max-width:480px` kart + geniş viewport) içinde TOPLAM piksellerin %1'inden AZ bir fark oluşturuyordu; bu gerçek bir false-negative riskiydi, test hatası değil | Negatif-kontrol karşılaştırması için tolerans `0`'a çekildi (yalnızca bu testte — baseline testlerinin kendi toleransı `0.01` olarak KALDI); ardından negatif kontrol beklendiği gibi gerçekten başarısız oldu (`test.fail()` ile bu doğru şekilde genel PASS'e çevrildi) |

Bu, "Difference Visualization gerçekten çalışıyor mu?" sorusunu ciddiye
alan bir kendi-kendini-doğrulama örneğidir — ilk yazılan tolerans
değeri sessizce YANLIŞ pozitif üretebilirdi, bu bulunup düzeltildi.

---

## 6. Güvenlik / Secret / Generated-Artifact Taraması

```
$ git status --short
 M QA-DEMO-SYSTEM/package-lock.json
 M QA-DEMO-SYSTEM/web-tests/package.json
?? QA-DEMO-SYSTEM/web-tests/tests/accessibility.spec.js
?? QA-DEMO-SYSTEM/web-tests/tests/visual-regression.spec.js
?? QA-DEMO-SYSTEM/web-tests/tests/visual-regression.spec.js-snapshots/
```
- `test-results/` (trace/screenshot çıktıları) doğrulandı: `.gitignore`
  kapsamında, commit edilmedi.
- Baseline PNG'ler kasıtlı olarak commit edildi (Bölüm 3.2) — bunlar
  testin kendisinin bir parçasıdır, tesadüfi artifact değildir.
- Yeni dosyalarda secret/token/credential literal YOK.
- `package-lock.json` diff'i yalnızca `@axe-core/playwright` +
  `axe-core` eklenmesiyle sınırlı.

---

## 7. Bilinen Sınırlamalar (Known Limitations, Blocker DEĞİL)

1. Figma Comparison — Bölüm 4.
2. Screen Reader controls (gerçek yazılım okuma) — Bölüm 4.
3. Görsel regresyon baseline'ları yalnızca Chromium için üretildi
   (Phase 8'in Cross-Browser sınırlamasıyla aynı gerekçe — Firefox/
   WebKit bu ortamda yok).
4. Notification-list alanı visual regression'da kasıtlı olarak
   maskelendi (dinamik içerik) — bu bölgedeki gerçek bir görsel
   regresyon bu testle YAKALANMAZ; bu bilinçli bir kapsam sınırıdır,
   diğer testler (Phase 6 WS Payload Validation) bu alanın veri
   doğruluğunu zaten ayrı olarak kapsar.

---

## 8. Açık Blocker Sayısı: **0**

## 9. Sonuç

Phase 9 kapsamındaki 12 ROADMAP maddesinden 10'u gerçek testle
kanıtlandı (axe-core: 0 gerçek violation, bastırılmadı; visual
regression: gerçek baseline + gerçek negatif-kontrol ile "differences
GERÇEKTEN yakalanıyor" kanıtlandı), 2'si (Figma Comparison, gerçek
ekran-okuyucu yazılımı) dürüstçe LEARNING-only olarak sınıflandırıldı.
Suite 3 ardışık çalıştırmada 23/23 yeşil (flaky değil). Tam backend
regresyonu 111/111. Açık blocker: 0.

**Statü: CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT.**
