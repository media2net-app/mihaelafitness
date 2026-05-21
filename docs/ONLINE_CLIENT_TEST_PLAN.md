# Online client (Training-Only) — testplan & scripts

## Automatische API-tests

```bash
# 1. Database tabellen (eenmalig per omgeving)
npm run db:ensure-online

# 2. Demo-account met plan + onboarding compleet
node scripts/setup-demo-online-client.js

# 3. Dev server
npm run dev

# 4. Alle API-endpoints (17 checks)
npm run test:online
# of tegen productie (als DNS/SSL OK):
npm run test:online -- https://www.mihaelafitness.com
```

**Demo login:** `demo-online@mihaelafitness.com` / `DemoOnline2025`

---

## Handmatige checklist (UI)

| # | Flow | Route | Verwacht |
|---|------|-------|----------|
| 1 | Login online | `/login` | Redirect dashboard of onboarding |
| 2 | Onboarding | `/my-progression/onboarding` | Profiel + **3 trainingsdagen** kiezen → dashboard |
| 3 | Dashboard | `/dashboard` | Training card, water (scroll glazen), lifestyle-teaser, food |
| 4 | Water | Dashboard | + voegt glas toe; teller `x/8`; scroll naar glas 6–8 |
| 5 | Training dagen | `/schedule` | Weekpicker bovenaan; opslaan werkt |
| 6 | Workout | `/workout` | Start → timer → sets loggen → afronden |
| 7 | Food | `/food-tracking` | 6 slots; foto upload (max 10MB); stats op dashboard |
| 8 | Lifestyle | `/lifestyle` | Uitleg + max 3 habits + dagelijks afvinken + weekgrid |
| 9 | Progressie | `/my-progression` | Gewicht + training tabs (sterkte/PR/consistency) |
| 10 | Menu | Hamburger | Alle online pagina’s bereikbaar |

---

## API-overzicht

| Endpoint | Methode | Functie |
|----------|---------|---------|
| `/api/auth/login` | POST | Token |
| `/api/online-profile` | GET/POST | Onboarding |
| `/api/online-training-days` | GET/PUT | Trainingsdagen klant |
| `/api/online-water` | GET/POST | Water per dag |
| `/api/online-habits` | GET/POST | Habits library + logs |
| `/api/food-tracking` | GET/POST/DELETE | Maaltijdfoto’s (Vercel Blob) |
| `/api/food-tracking/stats` | GET | Streak / missed days |
| `/api/online-workout` | GET/POST | Sessie start/complete |
| `/api/exercise-set-logs` | GET/POST | Gewicht per set |
| `/api/online-training-progress` | GET | Charts / PRs |

---

## Database tabellen

- `online_client_profiles`
- `daily_food_photos`
- `daily_water_tracking`
- `online_workout_sessions`
- `online_client_habits` / `online_habit_daily_logs`
- `exercise_set_logs` (snake_case kolommen in DB)

Script: `scripts/ensure-all-online-tables.js`

---

## Bekende vereisten productie

1. **`BLOB_READ_WRITE_TOKEN`** — verplicht voor food foto-upload
2. **`DATABASE_URL`** — Prisma Accelerate / Postgres
3. **`JWT_SECRET`** — auth tokens
4. Na schema-fix: **nieuwe deploy** + `npm run db:ensure-online` op productie-DB

---

## Resultaat laatste run (lokaal)

**17/17 API tests passed** na fix `ExerciseSetLog` `@map` snake_case kolommen.
