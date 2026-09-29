# Authentication Bug — Actual Result

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [README.md](README.md)
>
> Aşağıdaki "gözlemlenen" davranış tamamen kurgusaldır; gerçek bir
> HTTP response, gerçek bir production sistemi veya gerçek bir
> backend davranışı temsil etmez.

---

## Actual Result (Kurgusal)

> Kullanıcı login olamıyor (bu kısım Expected Result ile **uyumlu**)
> ANCAK sistem, "Email veya şifre hatalı" yerine **generic bir
> internal error** davranışı sergiliyor ve UI, kullanıcıya "System
> Error — Please try again later" (varsayımsal) benzeri bir mesaj
> gösteriyor.

---

## Expected ile Actual Karşılaştırması

| | Expected Result | Actual Result (Kurgusal) |
|---|---|---|
| Login sonucu | Reddedilir | Reddedilir ✔ (bu kısım doğru) |
| Gösterilen mesaj | "Email veya şifre hatalı" | "System Error — Please try again later" ✘ |
| Hangi alan hatalı belirtiliyor mu | Hayır (doğru davranış) | Hayır (bu kısım da doğru — ama nedeni farklı: gerçek hata mesajı hiç gösterilmediği için) |

---

## Bu Neden Bir Defect'tir?

Authentication'ın reddedilmesi **doğru** olsa da, kullanıcıya
gösterilen mesaj **yanlış** — bu, AC-AUTH-004'ü doğrudan ihlal
ediyor. Kullanıcı, gerçek sorunun (yanlış şifre girmiş olması) ne
olduğunu anlayamıyor ve muhtemelen bir sistem arızası olduğunu
düşünecek — bu, kullanıcı deneyimini olumsuz etkiliyor (bkz.
`07-SEVERITY-PRIORITY.md`).

---

## Sonraki Adım

[07 — Severity / Priority](07-SEVERITY-PRIORITY.md)
