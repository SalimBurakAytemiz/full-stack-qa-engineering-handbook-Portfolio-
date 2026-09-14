# Duplicate / Rejected / Not a Bug

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Her raporlanan defect, "FIXED"e giden bir yol izlemez. Bu üç
resolution türü, bir defect'in **geçersiz veya tekrarlı** olduğu
durumları ele alır — doğru kullanılmadıklarında hem gerçek sorunlar
göz ardı edilebilir hem de geçersiz raporlar development'ın zamanını
alabilir.

---

## 2. Duplicate

**Tanım:** Bu defect, sistemde **zaten kayıtlı** başka bir defect ile
aynı kök soruna işaret ediyor.

**Örnek:** BUG-AUTH-020 raporlandı: "Yanlış password ile login
denendiğinde generic hata mesajı gösteriliyor." Triage sırasında bu,
zaten açık olan BUG-AUTH-014 ile aynı sorun olduğu fark edildi.
BUG-AUTH-020, "Duplicate of BUG-AUTH-014" olarak kapatılır.

**Doğru Kullanım:** Duplicate olarak kapatmadan önce, **gerçekten**
aynı kök soruna işaret ettiğinden emin olun — yalnızca benzer
semptomlar (örn. iki farklı ekranda "generic error" görünmesi ama
farklı nedenlerle) Duplicate değildir.

---

## 3. Rejected

**Tanım:** Defect, **geçersiz** bulundu — yanlış raporlama, yanlış
anlaşılmış requirement veya hatalı test ortamı gibi bir nedenle.

**Örnek:** BUG-COUPON-030 raporlandı: "Kupon kodu uygulanamıyor."
Araştırma sonrası, test edenin kuponun süresinin dolmuş olduğunu fark
etmediği ortaya çıktı — sistem **doğru** şekilde reddetmiş. Defect,
"Rejected — invalid test data" olarak kapatılır.

**Doğru Kullanım:** Rejected kararı, **gerekçesiyle** birlikte
verilmelidir — "geçersiz" demek yeterli değildir, **neden** geçersiz
olduğu açıklanmalıdır.

---

## 4. Not a Bug

**Tanım:** Sistem, **tanımlandığı gibi doğru** çalışıyor; raporlanan
davranış aslında **beklenen** davranış.

**Örnek:** BUG-CART-012 raporlandı: "Sepette 10'dan fazla ürün
eklenemiyor." Araştırma sonrası, bu davranışın AC'de ("Sepette en
fazla 10 farklı ürün bulunabilir") açıkça tanımlanmış bir kısıtlama
olduğu ortaya çıktı. Defect, "Not a Bug — working as designed (bkz.
AC-CART-003)" olarak kapatılır.

---

## 5. Rejected ile Not a Bug Arasındaki Fark

Bu ikisi sık karıştırılır:

| | Rejected | Not a Bug |
|---|---|---|
| **Neden** | Raporlama hatası, yanlış test ortamı/veri | Sistem tasarlandığı gibi doğru çalışıyor |
| **Requirement'a Uygunluk** | Belirsiz/ilgisiz | Requirement'a **tam uygun** |
| **Örnek** | Test edenin süresi dolmuş kuponu fark etmemesi | Sepet limitinin tasarım gereği 10 olması |

---

## 6. Bu Kararlar Ne Zaman Yanlış Kullanılır?

**Tehlikeli yanlış kullanım:** Gerçek bir defect'i, işi kolaylaştırmak
için "Rejected" veya "Not a Bug" olarak kapatmak.

Bu, `CONTRIBUTING.md`'deki Evidence Integrity ve AI Agent Rule
prensipleriyle doğrudan çelişir — bir sorunun varlığı, onu görmezden
gelmek yerine **doğru şekilde** (Known Issue, Deferred, Won't Fix
gibi — bkz.
`../05-TEST-MANAGEMENT/18-KNOWN-ISSUES.md`) ele alınmalıdır.

---

## 7. Common Mistakes

- Duplicate kararını, yalnızca yüzeysel benzerliğe bakarak (kök
  nedeni doğrulamadan) vermek.
- Rejected/Not a Bug kararını gerekçesiz vermek.
- Gerçek bir defect'i, iş yükünü azaltmak için Rejected/Not a Bug
  olarak kapatmak.

---

## 8. Best Practices

- Her Duplicate kararında, ilişkili orijinal defect ID'sini açıkça
  belirtin.
- Rejected/Not a Bug kararlarını, ilgili Requirement/AC referansıyla
  destekleyin.
- Bu kararları triage sürecinin (bkz. `09-DEFECT-TRIAGE.md`) bir
  parçası olarak, tek başına değil ekip kararıyla verin.

---

## 9. Interview Notes

- "Rejected ile Not a Bug arasındaki fark nedir?" sorusuna, Rejected'ın
  raporlama hatası, Not a Bug'ın sistemin tasarlandığı gibi çalışması
  olduğunu somut örneklerle açıklayın.
- "Bir defect'i Duplicate olarak kapatmadan önce ne yaparsınız?"
  sorusuna, kök nedenin gerçekten aynı olduğunu doğrulayacağınızı
  belirterek cevap verin.

---

## İlgili Konular

- [Defect Lifecycle](02-DEFECT-LIFECYCLE.md)
- [Defect Triage](09-DEFECT-TRIAGE.md)
- [05-TEST-MANAGEMENT — Known Issues](../05-TEST-MANAGEMENT/18-KNOWN-ISSUES.md)
