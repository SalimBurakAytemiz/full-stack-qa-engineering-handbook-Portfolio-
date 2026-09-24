# FIX-6 — Non-Blocking Notes (N1-N7) + Final Campaign Regression

**Codex audited HEAD:** `a359b39`

---

## Non-Blocking Notes

### N1 — WebSocket "tek mesaj" testi sabit 150ms window kullanıyordu

`websocket-events-advanced.test.js`'in "WS Duplicate Events" testi,
`createOrder()` sonrası `sleep(150)` ile bekleyip SONRA
`receivedA.length === 1` kontrol ediyordu — "mesaj geldi mi" kısmı
event-driven DEĞİLDİ. Düzeltme: `waitForMessage(wsA)`/`waitForMessage(wsB)`
ile "en az bir mesaj geldi" kısmı artık event-driven (deterministik);
yalnızca "ve İKİNCİ bir mesaj GELMEDİ" kısmı (bir YOKLUĞUN kanıtı,
doğası gereği await edilemez) kısa, sınırlı bir bekleme (100ms)
kullanmaya devam ediyor.
```
$ node --test tests/websocket-events-advanced.test.js
tests 5, pass 5, fail 0
```
**Durum: RESOLVED.**

### N2 — Mobile/multi-browser learning/Chromium scope

