# DZ65 — Express + Passport + MongoDB CRUD (з готовими в'юшками)

## Як запустити
```bash
cp .env.example .env
# заповніть MONGODB_URI, MONGODB_DBNAME, SESSION_SECRET
npm i
npm run dev
```

## Маршрути
- `GET /api/items?limit&skip&q=key:val&fields=_id,name` — find + projection
- `POST /api/items` — insertOne (після логіну)
- `POST /api/items/bulk` — insertMany
- `PATCH /api/items/:id` — updateOne
- `PATCH /api/items` — updateMany (body: { filter, update })
- `PUT /api/items/:id` — replaceOne
- `DELETE /api/items/:id` — deleteOne
- `DELETE /api/items` — deleteMany (body: { filter })

## Авторизація (демо)
- Логін: `admin`
- Пароль: `admin123`

> Щоб використати ваш Passport з ДЗ-63 — просто замініть вміст `config/passport.js` на ваш.