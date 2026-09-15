# P4.5 — Run Documentation & Smoke Validation — Execution Record

> Bu doküman, QA Demo System'in **temiz bir ortamdan**, yalnızca
> repository içindeki resmi `RUN-INSTRUCTIONS.md` ve
> `SMOKE-CHECKLIST.md` dokümantasyonu takip edilerek kurulup
> çalıştırılabildiğini ve smoke checklist'in gerçekten geçtiğini
> kanıtlayan P4.5 execution kaydıdır. Bu paket yeni bir feature
> geliştirme paketi değildir.

---

## 1. Execution Ortamı

| Alan | Değer |
|---|---|
| Tarih/Saat (UTC) | 2026-09-15, 20:39–21:23 arası (ilk run 20:39 UTC, ikinci reproducibility run'ı dahil) |
| Branch | `feat/phase-4-5-run-documentation-smoke` |
| Base Commit | `fe0b65c9d25610cc49884e2964d25831ac415371` (main, P4.4 merge sonrası) |
| Node.js | v22.22.2 |
| Kullanılan dokümantasyon (source of truth) | `QA-DEMO-SYSTEM/docs/RUN-INSTRUCTIONS.md`, `QA-DEMO-SYSTEM/docs/SMOKE-CHECKLIST.md` (bu paket kapsamında oluşturuldu) |

---

## 2. Temiz Başlangıç Koşulları

Silinen path'ler önce `git ls-files` ile **tracked olmadığı**
doğrulanarak silindi (bkz. `.gitignore`: `node_modules/`,
`backend/data/`):

```text
$ git ls-files node_modules backend/node_modules backend/data
(boş — hiçbiri tracked değil)
```

Silinen: `QA-DEMO-SYSTEM/node_modules/`,
`QA-DEMO-SYSTEM/backend/data/`. Silme sonrası `git status` hâlâ
`nothing to commit, working tree clean` gösterdi — hiçbir tracked
source dosyası etkilenmedi.

---

## 3. RUN-INSTRUCTIONS Sonucu

`RUN-INSTRUCTIONS.md`'deki adımlar birebir, ek/gizli adım eklenmeden
uygulandı:

| Adım | Dokümante Edilen Komut | Sonuç |
|---|---|---|
| Kurulum | `cd QA-DEMO-SYSTEM && npm install` | **PASS** — hatasız, "0 vulnerabilities" (bkz. `logs/npm-install-output.txt`) |
| Çalıştırma | `npm run dev` | **PASS** — dokümante edilen log satırıyla birebir eşleşti: `"QA Demo System backend http://localhost:3000 adresinde çalışıyor."` (bkz. `logs/first-run-server-log.txt`) |
| Database auto-init/seed | (otomatik, `backend/data/qa-demo.db` yoktu) | **PASS** — 2 kullanıcı, 4 ürün otomatik seed edildi |

**Dokümantasyonda çalışmayan komut bulunmadı.**

---

## 4. Dependency Install Sonucu

`npm install` → **PASS**, 70 paket, 0 vulnerability (bkz.
`logs/npm-install-output.txt`).

## 5. Database Initialization Sonucu

`npm run dev` ilk çalıştırıldığında `backend/data/qa-demo.db`
otomatik oluşturuldu, şema kuruldu, `users`/`products` tabloları
`shared/test-data/` kaynağından seed edildi — **PASS**.

## 6. Application Startup Sonucu

Backend `http://localhost:3000` üzerinde ayağa kalktı, frontend aynı
port üzerinden statik olarak servis edildi, WebSocket `/ws` endpoint'i
hazır — **PASS**.

---

## 7. Environment Readiness

| Kontrol | Sonuç |
|---|---|
| Backend reachable | PASS — `GET /api/health` → `200` `{"status":"ok"}` |
| Frontend reachable | PASS — `GET /` → `200` |
| SQLite ready | PASS — `users`: 2, `products`: 4 |
| Seed loaded | PASS |
| WebSocket ready | PASS — geçerli token ile bağlantı açıldı |

**Genel Sonuç: READY**

---

## 8. Smoke Checklist Sonuçları

Kaynak: `QA-DEMO-SYSTEM/docs/SMOKE-CHECKLIST.md`. Ham çıktı:
`logs/smoke-checklist-results.txt`.

### AUTHENTICATION

| ID | Sonuç | Detay |
|---|---|---|
| AUTH-01 valid login | **PASS** | `200` + token |
| AUTH-02 invalid password | **PASS** | `401` + `"Email veya şifre hatalı"` |
| AUTH-03 unknown user | **PASS** | `401` + aynı genel mesaj |

### PRODUCTS

| ID | Sonuç | Detay |
|---|---|---|
| PROD-01 product list | **PASS** | `200`, 4 ürün, biri `in_stock:false` |
| PROD-02 stock data | **PASS** | `200`, doğru `stock_quantity`/`in_stock` |

### ORDERS

| ID | Sonuç | Detay |
|---|---|---|
| ORD-01 unauthenticated order | **PASS** | `401` |
| ORD-02 approved order | **PASS** | `201` + `PAID`; stok 25→23 |
| ORD-03 declined order | **PASS** | `201` + `PAYMENT_FAILED`; stok değişmedi (5) |
| ORD-04 timeout order | **PASS** | `201` + `PAYMENT_TIMEOUT`; stok değişmedi (12) |
| ORD-05 stock integrity | **PASS** | `409` (stoktan fazla adet) |

### NOTIFICATIONS / EVENTS

| ID | Sonuç | Detay |
|---|---|---|
| NOTIF-01 PAID → notification | **PASS** | `200`, `type:"order.paid"` içeren kayıt |
| NOTIF-02 anonymous access | **PASS** | `401` |
| NOTIF-03 cross-user access | **PASS** | user2 için `0` notification |
| NOTIF-04 WebSocket realtime delivery | **PASS** | bağlı client mesajı gerçek zamanlı aldı |
| NOTIF-05 declined/timeout → event/notification yok | **PASS** | NOTIF-01'de PAID+DECLINED+TIMEOUT sıralı çalıştırıldıktan sonra toplam **1** notification (yalnızca PAID sipariş için) — declined/timeout hiçbir kayıt üretmedi |

### SECURITY / AUTHORIZATION

| ID | Sonuç | Detay |
|---|---|---|
| SEC-01 cross-user order access | **PASS** | `404` |
| SEC-02 forged/invalid token | **PASS** | `401` |
| SEC-03 anonymous protected endpoint | **PASS** | `401` (ORD-01 ve NOTIF-02 ile kanıtlandı) |
| SEC-04 WebSocket invalid token | **PASS** | bağlantı `401` ile reddedildi |

### FRONTEND

| ID | Sonuç | Detay |
|---|---|---|
| FE-01 login page | **PASS** | `200`, `login-form` mevcut |
| FE-02 products page | **PASS** | `200`, `product-list` mevcut |
| FE-03 notification UI | **PASS** | `notification-list` mevcut, bozulmamış |
| FE-04 gerçek tarayıcı akışı | **PASS** | Gerçek Chromium (Playwright) ile login→products akışı çalıştırıldı; ürünler ve notification'lar gerçekten render edildi (bkz. `screenshots/fe-02-products-with-notifications.png`) |

### Toplam

**24/24 PASS, 0 FAIL, 0 BLOCKED, 0 NOT APPLICABLE.**

---

## 9. Bulunan Documentation Gap'leri

3 doküman doğruluğu sorunu bulundu ve **yalnızca gerçek execution ile
kanıtlandığı için** düzeltildi (`RUN-INSTRUCTIONS.md`):

1. **Kapsam ifadesi güncel değildi:** Dosya girişi hâlâ "P4.1 (Demo
   Application Skeleton) kapsamındaki sistem" diyordu; içerik P4.2
   (Orders) ve P4.3 (Notifications) endpoint'lerini de kapsıyordu.
   Düzeltildi: P4.1–P4.3 kümülatif kapsam olarak güncellendi.
