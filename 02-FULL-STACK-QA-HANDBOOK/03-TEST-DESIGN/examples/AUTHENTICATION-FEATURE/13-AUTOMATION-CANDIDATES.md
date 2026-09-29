# Authentication Feature — Automation Candidates

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [01-REQUIREMENT.md](01-REQUIREMENT.md)

---

## Yöntem

`03-TEST-DESIGN/12-AUTOMATION-CANDIDATE-ANALYSIS.md`'deki faktörler
kullanılarak, [10-TEST-CASES.md](10-TEST-CASES.md)'deki her test
case ayrı ayrı değerlendirilmiştir.

---

## Değerlendirme Tablosu

| Test Case | Repetition | Stability | Business Criticality | Data Complexity | Human Judgement | Automation Candidate? |
|---|---|---|---|---|---|---|
| TC-AUTH-HP-001 | Yüksek | Yüksek | Yüksek | Düşük | Yok | **Evet — Güçlü Aday** |
| TC-AUTH-NEG-001 | Yüksek | Yüksek | Yüksek | Düşük | Yok | **Evet — Güçlü Aday** |
| TC-AUTH-NEG-002 | Orta | Yüksek | Kritik | Düşük | Yok | **Evet — Güçlü Aday (API seviyesinde, deterministik)** |
| TC-AUTH-EDGE-001 | Düşük (yalnızca lock mantığı değiştiğinde tekrar önem kazanır) | Yüksek | Kritik | Orta (ardışık deneme senaryosu) | Yok | **Evet — Aday** |
| TC-AUTH-EDGE-002 | Düşük | Yüksek | Kritik | Orta | Yok | **Evet — Aday** |
| TC-AUTH-BOUNDARY-001 | Orta | Yüksek | Orta | Düşük | Yok | **Evet — Aday** |
| TC-AUTH-BOUNDARY-002 | Orta | Yüksek | Düşük | Düşük | Yok | **Evet — Aday (düşük öncelikli otomasyon backlog'unda)** |
| TC-AUTH-NEG-003 | Orta | Yüksek | Orta | Düşük | Yok | **Evet — Aday** |
| TC-AUTH-ERR-001 | Düşük | **Düşük** (timing'e bağımlı, flaky riski) | Orta | Orta | Kısmi (UI tepki süresine bağlı gözlem) | **Kısmi — Dikkatli Kurulmalı veya Manuel/Exploratory'de Kalmalı** |

---

## Önceliklendirme

Automation backlog'una girecek sıra (Repetition + Stability + Business
Criticality kombinasyonuna göre):

1. **TC-AUTH-HP-001** ve **TC-AUTH-NEG-001** — smoke/regression
   suite'inin çekirdeği; en yüksek öncelik.
2. **TC-AUTH-NEG-002** — kritik bir Business Rule'u API seviyesinde
   doğruladığı için, UI'dan bağımsız ve stabil; yüksek öncelik.
3. **TC-AUTH-EDGE-001 / TC-AUTH-EDGE-002** — kritik ama daha az sık
   çalıştırılan lock mantığı; orta-yüksek öncelik.
4. **TC-AUTH-BOUNDARY-001 / TC-AUTH-BOUNDARY-002 / TC-AUTH-NEG-003** —
   stabil ve düşük maliyetli; orta öncelik.
5. **TC-AUTH-ERR-001** — timing'e bağımlı olduğu için önce manuel/
   exploratory'de tutulmalı; yalnızca güvenilir bir bekleme/senkronizasyon
   stratejisi kurulabilirse otomasyona alınmalı.

---

## Neden TC-AUTH-ERR-001 "Kısmi" Olarak Değerlendirildi?

`03-TEST-DESIGN/12-AUTOMATION-CANDIDATE-ANALYSIS.md`'de vurgulandığı
gibi, çift tıklama gibi **zamanlamaya bağımlı** senaryolar,
otomasyonda genellikle **flaky** (bazen PASS bazen FAIL) sonuçlar
üretir — çünkü otomasyon aracının "iki tıklama arasındaki gerçek
zamanlama"yı güvenilir şekilde simüle etmesi zordur. Bu, testin
**değersiz** olduğu anlamına gelmez; yalnızca otomasyon
implementasyonunun **dikkatli** yapılması (örn. explicit
senkronizasyon noktaları eklenerek) veya manuel/exploratory testte
tutulması gerektiği anlamına gelir.

---

## Automation Candidate = Bütün Regression Demek Değildir

Bu tablo, [10-TEST-CASES.md](10-TEST-CASES.md)'deki **her** test
case'in otomatik olarak "regression suite'ine girdiği için otomatize
edilmesi gerektiği" varsayımını **reddeder** — her test case kendi
faktörlerine göre ayrı ayrı değerlendirilmiştir (bkz.
`03-TEST-DESIGN/12-AUTOMATION-CANDIDATE-ANALYSIS.md`, bölüm 5).

---

## Bu Kontrollü Örneğin Sonu

Bu, `03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/` klasöründeki
son dosyadır. Bu 13 dosya, Phase 2'nin tüm metodolojisinin
(Requirement → Clarification → AC → Business Rules → Impact/Dependency
Analysis → Risk Matrix → Test Conditions → Test Scenarios → Test
Cases → Test Data → Traceability → Automation Candidates) tek bir
kurgusal feature üzerinden **uçtan uca** nasıl uygulandığını
göstermiştir.

---

## İlgili Konular

- [03-TEST-DESIGN README](../../README.md)
- [01-REQUIREMENT.md](01-REQUIREMENT.md) (baştan başla)
