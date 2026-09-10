# Authentication Feature — Requirement

> ## EDUCATIONAL CONTROLLED EXAMPLE
>
> Bu klasördeki tüm içerik (`01` — `13` arası dosyalar), Phase 2'de
> öğretilen Requirement Analysis, Risk-Based Testing ve Test Design
> metodolojisinin **uçtan uca nasıl uygulandığını göstermek için**
> kurgulanmış, tamamen eğitim amaçlı bir örnektir.
>
> - Bu, **gerçek bir profesyonel proje** veya **gerçek bir şirket
>   sisteminin** dokümantasyonu **değildir**.
> - Kullanılan requirement, kural, risk değerlendirmesi, test case ve
>   veriler kurgusaldır.
> - Hiçbir Test Case bu Phase'de **çalıştırılmamıştır** — tüm
>   execution durumları `NOT EXECUTED` olarak işaretlidir (bkz.
>   `10-TEST-CASES.md`).
> - Amaç, metodolojinin nasıl **adım adım uygulanacağını** somut bir
>   örnekle göstermektir; repository sahibinin bu spesifik "feature"ı
>   gerçekten geliştirdiği/test ettiği anlamına gelmez.

---

## Requirement

> "Kayıtlı ve aktif kullanıcı geçerli email ve password kullanarak
> sisteme login olabilir."

---

## İlk Değerlendirme: Bu Requirement Tek Başına Yeterli mi?

**Hayır.** `01-REQUIREMENT-ANALYSIS/04-REQUIREMENT-TESTABILITY.md`'de
anlatılan testability kriterleri açısından bu requirement:

- "Kayıtlı ve aktif kullanıcı" ifadesi, "aktif olmayan" (disabled,
  locked, deleted) kullanıcıların davranışını tanımlamıyor.
- "Geçerli email ve password" ifadesi, geçersiz durumlarda ne
  olacağını (hata mesajı, deneme limiti) tanımlamıyor.
- Session, MFA, "remember me" gibi davranışlar hiç belirtilmemiş.

Bu requirement, olduğu haliyle doğrudan test case'e çevrilemez. Bir
sonraki adım, `02-CLARIFICATION-QUESTIONS.md`'de bu belirsizlikleri
netleştirmektir.

---

## Requirement Türü

`01-REQUIREMENT-ANALYSIS/01-REQUIREMENT-TYPES.md`'deki sınıflandırmaya
göre bu bir **Functional Requirement**'dır — sistemin somut olarak ne
yapması gerektiğini tanımlar (login işlevi).

---

## Sonraki Adım

[02 — Clarification Questions](02-CLARIFICATION-QUESTIONS.md)
