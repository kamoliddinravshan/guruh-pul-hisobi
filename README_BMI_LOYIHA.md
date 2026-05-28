# Guruh xarajatlarini taqsimlash veb-ilovasi

Bu loyiha BMI uchun tayyorlangan web-ilova prototipi va server namunalaridan iborat.

## Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend React + TypeScript + Vite asosida ishlaydi. Prototip ma'lumotlarni `localStorage`da saqlaydi.
Google va Telegram orqali kirish uchun `.env` faylida `VITE_GOOGLE_CLIENT_ID` va `VITE_TELEGRAM_BOT_USERNAME` qiymatlarini kiriting.

## Backend namunasi

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Backend Express + MongoDB + JWT asosida yozildi. U guruhlar, xarajatlar va qarzlarni soddalashtirish API endpointlarini beradi.
Google autentifikatsiyasi uchun `GOOGLE_CLIENT_ID`, Telegram autentifikatsiyasi uchun esa `TELEGRAM_BOT_TOKEN` sozlanishi kerak.

## Asosiy algoritm

`src/lib/settlement.ts` faylida balanslarni hisoblash va qarzlarni minimal tranzaksiyalarga qisqartirish algoritmi yozilgan.
