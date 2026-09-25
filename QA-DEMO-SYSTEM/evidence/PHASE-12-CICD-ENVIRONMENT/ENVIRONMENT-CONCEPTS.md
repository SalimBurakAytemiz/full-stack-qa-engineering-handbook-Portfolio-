# PHASE 12 — Environment Concepts (DEV/QA/UAT/Stage/Production)

**Dürüstlük notu:** QA-DEMO-SYSTEM bir portfolio/demo projesidir —
gerçekte yalnızca TEK bir ortamı vardır: bu sandboxed geliştirme
oturumunun kendisi (yerel `npm run dev`, `:memory:`/dosya-tabanlı
SQLite, gerçek ayrı QA/UAT/Stage/Production sunucuları YOK). Bu bölüm
bu gerçeği gizlemez — gerçek bir organizasyonda bu ortamların nasıl
işleyeceğini LEARNING içeriği olarak açıklar, bu projenin KENDİSİNİN
sahip olduğu gerçek tek ortamla (local dev, CI) açıkça ayrıştırarak.

## Bu Projenin Gerçek Ortamı

| Ortam | Bu projede var mı? | Gerçek karşılığı |
|---|---|---|
| Local Dev | **EVET** — `npm run dev`, dosya-tabanlı SQLite | Geliştiricinin kendi makinesi |
| CI (GitHub Actions) | **EVET — bu paket için yeni eklendi** | `.github/workflows/ci.yml`, her push'ta taze bir Ubuntu runner |
| QA | HAYIR (gerçek ayrı sunucu yok) | Bu projede CI'nin kendisi bu rolü fiilen üstleniyor (her push'ta temiz DB ile tüm suite çalışıyor) |
| UAT | HAYIR | LEARNING-only, aşağıda |
| Stage | HAYIR | LEARNING-only, aşağıda |
| Production | HAYIR | LEARNING-only, aşağıda |

## Gerçek Bir Organizasyonda (LEARNING)

- **DEV:** Geliştiricinin kendi ortamı, sık sık bozulabilir, gerçek
  veri YOK.
- **QA:** Test ekibinin kontrollü, göreceli kararlı bir ortamı;
  genellikle otomatik test suite'lerinin (bu projedeki gibi) düzenli
  çalıştığı yer.
- **UAT (User Acceptance Testing):** İş paydaşlarının/gerçek
  kullanıcı temsilcilerinin özellik kabul testleri yaptığı ortam;
  genellikle production'a en yakın veri/konfigürasyona sahiptir.
- **Stage:** Production'ın neredeyse birebir kopyası; son
  doğrulama/smoke test/performans testi burada yapılır, gerçek
  kullanıcı trafiği YOKTUR.
- **Production:** Gerçek kullanıcı trafiğinin olduğu canlı ortam;
  değişiklikler burada en dikkatli şekilde, genellikle kademeli
  (canary/blue-green) olarak uygulanır.

## Environment Validation (Bu Projede GERÇEKTEN Kullanılan Pattern)

`GET /api/health` — bu campaign boyunca HER lab'ın (Phase 8 Playwright
webServer, Phase 10 Selenium/JMeter, Phase 12 CI) sunucunun gerçekten
hazır olduğunu doğrulamak için GERÇEKTEN kullanıldığı, tekrar eden bir
pattern'dir (bkz. `.github/workflows/ci.yml`'in `curl -sf .../api/health`
retry döngüsü). Bu, gerçek bir CI/CD pipeline'ının "ortam gerçekten
ayağa kalktı mı" doğrulamasının birebir aynısıdır — icat edilmedi,
zaten var olan bir pattern'in CI bağlamında adlandırılmasıdır.

## Server/Application Recycle (Bu Projede GERÇEKTEN Kullanılan Pattern)

Bu campaign boyunca (Phase 8 `reset-and-start-server.js`, Phase 10
Selenium/JMeter lab'ları, Phase 12 CI) her test çalıştırması ÖNCE eski
DB dosyasını siler, SONRA sunucuyu taze başlatır — bu, gerçek bir
"application recycle" (temiz durumdan yeniden başlatma) pratiğidir.
Gerçek bir production ortamında bu, bir deployment sonrası servisin
yeniden başlatılmasına (ve health-check'in yeşile dönmesini
beklemeye) karşılık gelir.

## Production Incident Investigation / QA → DevOps Collaboration (LEARNING)

Bu proje gerçek bir production sistemine sahip olmadığından, gerçek
bir incident YAŞANMADI/simüle edilmedi. Kavramsal olarak:
- QA, bir incident sırasında genellikle "bu regresyon mu, yeni bir
  bug mu?" sorusuna cevap arar — bu projede bu, tam olarak her
  phase'in kendi regresyon adımına (`node --test`, tam suite) karşılık
  gelir: bir değişiklik sonrası hangi testlerin kırıldığı, incident
  triage'ının test-tabanlı eşdeğeridir.
- QA → DevOps işbirliği, gerçek bir organizasyonda CI/CD pipeline'ının
  (bu paketin `.github/workflows/ci.yml`'i gibi) paylaşılan sahipliği
  ile somutlaşır — testleri QA yazar, pipeline'ı genellikle DevOps
  işletir; bu ayrım bu solo-geliştirme projesinde doğal olarak yoktur,
  ama pipeline'ın kendisi (CI job'ları, health-check pattern'i) bu
  işbirliğinin somut çıktısına örnektir.

**Sınıflandırma:** Production Incident Investigation tamamen
LEARNING-only (gerçek bir incident yok); diğer tüm maddeler bu
projenin kendi gerçek pattern'leriyle somutlaştırıldı.
