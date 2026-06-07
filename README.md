# Xarajat Taqsimlagich

Xarajat Taqsimlagich - do'stlar, talabalar va oilalar uchun guruh xarajatlarini shaffof boshqarish, ulushlarni avtomatik hisoblash va qarzlarni minimal to'lovlarga qisqartirish web-ilovasi.

## Texnologiyalar

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, Axios
- Backend: Python 3.12, Django 5, Django REST Framework, SimpleJWT
- Data: PostgreSQL 16, Redis 7, Celery
- Docs: drf-spectacular, Swagger `/api/docs/`
- Deploy: Gunicorn, Nginx, Docker Compose

## Tuzilma

```text
server/
  config/settings/        Django base/development/production settings
  apps/accounts/          CustomUser, register/login/me/logout
  apps/groups/            Group, Membership, invite/join/leave
  apps/expenses/          Expense, ExpenseSplit, debt simplification
  apps/settlements/       Settlement, settle-up history
  core/                   API response, pagination, exceptions, utils
  docker/                 Backend Dockerfile and Nginx config
src/
  features/               Auth, groups, expenses, settlements, dashboard APIs/components
  shared/                 API client, hooks, utils, types
  stores/                 Zustand slices
```

## Backendni ishga tushirish

```bash
cd server
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8081
```

`server/.env`:

```env
SECRET_KEY=change-me-minimum-50-random-characters-for-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
DATABASE_URL=postgresql://xarajat:xarajat@localhost:5432/xarajat_db
REDIS_URL=redis://localhost:6379/1
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

PostgreSQL bazasini yarating:

```bash
createdb xarajat_db
```

## Frontendni ishga tushirish

```bash
npm install
cp .env.example .env
npm run dev
```

`.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## API endpointlar

- `POST /api/v1/auth/register/`
- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/token/refresh/`
- `POST /api/v1/auth/logout/`
- `GET/PATCH /api/v1/auth/me/`
- `GET/POST /api/v1/groups/`
- `GET/PATCH/DELETE /api/v1/groups/{id}/`
- `POST /api/v1/groups/{id}/invite/`
- `POST /api/v1/groups/join/{code}/`
- `DELETE /api/v1/groups/{id}/leave/`
- `GET/POST /api/v1/groups/{id}/expenses/`
- `GET/PATCH/DELETE /api/v1/expenses/{id}/`
- `GET /api/v1/groups/{id}/balances/`
- `GET /api/v1/groups/{id}/settlements/`
- `POST /api/v1/groups/{id}/settle/`
- `GET /api/v1/groups/{id}/history/`

## Test

Backend:

```bash
cd server
pytest
```

Frontend:

```bash
npm run test
npm run build
npm run lint
```

## Docker

Root papkada `.env` yarating:

```env
SECRET_KEY=judayam_uzun_random_secret_key_kamida_50_belgi
DB_PASSWORD=XarajatDB_2026!Ravshanov
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,http://SERVER_IP:8090
VITE_API_URL=/api/v1
NGINX_PORT=8090
SECURE_SSL_REDIRECT=False
```

`ALLOWED_HOSTS=*` IP orqali test qilishda Django `400 Bad Request` qaytarmasligi uchun qulay. Domen ulangandan keyin uni `SERVER_IP,yourdomain.uz,www.yourdomain.uz` qilib cheklash mumkin.

Ishga tushirish:

```bash
docker compose up -d --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

Servislar:

- Frontend/Nginx: `http://localhost`
- Backend API: `http://localhost/api/v1`
- Swagger: `http://localhost/api/docs/`

Server IP orqali ochilganda, masalan `NGINX_PORT=8090` bo'lsa:

- Frontend/Nginx: `http://SERVER_IP:8090`
- Backend API: `http://SERVER_IP:8090/api/v1`
- Swagger: `http://SERVER_IP:8090/api/docs/`

## English Setup

Xarajat Taqsimlagich is a production-oriented expense splitting app for Uzbek users. Run PostgreSQL and Redis locally, install backend requirements from `server/requirements.txt`, migrate the database, then start Django on port `8000`. The frontend runs with Vite on port `8080` and consumes `/api/v1`.

For Docker-based development, set `SECRET_KEY`, `DB_PASSWORD`, `ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS`, then run:

```bash
docker compose up --build
```
