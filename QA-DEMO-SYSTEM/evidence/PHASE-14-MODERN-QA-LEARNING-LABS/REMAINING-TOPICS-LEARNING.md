# PHASE 14 — Modern QA Learning Labs — Remaining Topics (LEARNING)

ROADMAP Phase 14'ün kendi başlığı zaten "MODERN QA LEARNING LABS" ve
her madde "Learning Topics" olarak listelenmiştir. Bu dosya, gerçek
kod/çalıştırma ile karşılanan maddeler (Code Coverage, k6/Gatling/
Locust → Locust, Docker for QA → bkz. `EXECUTION.md`) DIŞINDA kalan
maddeleri dürüstçe LEARNING seviyesinde kapsar — her biri gerçek bir
sunucu, hesap veya lisans gerektirir ve bu sandboxed container'da
mevcut değildir.

| Madde | Kavram | Neden gerçek kurulum YOK |
|---|---|---|
| Pact | Consumer-driven contract testing — bir tüketicinin (frontend) beklediği API sözleşmesini bir "pact dosyası" olarak üretici (backend) tarafına karşı doğrulamak | Bu proje TEK bir monolitik backend'e sahip (bağımsız olarak versiyonlanan ayrı mikroservisler yok) — Pact'ın asıl değer önerisi (bağımsız deploy edilen servisler arası sözleşme uyumu) bu mimaride doğal bir karşılığa sahip değil; gerçek bir Pact Broker sunucusu da bu ortamda yok |
| Kafka | Dağıtık event-streaming platformu | Ayrı bir broker süreci (genellikle Docker/ZooKeeper ile) gerektirir — bu ortamda yok |
| RabbitMQ | Mesaj kuyruğu broker'ı | Ayrı bir broker süreci gerektirir — bu ortamda yok |
| SonarQube | Statik kod analizi + kalite kapısı sunucusu | Ayrı bir sunucu (genellikle Docker) + veritabanı gerektirir — bu ortamda yok. (Not: Node'un kendi `--experimental-test-coverage`'ı bu campaign'de GERÇEKTEN kullanıldı — bkz. `EXECUTION.md` — ama bu SonarQube'un kalite-kapısı/statik-analiz işlevinin yerini TUTMAZ, yalnızca "Code Coverage" maddesini karşılar) |
| Allure | Test sonuçlarından zengin HTML raporu üreten bir raporlama kütüphanesi | Eklenebilir bir npm/pip paketi olsa da, bu campaign zaten `node:test`'in kendi TAP çıktısını ve gerçek evidence dosyalarını (Phase 5.8'in Newman HTML raporlaması dahil) kullanıyor — yeni bir raporlama katmanı eklemek gerçek bir değer katmadan dependency-ayak-izini artırırdı (dependency-policy: gerekli değil) |
| Feature Flags | Kod değişmeden özellik açma/kapama (örn. LaunchDarkly, Unleash) | Bu projede hiçbir feature flag mekanizması YOK — gerçek bir 3.-parti hesap/kendi-barındırılan sunucu gerektirir |
| Canary Deployment | Yeni sürümü trafiğin küçük bir yüzdesine kademeli açma | Gerçek bir orkestrasyon platformu (Kubernetes/bir bulut sağlayıcı) gerektirir — bu projede tek bir deploy hedefi bile yok |
| Blue-Green Deployment | İki paralel production ortamı arasında anlık geçiş | Aynı gerekçe — gerçek bir çoklu-ortam altyapısı gerektirir |
| Cloud QA | Bulut sağlayıcıya-özgü test pratikleri (örn. AWS/GCP/Azure'a özgü QA teknikleri) | Gerçek bir bulut hesabı gerektirir — bu proje kapsamında yok |

## Sınıflandırma

**LEARNING / DOCUMENTATION-ONLY — NOT INSTALLED/NOT APPLICABLE —
BLOCKER DEĞİL.** Bu maddelerin hiçbiri için sahte bir kurulum/
çalıştırma iddiası ÜRETİLMEDİ. Her biri gerçek bir sunucu, hesap veya
mimari ön-koşul (çoklu-servis mimarisi, bulut hesabı, orkestrasyon
platformu) gerektirir ve campaign'in "genuinely human-only" durdurma
kriterlerinden birine ("repository dışı yetki/altyapı gerekir")
girer.
