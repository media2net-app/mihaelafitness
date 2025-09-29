# 🗄️ Complete Database Setup Guide - Mihaela Fitness

## 📋 Overzicht

Dit platform gebruikt **PostgreSQL** als primaire database via **Prisma ORM** en **Vercel Blob** voor afbeelding opslag. Hier is de complete setup voor volledige database controle.

## 🔧 1. Environment Variabelen Configuratie

### Create `.env.local` bestand in de root directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@hostname:port/database_name?schema=public"

# Prisma Accelerate (Optioneel - voor snellere queries)
PRISMA_ACCELERATE_URL="prisma://accelerate.prisma-data.net/?api_key=your_api_key"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_token_here"

# JWT Authentication
JWT_SECRET="your_super_secret_jwt_key_here_minimum_32_characters"

# Application Settings
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your_nextauth_secret_here"
```

## 🐘 2. PostgreSQL Database Setup

### Optie A: Lokale PostgreSQL (Development)
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb mihaela_fitness_dev

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/mihaela_fitness_dev?schema=public"
```

### Optie B: Cloud Database (Production)
**Aanbevolen providers:**
- **Neon** (Gratis tier): https://neon.tech
- **Supabase** (Gratis tier): https://supabase.com
- **Railway** (Gratis tier): https://railway.app
- **PlanetScale** (Gratis tier): https://planetscale.com

**Voor Neon (Aanbevolen):**
1. Ga naar https://neon.tech
2. Maak account aan
3. Create new project: "mihaela-fitness"
4. Copy connection string
5. Update DATABASE_URL in .env.local

## 📦 3. Vercel Blob Setup

### Voor Afbeelding Opslag:
1. Ga naar https://vercel.com/dashboard
2. Klik op je project
3. Ga naar "Storage" tab
4. Maak nieuwe Blob store aan
5. Copy de `BLOB_READ_WRITE_TOKEN`
6. Voeg toe aan `.env.local`

## 🔑 4. Database Migraties & Setup

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Push schema naar database
npm run db:push

# 3. Seed database met test data (optioneel)
npm run db:seed
```

## 🚀 5. Development Server Starten

```bash
# Start development server
npm run dev

# Server draait op: http://localhost:3001
```

## 📊 6. Database Management Tools

### Prisma Studio (Aanbevolen)
```bash
# Start Prisma Studio
npx prisma studio

