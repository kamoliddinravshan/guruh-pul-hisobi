# Guruh xarajatlarini taqsimlash veb-ilovasi

Bu loyiha guruh xarajatlarini hisoblash, qarzlarni soddalashtirish va hisobot olish uchun tayyorlangan web-ilova.

## Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend React + TypeScript + Vite asosida ishlaydi. Google orqali kirish uchun `.env` faylida `VITE_GOOGLE_CLIENT_ID` qiymatini kiriting.

## Backend

Backend Python Django + PostgreSQL asosida yozildi.

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

`server/.env` faylida PostgreSQL va `GOOGLE_CLIENT_ID` sozlamalarini kiriting.

## Asosiy imkoniyatlar

- Sidebar va mobile responsive navigatsiya
- Guruhlar, qarzlar, faoliyat, hisobotlar va profil sahifalari
- Guruh ichki sahifasi va a'zolar balansi
- Qidiruv, filter, CSV export va chop etish
- Qarzlarni "to'landi" deb belgilash
- Django API va PostgreSQL bazasi
