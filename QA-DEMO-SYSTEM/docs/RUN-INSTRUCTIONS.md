# QA Demo System — Run Instructions

> Bu doküman, `ARCHITECTURE.md`'de kararlaştırılan çalıştırma
> yöntemine (`npm install && npm run dev`) göre P4.1 (Demo Application
> Skeleton — Authentication + Products) kapsamındaki sistemin nasıl
> kurulup çalıştırılacağını, resetleneceğini ve doğrulanacağını
> anlatır.

---

## Gereksinimler

- Node.js `>= 22.5.0` (bu sistem `node:sqlite` yerleşik modülünü
  kullanır; harici bir SQLite paketi/native binding gerekmez).
- Docker **gerekli değildir** (Human Founder kararı — bkz.
  `ARCHITECTURE.md` bölüm 6).

---

## Kurulum

Repository kökünden:

```bash
cd QA-DEMO-SYSTEM
npm install
```

Bu komut, `backend/` workspace'inin tüm bağımlılıklarını (yalnızca
`express`) kurar.

---

## Çalıştırma

```bash
npm run dev
```

- Backend `http://localhost:3000` adresinde ayağa kalkar (varsayılan
  port, `PORT` environment variable'ı ile değiştirilebilir).
- Frontend, backend tarafından statik olarak aynı adresten servis
  edilir — ayrı bir frontend sunucusu/port gerekmez.
- Veritabanı boşsa (`backend/data/qa-demo.db` yoksa veya `users`
  tablosu boşsa) sistem otomatik olarak `shared/test-data/` içindeki
  seed data ile kendini doldurur.

Tarayıcıda:

- `http://localhost:3000/` → Login ekranı
- `http://localhost:3000/products.html` → Ürün listesi ekranı

---

## Database Reset

Veritabanını sıfırlayıp yeniden seed etmek için:

```bash
npm run db:seed
```

Bu komut `users` ve `products` tablolarındaki tüm satırları siler ve
`shared/test-data/auth-users.json` + `shared/test-data/products.json`
dosyalarından yeniden doldurur — deterministik ve tekrar
üretilebilirdir.

Veritabanı dosyasını (`backend/data/qa-demo.db`) tamamen silmek de
güvenlidir; bir sonraki `npm run dev` çalıştırıldığında dosya ve şema
otomatik olarak yeniden oluşturulur.

---

## Test Kullanıcıları

Kaynak: `shared/test-data/auth-users.json` (Phase 2'nin
`03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/11-TEST-DATA.md`
dosyasındaki USER-01/USER-02 ile birebir aynı sentetik veriler).

| Email | Password | Status | Kullanım |
|---|---|---|---|
| `test.active01@example.com` | `ValidPass123!` | ACTIVE | Valid login senaryosu |
| `test.active02@example.com` | `ValidPass123!` | ACTIVE | İkinci aktif kullanıcı |

- **Invalid password senaryosu:** Yukarıdaki kullanıcılardan biriyle,
  yanlış bir şifre (örn. `WrongPass999!`) kullanın.
- **Unknown user senaryosu:** Sistemde kayıtlı olmayan herhangi bir
  email (örn. `nope@example.com`) kullanın.

Her iki hatalı senaryo da BR-AUTH-003 gereği **aynı** genel mesajı
döner: `"Email veya şifre hatalı"` — hangi alanın hatalı olduğu
belirtilmez.

> Not: Bu şifreler tamamen kurgusal test verisidir, gerçek bir
> kullanıcıya ait değildir (bkz. `CONTRIBUTING.md` — Real Company Data
> Rule). Demo veritabanında parolalar düz metin olarak saklanır; bu,
> P4.1'in minimum bağımlılık ilkesi gereği bilinçli bir tercihtir ve
> gerçek bir üretim güvenlik pratiği değildir.

---

## Seed Ürünleri

Kaynak: `shared/test-data/products.json`.

| Ürün | Fiyat | Stok |
|---|---|---|
| QA Demo Klavye | 149.90 | 25 (stokta) |
| QA Demo Mouse | 49.90 | 0 (stok yok) |
| QA Demo Monitör | 899.90 | 5 (stokta) |
| QA Demo Webcam | 259.90 | 12 (stokta) |

---

## Endpoint'ler (P4.1 Kapsamı)

| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/health` | Servis ayakta mı kontrolü |
| POST | `/api/auth/login` | `{ email, password }` → `200 + token/user` veya `401` |
| GET | `/api/products` | Tüm ürünlerin listesi (`in_stock` alanıyla) |
| GET | `/api/products/:id` | Tek ürün; yoksa `404` |

Orders, Payment ve Notifications endpoint'leri **bu pakette yoktur** —
P4.2/P4.3'te eklenecektir (bkz. `ARCHITECTURE.md` bölüm 22).

---

## Otomatik Testler

```bash
npm test
```

`backend/tests/` altında `node --test` (harici test framework
gerekmez) ile çalışan minimum kapsam:

- `auth.test.js`: valid login, invalid password, unknown user
- `products.test.js`: ürün listesi (stokta/stok yok), tekil ürün,
  bilinmeyen ürün → 404
- `seed.test.js`: seed işleminin deterministik şekilde users/products
  tablolarını doldurduğu

---

## Smoke Doğrulama Adımları

P4.1 kapanışında aşağıdaki adımlar gerçek sistem üzerinde çalıştırılıp
doğrulanmıştır (bkz. P4.1 kapanış raporu):

1. `npm install` → hatasız tamamlanır.
2. `npm run dev` → `"QA Demo System backend http://localhost:3000
   adresinde çalışıyor."` log satırı görülür.
3. `GET /api/health` → `{"status":"ok"}`.
4. `GET /` ve `GET /products.html` → `200 OK`.
5. `POST /api/auth/login` (valid user) → `200` + token.
6. `POST /api/auth/login` (invalid password) → `401` + genel mesaj.
7. `POST /api/auth/login` (unknown user) → `401` + aynı genel mesaj.
8. `GET /api/products` → 4 ürün, en az biri `in_stock:false`.
9. `GET /api/products/:id` (var olan) → `200`; (olmayan) → `404`.
10. Server log'unda beklenmeyen hata yok (yalnızca beklenen
    `node:sqlite` experimental uyarısı).
