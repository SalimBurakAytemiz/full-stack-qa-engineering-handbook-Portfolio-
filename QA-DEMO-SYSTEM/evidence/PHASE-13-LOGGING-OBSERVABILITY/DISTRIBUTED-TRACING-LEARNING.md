# PHASE 13 — Elastic / OpenTelemetry / Jaeger / Distributed Tracing (LEARNING)

**Neden gerçek kurulum YOK:** Elastic (Elasticsearch+Kibana / ELK
stack), OpenTelemetry Collector ve Jaeger'ın hepsi gerçek, ayrı
sunucu süreçleri (genellikle Docker container'ları) gerektirir. Bu
sandboxed container'da bunlar kurulu DEĞİLDİR — Tooling tablosunda
(`.ai/PHASE-6-19-CAMPAIGN-STATE.md`) bu zaten önceden doğrulanmıştı.
Bunları kurmaya çalışmak (Docker olmadan, gerçek bir Elasticsearch
node'unu bu container'da ayağa kaldırmak) bu ortamın kapsamı
dışındadır ve gerçek bir "çalıştı" kanıtı üretmezdi.

## Bu Projede GERÇEKTEN Yapılan (Elastic'in Basit Bir Ön-Koşulu)

Elastic/Kibana'nın ana değeri, YAPISAL loglar üzerinde arama/
korelasyon yapabilmesidir. Bu paket, bunun ÖN KOŞULUNU gerçek kodla
sağladı: her HTTP isteği artık `request_id` taşıyan, tek-satırlık,
ayrıştırılabilir bir log formatı üretiyor (`[http] request_id=...
method=... path=... status=... duration_ms=...`, bkz.
`requestContext.js`). Gerçek bir Elastic kurulumunda, bu satırlar
Filebeat/Logstash ile toplanıp Elasticsearch'e indexlenir ve Kibana'da
`request_id:"..."` ile aranabilir hale gelirdi — bu proje bu noktaya
kadar (yapısal, korelasyon-ID'li log üretimi) GERÇEKTEN gelmiştir;
Elastic'in kendisi bu noktadan sonrası içindir.

## Kavramsal Karşılaştırma

| Kavram | Bu projede GERÇEK karşılığı | Gerçek bir Elastic/Jaeger kurulumunda |
|---|---|---|
| Correlation ID | `req.requestId` (`crypto.randomUUID()`), `X-Request-Id` header | Aynı kavram, genellikle `trace_id` olarak adlandırılır |
| Backend Logs / Application Logs | `console.log` (yapısal, `key=value` formatında) | Aynı loglar, bir log shipper (Filebeat) ile toplanır |
| Root Cause Isolation | `request_id` ile tek bir isteğin log satırını bulma (`observability.test.js`'te kanıtlandı) | Kibana'da `request_id` ile filtreleme, veya Jaeger'da tam bir trace görselleştirmesi |
| Distributed Tracing | **YOK** — tek bir servis (backend), dağıtık bir mimari yok | Birden fazla servis arasında bir isteğin uçtan uca izlenmesi (span'ler) |
| Logs / Metrics / Traces model | Yalnızca "Logs" ayağı gerçek; Metrics (örn. p95 latency dashboard) ve Traces (span-tabanlı) YOK | Üç sinyalin birlikte korelasyonu |

## Sınıflandırma

**LEARNING / DOCUMENTATION-ONLY — NOT INSTALLED — BLOCKER DEĞİL.**
Bu sistemin kendisi zaten tek bir monolitik backend servisidir
("Distributed" Tracing'in gerektirdiği çoklu-servis mimarisi bu
projede yoktur) — bu nedenle gerçek bir Elastic/Jaeger kurulumu olsa
bile, "distributed" tracing'in gösterebileceği asıl değer (servisler
arası span korelasyonu) bu tek-servisli mimaride sınırlı olurdu. Bu,
hem altyapı eksikliğini hem de mimari uygunluğu dürüstçe belirtir.
