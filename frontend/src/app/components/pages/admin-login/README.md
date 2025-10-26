# Admin Login - Posebna Ruta

## Pristup

Administrator sistema se prijavljuje preko posebne forme koja **NIJE javno vidljiva**:

**URL:** `http://localhost:4200/sys/admin/login`

## Validacija

- Forma koristi isti backend endpoint kao i obična login forma (`POST /auth/login`)
- Nakon uspešne autentifikacije, frontend **dodatno validira** da je `user.role === 'admin'`
- Ako korisnik nema admin ulogu, dobija poruku: *"Nemate administratorska prava. Ova forma je samo za administratore."*
- Korisnik se automatski odjavljuje ako nije admin

## Razlike u odnosu na običan login

| Obična prijava `/login` | Admin prijava `/sys/admin/login` |
|------------------------|----------------------------------|
| Javno vidljiva u navigaciji | Nije linkována nigde u UI-ju |
| Za turiste i vlasnike | Samo za administratore |
| Redirect na `/cottages` | Redirect na `/admin/cottages` |
| Bez validacije role | Validira da je `role === 'admin'` |

## UI Razlike

- **Crvena tema** umesto plave (danger buttons)
- **Admin badge** (🔐 ADMIN) na vrhu forme
- Upozorenje: *"Pristup ovoj stranici je ograničen samo na administratore sistema"*
- Card sa crvenim borderom

## Testiranje

Korisničko ime: `admin`  
Lozinka: `123456A!`

Navigiraj na: `http://localhost:4200/sys/admin/login`
