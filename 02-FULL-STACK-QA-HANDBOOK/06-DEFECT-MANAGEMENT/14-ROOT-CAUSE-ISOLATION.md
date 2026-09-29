# Root Cause Isolation

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

QA'nın görevi, her zaman bir sorunun **kök nedenini kod seviyesinde
çözmek** değildir — bu genellikle Development'ın işidir. Ancak QA,
problemin **hangi katmanda** olduğunu izole etmeye çalışabilir ve
çalışmalıdır. Bu, doğru ekibe doğru bilgiyle gitmeyi sağlar.

---

## 2. QA'nın Rolü: Çözmek mi, İzole Etmek mi?

`00-QA-FOUNDATIONS/12-QA-ROLE-AND-SCOPE-BOUNDARIES.md`'de anlatılan
prensiple tutarlı olarak:

> QA, sorunu **kod seviyesinde çözmek** zorunda değildir. Ama QA,
> sorunu hangi katmandan kaynaklandığını **izole edecek** kadar
> teknik bilgi sahibi olabilir ve olmalıdır.

---

## 3. İzolasyon İçin Değerlendirilen Katmanlar

| Katman | İzolasyon Sorusu |
|---|---|
| UI | Sorun yalnızca arayüzde mi (veri doğru ama gösterim yanlış)? |
| Mobile | Sorun yalnızca mobil platformda mı, web'de yok mu? |
| API | Sorun API response'unda mı (doğrudan API çağrısıyla tekrar üretiliyor mu)? |
| Backend | Sorun iş mantığında mı (API doğru ama sonuç yanlış hesaplanıyor)? |
| Database | Sorun veride mi (yanlış/tutarsız kayıt)? |
| Environment | Sorun yalnızca belirli bir ortamda mı (Staging'de var, Prod'da yok)? |
| Server | Sorun belirli bir sunucu/node'a mı özgü (bkz. bölüm 5)? |
| Third Party | Sorun harici bir servisten mi kaynaklanıyor? |
| Configuration | Sorun bir konfigürasyon farkından mı kaynaklanıyor? |
| Network | Sorun ağ bağlantısı/gecikmesinden mi kaynaklanıyor? |

---

## 4. İzolasyon Nasıl Yapılır?

1. Sorunu **farklı koşullarda** tekrar üretmeyi deneyin (farklı
   cihaz, farklı ortam, doğrudan API çağrısı vb.).
2. Her denemenin sonucunu not edin — "X koşulunda oluyor, Y
   koşulunda olmuyor".
3. Bu farkları karşılaştırarak, sorunun **hangi değişkenle** ilişkili
   olduğunu daraltın.
4. Bulgularınızı, **hangi katmanı işaret ettiğini** açıkça belirterek
   raporlayın (kesin kök nedeni değil, olası katmanı).

---

## 5. Eğitim Amaçlı Genelleştirilmiş Örnek

> **Not:** Aşağıdaki örnek, **genel bir öğretim senaryosudur** ve
> gerçek bir şirket olayını temsil etmez. Amaç, environment/server
> seviyesinde izolasyonun nasıl yapılacağını göstermektir.

**Senaryo:** Bir sistemin production ortamında **6 node/server**
üzerinde çalıştığı varsayılsın.

```text
Node 1: Login → PASS
Node 2: Login → PASS
Node 3: Login → PASS
Node 4: Login → PASS
Node 5: Login → PASS
Node 6: Login → FAIL
```

**Yanlış Raporlama:**

> "Login feature çalışmıyor."

Bu raporlama **yanlıştır** çünkü login, 6 node'un 5'inde **doğru**
çalışıyor. "Feature çalışmıyor" ifadesi, sorunun **tüm sistemi**
etkilediği izlenimini verir — bu, hem yanlış bir aciliyet algısı
yaratır hem de development'ı yanlış yöne (feature kodunda genel bir
hata aramaya) yönlendirir.

**Doğru Raporlama:**

> "Login, 6 node'un 5'inde başarıyla çalışıyor; yalnızca Node 6'da
> başarısız oluyor. Bu, feature kodunda genel bir hatadan çok, Node
> 6'ya özgü bir **environment/configuration/deployment
> farklılığından** kaynaklanıyor olabilir. DevOps/Infrastructure
> ekibinin Node 6'nın konfigürasyonunu (deployment versiyonu,
> environment variable'ları, bağlantı ayarları) diğer node'larla
> karşılaştırması önerilir."

---

## 6. Bu Örnekten Çıkan Genel Prensip

Bir sorunun **tutarsız** şekilde (bazı yerlerde var, bazı yerlerde
yok) gerçekleştiğini gözlemlediğinizde, ilk hipoteziniz "kod her yerde
aynı çalışıyor, bu yüzden sorun kodda olamaz — sorun **ortam/dağıtım**
farkında olabilir" olmalıdır. Bu, QA'nın kod yazmadan, yalnızca
gözlem ve karşılaştırma yoluyla değerli bir izolasyon sağlayabileceğini
gösterir.

---

## 7. Common Mistakes

- Tutarsız bir sorunu, sistemin **tamamını** etkiliyormuş gibi
  genellemek ("feature çalışmıyor").
- İzolasyon denemeden doğrudan "bu bir kod bug'ı" diye varsaymak.
- QA'nın kök nedeni **kesin olarak** (kod satırı seviyesinde) bulması
  gerektiğini düşünmek — izolasyon yeterlidir, kesin teşhis genellikle
  development/DevOps'a aittir.

---

## 8. Best Practices

- Tutarsız sorunlarda, farklı koşullar altında (node, ortam, cihaz)
  sistematik olarak tekrar üretmeyi deneyin.
- Raporlamada "her zaman / bazen / yalnızca X koşulunda" ayrımını
  netleştirin.
- İzolasyon bulgularınızı, hangi ekibin (Development/DevOps/Third
  Party) ilgilenmesi gerektiğini önererek raporlayın.

---

## 9. Interview Notes

- "QA'nın root cause analizindeki rolü nedir?" sorusuna, kod
  seviyesinde çözmenin genelde development'a ait olduğunu ama QA'nın
  katman izolasyonu yapabileceğini/yapması gerektiğini açıklayın.
- "Bir sorun bazı sunucularda var, bazılarında yok — nasıl
  raporlarsınız?" sorusuna 6-node örneğiyle, "feature çalışmıyor"
  yerine "Node 6'ya özgü" şeklinde raporlayacağınızı belirterek
  cevap verin.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — QA Role & Scope Boundaries](../00-QA-FOUNDATIONS/12-QA-ROLE-AND-SCOPE-BOUNDARIES.md)
- [Reproduction Rate](07-REPRODUCTION-RATE.md)
- [Cross-Team Defects](16-CROSS-TEAM-DEFECTS.md)
