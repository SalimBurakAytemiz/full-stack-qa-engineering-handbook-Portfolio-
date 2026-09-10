# Static & Dynamic Testing

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

QA'nın en değerli katkısı bazen hiç kod çalıştırmadan gerçekleşir. Bu
dosya, "kod çalışmadan yapılan" ve "kod çalıştırılarak yapılan" testing
arasındaki farkı ve QA'nın development başlamadan bug önleyebileceği
fikrini gösterir.

---

## 2. Static Testing Nedir?

Static Testing, yazılımı **çalıştırmadan** yapılan inceleme
aktiviteleridir. Requirement dokümanı, design, kod, test case gibi work
product'lar üzerinde yürütülür.

Static Testing yöntemleri:

- **Review:** Bir dokümanın (requirement, design) yapılandırılmış veya
  yapılandırılmamış şekilde gözden geçirilmesi.
- **Walkthrough:** Yazarın, dokümanı adım adım ekiple birlikte anlattığı,
  geri bildirim topladığı informal inceleme.
- **Inspection:** En formal static testing türü; tanımlı roller, kontrol
  listeleri ve resmi kayıt ile yürütülür.
- **Requirement Review:** Requirement'ların netlik, tutarlılık ve
  testability açısından incelenmesi.
- **Code Review Awareness:** QA, kod yazmasa da code review sürecinde
  "bu değişiklik hangi test senaryosunu etkiler" sorusunu sorabilir.

---

## 3. Dynamic Testing Nedir?

Dynamic Testing, yazılımı **gerçekten çalıştırarak** yapılan testing
aktiviteleridir. Girdi verilir, çıktı gözlemlenir, beklenen sonuçla
karşılaştırılır.

Örnek: Bir formu doldurup submit etmek, API'ye request atıp response'u
kontrol etmek.

---

## 4. Karşılaştırma

| | Static Testing | Dynamic Testing |
|---|---|---|
| Sistem çalışıyor mu? | Hayır | Evet |
| Ne zaman yapılır | Development öncesi/sırası | Build hazır olduktan sonra |
| Örnek | Requirement review | Fonksiyonel test çalıştırma |
| Yakaladığı hata türü | Belirsizlik, tutarsızlık, eksik senaryo | Runtime hataları, beklenmeyen davranış |
| Maliyet | Düşük (erken yakalama) | Daha yüksek (geç yakalama) |

---

## 5. QA Development Başlamadan Bug Önleyebilir mi?

Evet — bu, Static Testing'in tam olarak amacıdır.

**Örnek:** Bir requirement review sırasında QA şu belirsizliği fark eder:

> "Kullanıcı adres bilgisini güncelleyebilir" yazılmış ama sipariş
> hazırlanmaya başladıktan sonra adres güncellenebilir mi, belirtilmemiş.

Bu belirsizlik, development başlamadan önce yakalanırsa:

- Developer yanlış varsayımla kod yazmaz.
- QA, olmayan bir davranış için test case yazmaz.
- Production'da "adres güncellendi ama sipariş eski adrese gitti" gibi
  bir defect hiç oluşmaz.

Bu, Dynamic Testing ile hiçbir zaman bu kadar erken ve ucuz
yakalanamazdı — çünkü Dynamic Testing için önce kodun yazılmış olması
gerekir.

---

## 6. Review Türleri Arasındaki Fark

| Tür | Formalite | Katılımcı | Amaç |
|---|---|---|---|
| Informal Review | Düşük | Yazar + 1-2 kişi | Hızlı geri bildirim |
| Walkthrough | Orta | Yazar liderliğinde ekip | Ortak anlayış oluşturmak |
| Inspection | Yüksek | Tanımlı roller (moderator, reviewer, yazar) | Formal, kayıt altına alınmış hata tespiti |

---

## 7. Common Mistakes

- Static Testing'i "gereksiz toplantı" olarak görmek.
- Yalnızca kod tamamlandıktan sonra test sürecinin başladığını
  düşünmek.
- Requirement review'u atlayıp doğrudan test case yazmaya başlamak.

---

## 8. Best Practices

- Her yeni requirement için development başlamadan önce kısa bir review
  turu planlayın.
- Review sırasında bulunan belirsizlikleri mutlaka dokümante edin —
  sözlü onay yeterli değildir.
- Code review sürecine QA'yı "test senaryosu etkisi" perspektifiyle
  dahil edin.

---

## 9. Interview Notes

- "Static Testing örneği verir misiniz?" sorusuna somut bir requirement
  review senaryosuyla cevap verin.
- "QA, kod yazılmadan nasıl bug önler?" sorusuna, belirsizliğin erken
  yakalanmasının maliyet avantajını vurgulayarak cevap verin.

---

## İlgili Konular

- [Verification & Validation](02-VERIFICATION-AND-VALIDATION.md)
- [Shift Left & Shift Right](11-SHIFT-LEFT-AND-SHIFT-RIGHT.md)
- [Entry & Exit Criteria](09-ENTRY-AND-EXIT-CRITERIA.md)
