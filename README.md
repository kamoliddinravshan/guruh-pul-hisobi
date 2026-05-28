Guruh Pul Hisobi
Guruh Pul Hisobi - do'stlar, oila a'zolari yoki jamoa bilan qilingan xarajatlarni yozib borish, ulushlarni hisoblash va qarzlarni soddalashtirish uchun web-ilova.

Imkoniyatlar
Guruh yaratish va guruh a'zolari bilan xarajatlarni boshqarish
Xarajat summasi, to'lovchi, ishtirokchilar va kategoriya bo'yicha yozuv qo'shish
Har bir guruh uchun umumiy xarajatlarni ko'rish
Kim kimga qancha to'lashi kerakligini avtomatik hisoblash
Qarzlarni minimal tranzaksiyalarga qisqartirish
Email/parol, Google va Telegram orqali autentifikatsiya
Frontendda prototip ma'lumotlarni localStorage orqali saqlash
Backendda JWT, MongoDB va Express asosida API namunasi
Texnologiyalar
React
TypeScript
Vite
Tailwind CSS
shadcn-ui
Express
MongoDB
JWT
Loyihani ishga tushirish
Frontend
npm install
cp .env.example .env
npm run dev
Frontend odatda quyidagi manzilda ishga tushadi:

http://localhost:8080
.env faylida quyidagi qiymatlarni sozlang:

VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=google_client_id
VITE_TELEGRAM_BOT_USERNAME=telegram_bot_username
Backend
cd server
npm install
cp .env.example .env
npm run dev
server/.env faylida quyidagi qiymatlarni sozlang:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/xarajat_taqsimlagich
JWT_SECRET=mustahkam_maxfiy_kalit
CLIENT_URL=http://localhost:8080
GOOGLE_CLIENT_ID=google_client_id
TELEGRAM_BOT_TOKEN=telegram_bot_token
Autentifikatsiya sozlamalari
Google orqali kirish ishlashi uchun Google Cloud Console'da OAuth Client ID yarating va frontend hamda backend .env fayllariga bir xil GOOGLE_CLIENT_ID qiymatini kiriting.

Telegram orqali kirish ishlashi uchun BotFather orqali bot yarating, domenni sozlang va backend .env fayliga TELEGRAM_BOT_TOKEN, frontend .env fayliga esa VITE_TELEGRAM_BOT_USERNAME qiymatini kiriting.

Muhim fayllar
src/pages/Login.tsx - login va ro'yxatdan o'tish sahifasi
src/lib/auth.tsx - frontend autentifikatsiya provider'i
src/lib/settlement.ts - balans va qarzlarni soddalashtirish algoritmi
src/lib/storage.ts - prototip ma'lumotlarni saqlash yordamchilari
server/src/routes/auth.routes.js - email, Google va Telegram autentifikatsiya endpointlari
server/src/routes/group.routes.js - guruh, xarajat va hisob-kitob API endpointlari
server/src/models/User.js - foydalanuvchi modeli
README_BMI_LOYIHA.md - BMI uchun qisqa ishga tushirish yo'riqnomasi
Build va tekshirish
npm run build
npm run lint
Backend fayllarini sintaksis bo'yicha tekshirish:

node --check server/src/server.js
node --check server/src/routes/auth.routes.js
GitHub
Repository manzili:

https://github.com/kamoliddinravshan/guruh-pul-hisobi.git
