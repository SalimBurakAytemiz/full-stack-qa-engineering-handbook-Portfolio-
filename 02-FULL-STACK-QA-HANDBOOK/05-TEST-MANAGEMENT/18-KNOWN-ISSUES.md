# Known Issues

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Her release, kusursuz olmak zorunda değildir — ama **bilinen** ve
**kabul edilmiş** kusurlarla release edilmelidir, **gizlenmiş**
kusurlarla değil. Bu dosya, Known Issues'ın nasıl yönetildiğini
anlatır.

---

## 2. Known Issue Nedir?

**Known Issue**, tespit edilmiş ama release'i engellemeyecek kadar
düşük etkili olduğu için, **bilinçli olarak kabul edilerek**
release ile birlikte production'a taşınan bir defect veya
sınırlamadır.

---

## 3. Bir Defect Ne Zaman Known Issue Olur?

Bir defect, aşağıdaki koşullar sağlandığında Known Issue statüsüne
geçebilir:

1. Severity/Priority'si düşük (bkz.
   `../06-DEFECT-MANAGEMENT/06-SEVERITY-VS-PRIORITY.md`) — kritik bir
   iş akışını engellemiyor.
2. Business tarafından **görülmüş ve kabul edilmiş**.
3. Bir workaround (geçici çözüm) varsa belirtilmiş.
4. Gelecekte fix edilmesi planlanıyorsa hedef release/sprint
   belirtilmiş.

---

## 4. Known Issue Kaydının İçeriği

| Alan | Açıklama |
|---|---|
| Defect ID | İlgili bug kaydına referans. |
| Description | Sorunun kısa açıklaması. |
| Impact | Kullanıcı/business üzerindeki etkisi. |
| Workaround | Varsa, kullanıcının/desteğin uygulayabileceği geçici çözüm. |
| Accepted By | Bu riski kabul eden kişi/rol (genellikle Product Owner). |
| Target Fix | Planlanan çözüm release'i (varsa). |

---

## 5. Örnek

| Alan | İçerik |
|---|---|
| Defect ID | BUG-COUPON-002 |
| Description | Kupon input alanındaki placeholder metni "Kupon kodunuzu girin" yerine "Enter code" gösteriyor (yanlış dil). |
| Impact | Görsel/dil tutarsızlığı; işlevi etkilemiyor. |
| Workaround | Yok, gerek de yok — kullanıcı kupon kodunu yine de girebiliyor. |
| Accepted By | Product Owner (release toplantısında) |
| Target Fix | v2.4 (bir sonraki sprint) |

---

## 6. Known Issue ≠ Gizlenmiş Sorun

**Kritik fark:** Known Issue, **şeffaf** bir karardır — business
bilir, dokümante edilmiştir, Release Test Report'ta (bkz.
`15-TEST-REPORTING.md`) açıkça yer alır.

Bunun tersi — bir sorunu fark edip hiç raporlamadan "önemsiz" diye
görmezden gelmek — Known Issue **değildir**, bu bir şeffaflık
ihlalidir (bkz.
`00-QA-FOUNDATIONS/COMMON-MISTAKES.md` — "Known Issue gizlemek").

---

## 7. Common Mistakes

- Bir defect'i QA'nın kendi kararıyla "önemsiz" ilan edip Known
  Issue listesine hiç eklemeden release etmek.
- Known Issue'ları dokümante etmeden yalnızca sözlü olarak "biliyoruz"
  demek.
- Known Issue'ların Target Fix planını hiç takip etmemek — liste
  büyüdükçe teknik borç birikir.

---

## 8. Best Practices

- Her Known Issue'u yazılı olarak, Accepted By bilgisiyle birlikte
  kayıt altına alın.
- Known Issues listesini her Release Test Report'a dahil edin.
- Known Issue'ların Target Fix planını periyodik olarak gözden
  geçirin — liste "unutulan sorunlar çöplüğüne" dönüşmemeli.

---

## 9. Interview Notes

- "Known Issue nedir, ne zaman kullanılır?" sorusuna, düşük etkili ve
  bilinçli kabul edilmiş sorunlar için kullanıldığını belirterek
  cevap verin.
- "Known Issue ile gizlenmiş bir sorun arasındaki fark nedir?"
  sorusuna şeffaflık (dokümante edilmiş, kabul edilmiş) farkıyla
  cevap verin.

---

## İlgili Konular

- [templates/KNOWN-ISSUES-TEMPLATE.md](templates/KNOWN-ISSUES-TEMPLATE.md)
- [Test Reporting](15-TEST-REPORTING.md)
- [Release QA Sign-Off](17-RELEASE-QA-SIGN-OFF.md)
