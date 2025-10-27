# Test Profile Image Upload

## Setup
1. Pokreni backend server
2. Otvori Postman ili Thunder Client

## Test 1 - Uspešan upload
**PATCH** `http://localhost:4000/api/users/{username}`

Headers:
```
Content-Type: multipart/form-data
```

Body (form-data):
- `name`: Test User
- `image`: [SELECT FILE - slika.jpg]

Expected:
- Status: 200
- Response: `{ message: "Profil uspešno ažuriran", user: {...} }`
- File created: `uploads/users/{username}.png`
- Check user.image field - should be `uploads/users/{username}.png`

## Test 2 - Slika previše mala
Upload image < 100x100px

Expected:
- Status: 500
- Error: "Slika mora biti najmanje 100x100px"
- Temp file deleted from `uploads/tmp/`

## Test 3 - Pogrešan format
Upload .gif ili .pdf file

Expected:
- Status: 500
- Error: "Dozvoljeni su samo JPG i PNG"

## Test 4 - Path separators (Windows bug)
Nakon upload-a proveri:
```sql
db.users.findOne({ username: "testuser" })
```
Proveri `image` field:
- ❌ BAD: `uploads\users\testuser.png` (backslash)
- ✅ GOOD: `uploads/users/testuser.png` (forward slash)

## Test 5 - Dvostruki upload (ne briše staru)
1. Upload sliku prvi put
2. Upload drugu sliku
3. Proveri da li postoje obe verzije u `uploads/users/`

Expected:
- Trebalo bi da bude samo jedna slika
- Stara treba biti obrisana