2. **"Database Reset" bölümü eksikti:** Yalnızca `users`/`products`
   tablolarının temizlendiği yazıyordu; gerçek `seed.js` kodu
   (P4.2/P4.3'te güncellenmiş) `sessions`, `orders`, `order_items`,
   `events`, `notifications` tablolarını da temizliyor. Düzeltildi.
3. **"Smoke Doğrulama Adımları" başlığı yanıltıcıydı:** "P4.1
   kapanışında ... doğrulanmıştır" diyordu, ama liste P4.2/P4.3
   adımlarını da içeriyordu (madde 10–21). Düzeltildi: hangi paket
   hangi maddeleri kapsıyor açıkça belirtildi, ve bu paketin ürettiği
   `SMOKE-CHECKLIST.md`'ye referans eklendi.

Bunların dışında (prerequisite, path, command doğruluğu, test
kullanıcı bilgileri, endpoint listesi) **gerçek execution ile
kanıtlanan başka bir gap bulunmadı** — bkz. bölüm 10.

---

## 10. Documentation Validation — Sorular

| Soru | Cevap |
|---|---|
| Yeni kullanıcı tek başına anlayabilir mi? | Evet — kurulum, çalıştırma, reset, test kullanıcıları, endpoint'ler, sınırlamalar sırayla ve net anlatılmış |
| Eksik prerequisite var mı? | Hayır — Node.js sürüm şartı doğru ve gerçek execution ile uyumlu (v22.22.2 çalıştı) |
| Yanlış path var mı? | Hayır — `cd QA-DEMO-SYSTEM && npm install` doğru çalıştı |
| Yanlış command var mı? | Hayır — `npm install`, `npm run dev`, `npm run db:seed`, `npm test` hepsi dokümante edildiği gibi çalıştı |
| Database reset açık mı? | Şimdi evet (bölüm 9, madde 2 ile düzeltildi) |
| Test user bilgileri açık mı? | Evet — email/password/status tablosu net |
| Startup/shutdown anlatılmış mı? | Startup evet; shutdown standart `Ctrl+C`/process sonlandırma davranışı olduğu ve gerçek execution bunu bir sorun olarak kanıtlamadığı için ayrıca belgelenmedi |
| Smoke çalıştırma anlatılmış mı? | Şimdi evet — `SMOKE-CHECKLIST.md`'ye referans eklendi (bölüm 9, madde 1 ve 3) |

---

## 11. Bulunan Runtime Bug'ları

**Yok.** Smoke checklist'in 24 maddesinin tamamı ilk denemede PASS
oldu; hiçbir APPLICATION BUG, ENVIRONMENT BUG veya TEST
INFRASTRUCTURE BUG bulunmadı. Bulunan 3 konu (bölüm 9) yalnızca
DOCUMENTATION BUG kategorisindeydi ve düzeltildi.

---

## 12. Reproducibility

Temiz kurulum + startup akışı **iki kez** çalıştırıldı (tam smoke
checklist'i değil — yalnızca kurulum/startup/temel doğrulama, gereksiz
tekrar tam test suite'inden kaçınmak için):

- **1. Run:** Port 3000, tam smoke checklist (bölüm 8).
- **2. Run:** Temiz `rm -rf node_modules backend/data` sonrası, Port
  3111, `npm install` + doğrudan `node backend/src/server.js` →
  health check, valid login, ve **ürün seed verisi birebir aynı**
  (aynı ID'ler, fiyatlar, stoklar — bkz.
  `logs/second-run-reproducibility-server-log.txt`).

**Sonuç: Aynı repository + aynı talimatlar = aynı çalışan sistem.
Reproducibility PASS.**

---

## 13. Regression (Smoke Seviyesi)

Yeni feature eklenmedi. P4.1–P4.3'ün smoke seviyesinde bozulmadığı
hem manuel smoke checklist'i (bölüm 8) hem de mevcut otomatik test
suite'inin tek seferlik çalıştırılmasıyla doğrulandı (bkz.
`logs/npm-test-output.txt`):

| Paket | Sonuç |
|---|---|
| P4.1 Authentication + Products | **PASS** |
| P4.2 Orders + Payment | **PASS** |
| P4.3 Events + Notifications | **PASS** |
| P4.4 evidence/history | **Korunuyor** — `QA-DEMO-SYSTEM/evidence/BUG-AUTH-EDU-001/` ve `06-DEFECT-MANAGEMENT/` bu paket kapsamında hiç dokunulmadı |

**Otomatik test suite: 72/72 PASS, 0 FAIL.**

---

## 14. Final Status

## **PASS**

QA Demo System, temiz bir ortamdan yalnızca resmi
`RUN-INSTRUCTIONS.md` dokümantasyonu takip edilerek başarıyla
kurulmuş ve çalıştırılmıştır. 24 maddelik smoke checklist'in tamamı
gerçek sistem üzerinde PASS almıştır. Reproducibility iki bağımsız
çalıştırmayla doğrulanmıştır. 3 dokümantasyon doğruluğu sorunu
bulunmuş ve düzeltilmiştir; hiçbir uygulama/runtime bug'ı
bulunmamıştır.