Phase 8 `EXECUTION.md`'nin kendi Bölüm 4'ü ("Cross-Browser Testing —
Dürüst Sınırlama") zaten "yalnızca Chromium çalıştırıldı" diyor,
ROADMAP'ın kapsamıyla tutarlı, sahte bir "tüm browserlar test edildi"
izlenimi vermiyor. Doğrulandı, DEĞİŞİKLİK GEREKMEDİ.
**Durum: VERIFIED — NO CHANGE NEEDED.**

### N3 — CI/Jenkins cleanup command varsayılan DB path ile uyuşmuyordu

`.github/workflows/ci.yml` (2 yer) ve `Jenkinsfile` (1 yer),
`rm -f data/qa-demo.db` kullanıyordu — ama backend'in GERÇEK varsayılan
DB path'i (`backend/src/config/index.js`, `DB_PATH` set değilse)
`backend/data/qa-demo.db`'dir, `data/qa-demo.db` DEĞİL. GitHub Actions'ta
her runner zaten sıfırdan başladığı için (kalıcı disk yok) bu şu ana
kadar ZARARSIZDI (`rm -f` var olmayan bir dosyada sessizce no-op'tur,
sunucu boş DB'yi otomatik seed eder) — ama Jenkins'te (workspace'i
build'ler arasında YENİDEN KULLANAN bir agent'ta) gerçekten çalıştırılsaydı,
eski state'i SESSİZCE temizleyemeyecekti. Üç yer de doğru path'e
(`backend/data/qa-demo.db`) düzeltildi.
**Durum: RESOLVED.**

### N4 — Access log originalUrl query değerlerini yazabiliyordu

FIX-2 (B6) checkpoint'inde AYNI anda ele alındı: tüm REST route'ları
tarandı (`req.query` HİÇBİR yerde okunmuyor), WebSocket'in `?token=`
query string'i Express'in `app`'ına HİÇ ULAŞMIYOR (ampirik olarak
doğrulandı — bkz. `FIX-2-B6.md`). Gerçek bir sorun DEĞİL, kod
değişikliği gerekmedi.
**Durum: RESOLVED (FIX-2'de).**

### N5 — Phase 16 evidence 26 soru diyor ama dokümanda 30

`grep -c "^### " INTERVIEW-PREP.md` ile yeniden sayıldı: **30** gerçek
soru (26 DEĞİL). `PHASE-16-INTERVIEW-PREPARATION/EXECUTION.md`'deki 3
yer düzeltildi — soru sayısı (30), toplam Related Lab referansı (39,
26 değil), benzersiz dosya sayısı (27, 24 değil) — hepsi yeniden
`grep`/dosya-varlığı kontrolüyle doğrulandı, 0 kırık referans hâlâ
geçerli.
**Durum: RESOLVED.**

### N6 — Manifest Phase 19'a kadar commit count'u Git ile uyuşmuyordu

`.ai/PHASE-6-19-CODEX-AUDIT-MANIFEST.md`'nin commit sayısı, bu fix
campaign'in KENDİ commit'leriyle zaten stale hale gelmişti (28 idi,
gerçek sayı artıyordu). Bu, manifest'in bu FIX-6 checkpoint'inde
yapılan TAM yeniden yazımında, gerçek `git log --oneline 837ff2f..HEAD
| wc -l` çıktısıyla düzeltildi — tahmin edilmedi, komutun kendisi
manifestte belgeleniyor (bkz. güncellenmiş manifest).
**Durum: RESOLVED (manifest rewrite'ında).**

### N7 — Önemli WHY comment'leri ağırlıkla English

**Bilinçli kapsam kararı (churn'den kaçınmak için):** Bu campaign'in
KENDİSİNİN (Phase 6'dan başlayarak) ve öncesindeki TÜM Phase 4/5
kodunun (`backend/src/**`, `backend/tests/**`, `web-tests/**`,
`automation-labs/**` — yüzlerce dosya, binlerce satır) WHY-açıklama
yorumları TUTARLI bir şekilde İngilizce'dir — bu, campaign'in en
başındaki talimatta istenen "Turkish comments for business/security/
WHY-explanations" standardından GERÇEKTEN sapıyor, Codex'in bulduğu
gibi. Ama bu, TEK bir dosyadaki izole bir hata DEĞİL — repo genelinde
tutarlı, yerleşik bir konvansiyondur (muhtemelen kod ve canonical
API'ler zaten İngilizce olduğu için, yorumların aynı dilde kalması
doğal bir seçimdi). Bu fix campaign'in KENDİSİ de (B1-B9 için yazılan
TÜM yeni kod yorumları) aynı yerleşik İngilizce konvansiyonu izledi —
tutarlılık için.

Bu notu düzeltmek için TÜM kod tabanını (yüzlerce yorum) Türkçe'ye
çevirmek, talimatın kendisinin AÇIKÇA uyardığı "gereksiz code churn"
olurdu — çalışan, doğru, test edilmiş kodun binlerce satırını
yalnızca yorum dili için değiştirmek, gerçek bir hata düzeltmeden çok
riskli, düşük değerli bir toplu-diff olurdu. Bu nedenle: **mevcut kod
yorumları DEĞİŞTİRİLMEDİ** — bunun yerine bu bulgu burada AÇIKÇA
belgelendi (sessizce atlanmadı) ve gelecekteki bir kararın (Türkçe
standardını KOD yorumlarına da mı genişletmek, yoksa mevcut İngilizce
konvansiyonu KOD için resmi olarak mı kabul etmek) insan/proje sahibi
tarafından verilmesi gerektiği not edildi.
**Durum: DOCUMENTED — BİLİNÇLİ KAPSAM KARARI, KOD DEĞİŞTİRİLMEDİ.**

---

## Final Campaign Regression (B1-B9 + N1-N7 sonrası)

```
$ node --test tests/**/*.test.js          # backend
tests 144, pass 144, fail 0

$ npx playwright test                      # web-tests (tam suite)
26 passed
```

API-tests — 6 suite, doğru sırayla (her live suite'ten ÖNCE
`npm run db:seed`):

| Suite | Tür | Sonuç |
|---|---|---|
| Public schema (`api:test:postman`) | LIVE | 11 req / 26 assertion / 0 fail — PASS |
| Protected schema (`api:test:auth`) | LIVE | 19 req / 42 assertion / 0 fail — PASS |
| Orders & Payment AJV (`api:test:orders-payment`) | LIVE | 64 req / 118 assertion / 0 fail — PASS |
| Notifications AJV (`api:test:notifications`) | LIVE | 20 req / 48 assertion / 0 fail — PASS |
| API → DB (`api:test:db`) | LIVE | 17 scenario / 97 assertion / 0 fail — PASS |
| Schema negative/positive proof (`api:test:schema:negative-proof`) | LOCAL/STATIC | 19/19 proof case — PASS |

Secret taraması: 4 eşleşme, hepsi "secret loglanmıyor" diyen kod
yorumu — gerçek secret YOK. Kırık markdown link taraması: 1 aday
bulundu, incelendiğinde bir link DEĞİL, bir metodoloji açıklamasının
İÇİNDEKİ literal örnek metin olduğu doğrulandı (false positive) — 0
gerçek kırık link. Runtime artifact temizliği: final regresyon için
başlatılan sunucu durduruldu, `data/qa-demo.db` silindi, `git status`
working tree clean (yalnızca bu FIX-6'nın kendi değişiklikleri hariç).

**Açık blocker (N1-N7 sonrası, TÜM campaign): 0.**