# Draait op: http://localhost:5555
```

### Alternative: Database GUI Tools
- **pgAdmin** (PostgreSQL native)
- **DBeaver** (Universal database tool)
- **TablePlus** (macOS/Windows)

## 🔍 7. Database API Endpoints

Het platform heeft complete CRUD API's voor alle data:

### Users API
```bash
GET    /api/users              # Alle gebruikers
POST   /api/users              # Nieuwe gebruiker
GET    /api/users/[id]         # Specifieke gebruiker
PUT    /api/users/[id]         # Update gebruiker
DELETE /api/users/[id]         # Verwijder gebruiker
```

### Workouts API
```bash
GET    /api/workouts           # Alle workouts
POST   /api/workouts           # Nieuwe workout
GET    /api/workouts/[id]      # Specifieke workout
PUT    /api/workouts/[id]      # Update workout
DELETE /api/workouts/[id]      # Verwijder workout
```

### Nutrition Plans API
```bash
GET    /api/nutrition-plans    # Alle voedingsplannen
POST   /api/nutrition-plans    # Nieuw voedingsplan
GET    /api/nutrition-plans/[id] # Specifiek plan
PUT    /api/nutrition-plans/[id] # Update plan
DELETE /api/nutrition-plans/[id] # Verwijder plan
```

### Training Sessions API
```bash
GET    /api/training-sessions  # Alle sessies
POST   /api/training-sessions  # Nieuwe sessie
PUT    /api/training-sessions  # Update sessie
DELETE /api/training-sessions  # Verwijder sessie
```

### Customer Photos API (Vercel Blob)
```bash
GET    /api/customer-photos    # Alle foto's per klant
POST   /api/customer-photos    # Upload nieuwe foto
PUT    /api/customer-photos    # Update foto
DELETE /api/customer-photos    # Verwijder foto
```

### Exercises API
```bash
GET    /api/exercises          # Alle oefeningen
POST   /api/exercises          # Nieuwe oefening
GET    /api/exercises/[id]     # Specifieke oefening
PUT    /api/exercises/[id]     # Update oefening
DELETE /api/exercises/[id]     # Verwijder oefening
```

## 🧪 8. Database Testing

### Test Database Connectie:
```bash
curl http://localhost:3001/api/test-db-connection
```

### Test Statistics:
```bash
curl http://localhost:3001/api/stats
```

## 📈 9. Database Schema Overzicht

### Core Tables:
- **users** - Klantgegevens
- **workouts** - Trainingsschema's
- **exercises** - Oefeningen bibliotheek
- **nutrition_plans** - Voedingsplannen
- **services** - Services & tarieven

### Relational Tables:
- **customer_workouts** - Klant-workout toewijzingen
- **customer_nutrition_plans** - Klant-voedingsplan toewijzingen
- **training_sessions** - Trainingssessies
- **customer_measurements** - Klant metingen
- **customer_progression** - Voortgang tracking
- **customer_photos** - Klant foto's (Vercel Blob URLs)
- **workout_exercises** - Workout-oefening relaties
- **customer_schedule_assignments** - Schema toewijzingen

### Supporting Tables:
- **achievements** - Prestaties
- **goals** - Doelen
- **pricing_calculations** - Prijsberekeningen
- **nutrition_calculations** - Voeding berekeningen
- **ingredients** - Ingrediënten database

## 🔒 10. Security & Authentication

### JWT Authentication:
- Alle API endpoints zijn beveiligd
- JWT tokens voor sessie management
- Role-based access control

### Demo Account:
```
Email: demo@mihaelafitness.com
Password: demo123
```

## 🚀 11. Production Deployment

### Vercel Deployment:
1. Push code naar GitHub
2. Connect repository aan Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatisch

### Environment Variables voor Production:
```bash
DATABASE_URL="postgresql://..."
BLOB_READ_WRITE_TOKEN="..."
JWT_SECRET="..."
NODE_ENV="production"
```

## 📝 12. Database Backup & Recovery

### Backup:
```bash
# Database backup
pg_dump mihaela_fitness > backup.sql

# Restore
psql mihaela_fitness < backup.sql
```

### Prisma Migrations:
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy
```

## ✅ 13. Checklist voor Volledige Setup

- [ ] PostgreSQL database aangemaakt
- [ ] DATABASE_URL geconfigureerd
- [ ] Vercel Blob token geconfigureerd
- [ ] JWT_SECRET ingesteld
- [ ] Prisma client gegenereerd
- [ ] Database schema gepusht
- [ ] Development server draait
- [ ] API endpoints getest
- [ ] Prisma Studio toegankelijk
- [ ] Authentication werkt
- [ ] File upload functionaliteit werkt

## 🆘 14. Troubleshooting

### Database Connection Error:
```bash
# Check DATABASE_URL format
# Test connection
npm run db:push
```

### Prisma Client Error:
```bash
# Regenerate client
npm run db:generate
```

### Vercel Blob Error:
```bash
# Check BLOB_READ_WRITE_TOKEN
# Verify Vercel project settings
```

### API Endpoint Error:
```bash
# Check server logs
# Verify environment variables
# Test individual endpoints
```

## 📞 15. Support

Voor vragen over de database setup:
- Check Prisma documentation: https://prisma.io/docs
- Vercel Blob docs: https://vercel.com/docs/storage/vercel-blob
- PostgreSQL docs: https://postgresql.org/docs

---

**🎯 Resultaat:** Volledige database controle met CRUD operaties, real-time data, en cloud storage voor afbeeldingen.
