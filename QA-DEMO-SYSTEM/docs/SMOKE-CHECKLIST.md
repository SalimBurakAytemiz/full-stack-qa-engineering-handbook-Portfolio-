# QA Demo System — Smoke Checklist

> Bu doküman, `RUN-INSTRUCTIONS.md`'yi takip ederek ayağa kaldırılan
> QA Demo System'in **gerçekten çalıştığını** doğrulamak için
> kullanılan, tekrar çalıştırılabilir smoke checklist'idir. P4.5'te
> (Run Documentation & Smoke Validation) oluşturulmuş, bu tarihten
> itibaren P4.1–P4.3 kümülatif kapsamının resmi smoke kaynağıdır.
>
> Her madde `PASS` / `FAIL` / `BLOCKED` / `NOT APPLICABLE`
> durumlarından biriyle raporlanmalıdır — yalnızca toplam bir sayı
> yeterli değildir.

---

## Ön Koşul — Environment Readiness

Smoke'a başlamadan önce:

- [ ] Backend reachable (`GET /api/health` → `200` + `{"status":"ok"}`)
- [ ] Frontend reachable (`GET /` → `200`)
- [ ] SQLite ready (veritabanı dosyası oluşmuş, sorgulanabilir)
- [ ] Seed loaded (`users` tablosunda ≥1 satır, `products` tablosunda ≥1 satır)
- [ ] WebSocket ready (geçerli bir token ile `/ws` bağlantısı açılabiliyor)

Sonuç: `READY` / `PARTIALLY READY` / `NOT READY`

---

## AUTHENTICATION

| ID | Senaryo | Beklenen |
|---|---|---|
| AUTH-01 | Valid login (`test.active01@example.com` / `ValidPass123!`) | `200` + `token` |
| AUTH-02 | Invalid password (aynı email, yanlış şifre) | `401` + `"Email veya şifre hatalı"` |
| AUTH-03 | Unknown user (kayıtlı olmayan email) | `401` + aynı genel mesaj |

## PRODUCTS

| ID | Senaryo | Beklenen |
|---|---|---|
| PROD-01 | `GET /api/products` | `200`, en az 1 ürün `in_stock:false` |
| PROD-02 | `GET /api/products/:id` (stok verisi) | `200`, doğru `stock_quantity`/`in_stock` |

## ORDERS

| ID | Senaryo | Beklenen |
|---|---|---|
| ORD-01 | Authenticated olmadan sipariş | `401` |
| ORD-02 | Authenticated + `TEST-CARD-APPROVED` | `201` + `PAID`; ilgili ürün stoku düşer |
| ORD-03 | `TEST-CARD-DECLINED` | `201` + `PAYMENT_FAILED`; stok değişmez |
| ORD-04 | `TEST-CARD-TIMEOUT` | `201` + `PAYMENT_TIMEOUT`; stok değişmez |
| ORD-05 | Stoktan fazla adet (stock integrity) | `409` |

## NOTIFICATIONS / EVENTS

| ID | Senaryo | Beklenen |
|---|---|---|
| NOTIF-01 | PAID sipariş sonrası `GET /api/notifications` | `200`, `type:"order.paid"` içeren 1 kayıt |
| NOTIF-02 | Anonymous notification erişimi | `401` |
| NOTIF-03 | Cross-user notification erişimi | Başka kullanıcının notification'ı görünmez (`0` kayıt) |
| NOTIF-04 | WebSocket realtime delivery (bağlıyken PAID sipariş) | Bağlı client `{"type":"notification",...}` mesajını alır |
| NOTIF-05 | DECLINED/TIMEOUT → event/notification üretilmez | `events`/`notifications`'da ilgili sipariş için kayıt yok |

## SECURITY / AUTHORIZATION

| ID | Senaryo | Beklenen |
|---|---|---|
| SEC-01 | Cross-user order access (`GET /api/orders/:id`, başka kullanıcı) | `404` |
| SEC-02 | Forged/invalid Bearer token (protected endpoint) | `401` |
| SEC-03 | Anonymous protected endpoint access (Orders/Notifications) | `401` |
| SEC-04 | WebSocket geçersiz/eksik token | Bağlantı `401` ile reddedilir |

## FRONTEND

| ID | Senaryo | Beklenen |
|---|---|---|
| FE-01 | Login sayfası açılır | `200`, `login-form` DOM'da mevcut |
| FE-02 | Products sayfası açılır | `200`, `product-list` DOM'da mevcut |
| FE-03 | Temel notification UI bozulmamış | `notification-list` DOM'da mevcut |
| FE-04 | Gerçek tarayıcı üzerinden login → products akışı | Gerçek login sonrası ürünler ve notification'lar render edilir (ekran görüntüsüyle doğrulanabilir) |

---

## Sonuç Formatı

Her execution, kendi evidence klasöründe (örn.
`QA-DEMO-SYSTEM/evidence/P4.5-RUN-SMOKE/`) bu ID'lere göre
PASS/FAIL/BLOCKED/NOT APPLICABLE durumlarını ve varsa
request/response/log/screenshot kanıtını kaydetmelidir.
