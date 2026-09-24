# PHASE 18 — CLAUDE SELF-AUDIT

## ⚠️ BU BİR BAĞIMSIZ ÜÇÜNCÜ-TARAF İNCELEME DEĞİLDİR

Bu doküman, campaign'in başında (bkz.
`.ai/PHASE-6-19-CAMPAIGN-STATE.md`, "Phase 18 — Independent Review
netliği" bölümü) açıkça netleştirildiği gibi, **Claude'un (bu
campaign'in kendi uygulayıcısının) kendi kodunu ve evidence'ını
gözden geçirmesidir** — ROADMAP.md'nin Phase 18'i olan gerçek
"Repository bağımsız reviewer tarafından incelenecektir" maddesinin
YERİNE GEÇMEZ. Gerçek bağımsız inceleme, bu campaign'in TAMAMI
bittikten sonra yapılacak asıl Codex audit'i ile sağlanacaktır. Bu
dosya hiçbir zaman "independently verified" veya "Codex reviewed"
olarak sunulmamalıdır.

**Tarih:** 2026-09-24
**Kapsam:** ROADMAP Phase 18'in review kapsamı — Technical correctness,
QA correctness, Architecture, Test quality, Documentation, Security,
Maintainability, **False evidence**, **Unsupported experience claims**
— Phase 6-17'nin tüm çıktısına uygulandı.

> **[SONRADAN EKLENEN NOT — Codex fix-campaign, "Phase 18 self-audit
> gerçekten açık blockerları yakalıyor mu" sorusuna dürüst cevap]**
> HAYIR — bu self-audit, Codex'in bulduğu 9 blocker'dan (B1-B9)
> HİÇBİRİNİ yakalamadı: GraphQL→WebSocket push eksikliği (B1),
> Docker path uyuşmazlığı (B7), yanlış-adlandırılmış UI→DB testi (B2),
> gevşek visual tolerance (B3), Selenium/JMeter'ın overclaim'li
> statüsü (B4/B5), malformed-JSON request-id boşluğu (B6), case-study
> overclaim'leri (B8), live/static karışıklığı (B9) — bunların HİÇBİRİ
> bu self-audit'in Bölüm 2-4'ünde tespit EDİLMEDİ. Bu, sonucun
> KENDİSİNİN (yukarıdaki paragrafta zaten AÇIKÇA itiraf edildiği gibi)
> "bağımsız inceleme YERİNE GEÇMEZ" ifadesinin somut, ölçülmüş
> kanıtıdır — kör noktalar GERÇEKTİ ve yalnızca gerçek bir dış
> bakış açısıyla (Codex) bulunabildi. Bu dosyanın aşağıdaki içeriği
> tarihsel kayıt olarak KORUNMUŞTUR; "Açık blocker: 0" sonucu bu not
> ile birlikte okunmalıdır — o an self-audit'in KENDİ GÖREBİLDİĞİ
> kapsamda doğruydu, ama kapsamın kendisi eksikti.

---

## 1. Yöntem

Phase 17'nin mekanik tutarlılık kontrollerinin (broken links, CI,
regresyon, secret scan) ÜZERİNE, bu fazda RİSK-ODAKLI, eleştirel bir
kod/kanıt incelemesi yapıldı: en yüksek-riskli yeni kodun (GraphQL
katmanı, güvenlik testleri, auth middleware) yeniden okunması ve
"bu gerçekten iddia edildiği gibi mi çalışıyor" sorusunun ampirik
olarak (kod okuyarak DEĞİL, GERÇEKTEN çalıştırarak) yeniden
sorulması.

---

## 2. GERÇEK BULGU #1 (Bulundu ve Düzeltildi) — GraphQL Hata Mesajı Maskeleme Eksikliği

### Bulgu

`src/graphql/index.js`'in orijinal (Phase 6) implementasyonu, REST
tarafının `errorHandler.js`'sinin uyguladığı "beklenmeyen hatalarda
genel mesaj döndür" disiplinini GraphQL tarafında UYGULAMIYORDU.
Beklenmeyen bir dahili exception (örn. ham bir DB driver hatası),
mesajını OLDUĞU GİBİ istemciye sızdırabilirdi.

### Doğrulama (Ampirik)

```
$ node -e "... graphql({schema, source:'{crash}', rootValue:{crash:()=>{throw new Error('deliberate unexpected crash')}}}) ..."
{
  "errors": [{ "message": "deliberate unexpected crash", ... }]
}
```
`graphql@17.0.2`'nin varsayılan davranışı, resolver hatasının ham
`message`'ını doğrudan yanıta koyuyor (eski graphql-js sürümlerindeki
"NODE_ENV != production'da stacktrace ekle" davranışı bu sürümde
YOK — bu da ayrıca doğrulandı — ama mesajın kendisi hâlâ maskelenmiyor).

