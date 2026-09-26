# Retest

**Status: EXPERIENCE**

> Bu dosya ile [12-REGRESSION-AFTER-FIX.md](12-REGRESSION-AFTER-FIX.md)
> arasında bilinçli bir cross-link vardır — ikisi de fix sonrası test
> aktivitesidir ama **farklı sorulara** cevap verir.

---

## 1. Neden Önemli?

Bir defect "FIXED" olarak işaretlendiğinde, bu **fix'in gerçekten
işe yaradığının kanıtlandığı** anlamına gelmez. Retest, bu kanıtı
sağlayan adımdır.

---

## 2. Retest Nedir?

**Retest**, fix'lenen defect'in **aynı senaryo** üzerinde tekrar
çalıştırılarak, gerçekten düzelip düzelmediğinin doğrulanmasıdır.

**Temel Soru:** "Bu bug düzeldi mi?"

---

## 3. Retest Süreci

```text
Defect FIXED olarak işaretlendi
   ↓
Fix, ilgili test ortamına deploy edildi
   ↓
QA, orijinal Steps to Reproduce'u (bkz. 04-STEPS-TO-REPRODUCE.md)
tekrar uygular
   ↓
Sonuç:
   - Defect artık gerçekleşmiyor → RETEST PASS → CLOSED
   - Defect hâlâ gerçekleşiyor → RETEST FAIL → REOPEN (bkz.
     11-REOPEN.md)
```

---

## 4. Retest ile Regression Aynı Örnek Üzerinden

**Senaryo:** "Kupon kodu, sepet başına birden fazla kez
uygulanabiliyor" defect'i fix edildi.

### Retest (Bu Bug Düzeldi mi?)

QA, **tam olarak aynı senaryoyu** (aynı kupon kodunu ikinci kez
uygulamayı dener) tekrar çalıştırır. Eğer sistem artık ikinci
uygulamayı reddediyorsa, Retest **PASS**'tir.

### Regression (Fix Başka Yeri Bozdu mu?)

QA, kupon uygulama akışının **diğer** senaryolarını (geçerli kupon
ile ilk kez uygulama, süresi dolmuş kupon, minimum tutar altı kupon)
tekrar çalıştırır. Eğer bu senaryolardan biri artık **yanlış**
davranıyorsa (örn. geçerli kupon artık hiç uygulanamıyor), bu bir
Regression'dır — fix, ilgisiz bir alanı bozmuştur.

**Kısaca:** Retest, **dar ve derin** (yalnızca o bug); Regression,
**geniş ve sığ** (ilgili tüm alan) bir kontrol yapar.

---

## 5. Bu Repository'de Retest Durumu

`03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/` ve
`06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/` klasörlerindeki
tüm Test Case ve Retest kayıtları, bu Phase'de **gerçekten
çalıştırılmamıştır**. Bu yüzden ilgili dosyalarda Retest sonucu
`NOT EXECUTED` olarak işaretlenir — `PASS` veya `CLOSED` sonucu
**uydurulmaz** (bkz. `CONTRIBUTING.md` — Evidence Integrity).

---

## 6. Common Mistakes

- Retest'i atlayıp defect'i doğrudan CLOSED olarak işaretlemek.
- Retest yaparken orijinal Steps to Reproduce'dan farklı bir senaryo
  test etmek (bu, gerçek fix'i doğrulamaz).
- Retest ile Regression'ı aynı aktivite sanmak.

---

## 7. Best Practices

- Retest'i her zaman orijinal Steps to Reproduce ile birebir yapın.
- Retest sonrası mutlaka ilgili alanın Regression'ını da planlayın
  (bkz. `12-REGRESSION-AFTER-FIX.md`).
- Retest sonucunu (PASS/FAIL) ve tarihini defect kaydına ekleyin.

---

## 8. Interview Notes

- "Retest nedir?" sorusuna, fix'lenen bug'ın aynı senaryoda tekrar
  test edilmesi olduğunu belirterek cevap verin.
- "Retest ile Regression'ı aynı örnek üzerinden ayırt eder misiniz?"
  sorusuna kupon kodu örneğiyle (dar/derin vs geniş/sığ) cevap verin.

---

## İlgili Konular

- [Regression After Fix](12-REGRESSION-AFTER-FIX.md)
- [Reopen](11-REOPEN.md)
- [examples/AUTHENTICATION-BUG — Retest](examples/AUTHENTICATION-BUG/10-RETEST.md)
