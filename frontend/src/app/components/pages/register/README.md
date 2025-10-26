# Registracija - Validacija Kreditnih Kartica

## Pravila Validacije

### Diners Club
- **Početak:** 300, 301, 302, 303, 36, ili 38
- **Dužina:** Tačno **15 cifara**
- **Primer:**
  - `300012345678901` ✅
  - `360123456789012` ✅
  - `380123456789012` ✅

### MasterCard
- **Početak:** 51, 52, 53, 54, ili 55
- **Dužina:** Tačno **16 cifara**
- **Primer:**
  - `5100123456789012` ✅
  - `5500123456789012` ✅

### Visa
- **Početak:** 4539, 4556, 4916, 4532, 4929, 4485, 4716
- **Dužina:** Tačno **16 cifara**
- **Primer:**
  - `4539123456789012` ✅
  - `4916123456789012` ✅
  - `4532123456789012` ✅

## Ikonica Kartice

Kada korisnik unese validan broj kartice, **pojavljuje se ikonica** pored input polja koja pokazuje detektovani tip kartice:

- 🔵 **Diners** - plava ikonica
- 🔴 **MasterCard** - crveno-narandžasta ikonica  
- 🟦 **Visa** - plavo-zlatna ikonica

Ikonica se animira (slide-in efekat) kada se detektuje validan format.

## Obavezna Polja

Sva polja su **obavezna** osim profilne slike:

- ✅ Korisničko ime (jedinstveno)
- ✅ Lozinka (6-10 karaktera, počinje slovom, veliko slovo, 3+ mala slova, broj, specijalan karakter)
- ✅ Ime
- ✅ Prezime
- ✅ Pol (M ili Z)
- ✅ Adresa
- ✅ Kontakt telefon
- ✅ Email (jedinstveno)
- ⚠️ Profilna slika (opciono - JPG/PNG)
- ✅ Broj kreditne kartice (Diners, MasterCard, ili Visa)

## Testiranje

Koristi sledeće testne brojeve:

```
Diners:     300012345678901
MasterCard: 5100123456789012
Visa:       4539123456789012
```

Nakon uspešne registracije, korisnik čeka odobrenje admina pre nego što može da se prijavi.