### Gerçek İstismar Edilebilirlik

Mevcut resolver setinde bu ŞU AN erişilebilir bir yol DEĞİL — şema
seviyesi tip zorlaması (`Int!`/`String!`) ve servis-katmanı
validasyonu, malformed girdiyi bir resolver'a ulaşmadan ÖNCE
reddediyor. Ama yapısal boşluk GERÇEKTİ ve gelecekte eklenecek bir
resolver'da kolayca istismar edilebilir hale gelebilirdi.

### Düzeltme

`maskUnexpectedErrors()` fonksiyonu eklendi: yalnızca (a) bir `path`'i
olan (yani execution-fazında oluşan, validation-fazında DEĞİL) VE (b)
bilinen bir `extensions.code`'u (UNAUTHENTICATED/BAD_REQUEST) OLMAYAN
hatalar genel `Sunucu hatası` mesajıyla değiştiriliyor. Validation
hataları (örn. "Cannot query field") ASLA maskelenmiyor — bunlar
`path` taşımaz, standart ve güvenli GraphQL protokol mesajlarıdır.

**Bu ayrımın KENDİSİ de ampirik olarak doğrulandı** (validation
hatalarının gerçekten `path` taşımadığı, `node -e` ile doğrudan test
edildi) — varsayılmadı.

### Test Kanıtı

`tests/graphql-error-masking.test.js` (7 yeni test): 4 unit test
(`maskUnexpectedErrors` fonksiyonunun kendisi, gerçek `GraphQLError`
nesneleriyle) + 3 entegrasyon testi (gerçek UNAUTHENTICATED/
BAD_REQUEST/validation hatalarının HÂLÂ gerçek mesajlarını
sızdırdığını, yani YANLIŞLIKLA maskelenmediğini kanıtlıyor — bu
kritik, çünkü ilk düzeltme denemesi validation hatalarını da
maskeleyip mevcut Phase 6 testini KIRARDI, bu ÖNCEDEN fark edilip
düzeltildi).

```
$ node --test tests/graphql-error-masking.test.js
tests 7, pass 7, fail 0

$ node --test tests/**/*.test.js   # tam regresyon
tests 135, pass 135, fail 0   (128 önceki + 7 yeni)
```

**Sınıflandırma: GERÇEK güvenlik-sertleştirme bulgusu, bulundu VE
düzeltildi (blocker olmadan önce önlendi).**

---

## 3. GÖZLEM #1 (Düzeltilmedi — Kapsam Dışı) — "Süresi Dolmuş Oturum" Mesajı Yanıltıcı

### Bulgu

`requireAuth.js`'in (Phase 4'ten, bu campaign'den ÖNCE var olan)
`resolveSession()` fonksiyonu, geçersiz bir token için `Geçersiz veya
süresi dolmuş oturum` ("Invalid or expired session") mesajı döner.
Ancak kaynak kodda (`grep -rn "expir|TTL|ttl"`) hiçbir session-expiry
mekanizması YOKTUR — session'lar yalnızca `seed.js`'in reseed
akışında toplu silinir, doğal bir süre sonu (TTL) asla uygulanmaz.
Mesaj, gerçekte var olmayan bir davranışı ima ediyor.

### Neden Düzeltilmedi

Bu, campaign'in kapsamı olan Phase 6-19'un DIŞINDA, Phase 4'ten
kalma, ZATEN Codex tarafından incelenip CLEAN olarak kapatılmış bir
koddur (`requireAuth.js`'in Phase 6'daki `resolveSession` refactor'ı
BU mesajı DEĞİL, yalnızca kodun yapısını değiştirdi — "verified
behavior-identical" olarak belgelendi). Bu campaign'in "no scope
creep" ve zaten-kapanmış fazları yeniden açmama disiplinine göre,
BURADA düzeltilmedi.

### Neden Görmezden Gelinmedi

Gerçek bir self-audit, yalnızca "benim fazımda mı" diye bakıp
kapsam-dışı bulguları SESSİZCE atlamamalıdır — bu nedenle burada
AÇIKÇA belgelendi, gelecekteki bir session/review için not olarak.

**Sınıflandırma: Kozmetik/dokümantasyon-doğruluğu notu, GÜVENLİK
AÇIĞI DEĞİL (mesaj hiçbir bilgi sızdırmıyor, yalnızca teknik olarak
tam doğru değil), BLOCKER DEĞİL, bu campaign'in kapsamı DIŞINDA.**

---

## 4. Diğer Kategori İncelemeleri (Bulgu Olmadan Tamamlandı)

| Kategori | İnceleme | Sonuç |
|---|---|---|
| Technical correctness | `requireAuth.js`/`resolveSession` yeniden okundu, `maskUnexpectedErrors`'ın path/code ayrımı ampirik doğrulandı | Sorun yok (1 bulgu hariç, yukarıda) |
| QA correctness | `security.test.js`'in assertion'ları (gerçek status code + mesaj kontrolü, yalnızca "hata var mı" değil) yeniden gözden geçirildi | Yeterli katılıkta |
| Architecture | GraphQL katmanının REST servis fonksiyonlarını yeniden kullandığı (kod tekrarı yok), `requestContext` middleware'inin doğru sırada mount edildiği doğrulandı | Sorun yok |
| Test quality | `graphql-error-masking.test.js`'in HEM pozitif (maskeleniyor) HEM negatif (maskelenmiyor) durumları test ettiği, tek-taraflı olmadığı doğrulandı | İyi kalite |
| Documentation | Bölüm 5'te (Terminology) detaylandırıldı | Tutarlı |
| Security | Bölüm 2 ana bulgu; Phase 11'in OWASP eşleştirmesi yeniden gözden geçirildi, ek bir kaçırılmış madde bulunamadı | 1 bulgu (düzeltildi) |
| Maintainability | `maskUnexpectedErrors`'ın ayrı, test edilebilir bir fonksiyon olarak çıkarılması (handler içine gömülü bırakılmaması) kod kalitesi kararı olarak değerlendirildi | İyi |
| False evidence | Her "GERÇEK" iddiasının bir komut çıktısına dayandığı (Phase 6-17 evidence dosyalarının TAMAMI) Phase 17'de zaten doğrulandı, burada örnekleme ile TEKRAR teyit edildi | Sorun yok |
| Unsupported experience claims | Phase 10 (Selenium/JMeter "CODE COMPLETE — EXECUTION BLOCKED"), Phase 8 (Mobile LEARNING) ifadelerinin hiçbirinin "çalıştı" izlenimi VERMEDİĞİ yeniden okunarak doğrulandı | Sorun yok |

---

## 5. Terminology Tutarlılığı (Phase 17'nin Devamı, Bu Fazın Kendi Değişikliğiyle)

`QA-DEMO-SYSTEM/evidence/PHASE-18-INDEPENDENT-REVIEW/` dizininin
kendisi de aynı disipline tabi: bu dosyanın başlığı ve içeriği AÇIKÇA
"CLAUDE SELF-AUDIT — bağımsız inceleme DEĞİLDİR" ifadesini taşıyor,
hiçbir yerde "Codex reviewed"/"independently verified"/"CODEX
CERTIFIED" gibi bir ifade KULLANILMADI (bu dosyanın kendisi dahil
tekrar grep ile doğrulandı).

---

## 6. Açık Blocker Sayısı: **0**

(Bölüm 2'deki bulgu, kapatılmadan önce bir blocker haline
GELMEDEN — implementasyon sırasında self-audit tarafından
yakalanıp düzeltildi.)

## 7. Sonuç

Bu self-audit, gerçek bir bulgu üretti (GraphQL hata mesajı
maskeleme eksikliği) — bu, kod zaten yazılmışken, hiçbir dış
inceleme baskısı olmadan, YALNIZCA "bu gerçekten doğru mu" sorusunun
tekrar sorulmasıyla bulundu ve GERÇEK testle (7 yeni test, hem
pozitif hem negatif durumlar) kilitlendi. Ek olarak, kapsam-dışı ama
gerçek bir dokümantasyon-doğruluğu notu (session expiry mesajı)
SESSİZCE atlanmadan kaydedildi. Tam backend regresyonu 135/135, tam
web-tests regresyonu 23/23. Açık blocker: 0.

**Bu, ROADMAP'ın istediği gerçek "Independent Review"nin YERİNE
GEÇMEZ — yalnızca Claude'un kendi çalışmasına uyguladığı, dürüstçe
etiketlenmiş bir kalite kontrolüdür. Gerçek bağımsız inceleme, bu
campaign'in sonunda Codex tarafından yapılacaktır.**

**Statü: CLAUDE SELF-AUDIT COMPLETE — PENDING FINAL CODEX AUDIT (gerçek
bağımsız inceleme henüz gerçekleşmedi).**
