# 🚀 Quick Database Setup - Volledig Werkend Platform

## ⚡ Snelle Oplossing (5 minuten)

### Optie 1: Neon Database (Aanbevolen - Gratis)

1. **Ga naar https://neon.tech**
2. **Maak account aan** (gratis)
3. **Create new project:** "mihaela-fitness"
4. **Copy connection string** (ziet er zo uit):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

5. **Update .env.local:**
   ```bash
   # Database Configuration - Neon
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
   
   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_token_here"
   
   # JWT Authentication
   JWT_SECRET="mihaela_fitness_super_secret_jwt_key_2024_development"
   
   # Application Settings
   NODE_ENV="development"
   NEXTAUTH_URL="http://localhost:3001"
   NEXTAUTH_SECRET="mihaela_fitness_nextauth_secret_2024"
   ```

### Optie 2: Supabase Database (Gratis)

1. **Ga naar https://supabase.com**
2. **Maak account aan** (gratis)
3. **Create new project:** "mihaela-fitness"
4. **Ga naar Settings → Database**
5. **Copy connection string**

### Optie 3: Railway Database (Gratis)

1. **Ga naar https://railway.app**
2. **Maak account aan** (gratis)
3. **Create new project**
4. **Add PostgreSQL database**
5. **Copy connection string**

## 🔧 Database Setup Commands

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Push schema naar database
npm run db:push

# 3. Seed database met test data (optioneel)
npm run db:seed

# 4. Start development server
npm run dev
```

## 🎯 Vercel Blob Setup (Voor Afbeeldingen)

1. **Ga naar https://vercel.com/dashboard**
2. **Klik op je project**
3. **Ga naar Storage tab**
4. **Create Blob store**
5. **Copy BLOB_READ_WRITE_TOKEN**
6. **Update .env.local**

## ✅ Test Database Connectie

```bash
curl http://localhost:3001/api/test-db-connection
```

**Verwacht resultaat:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "userCount": 0,
    "workoutCount": 0,
    "exerciseCount": 0
  }
}
```

## 🧪 Test Alle API's

```bash
# Test users API
curl http://localhost:3001/api/users

# Test workouts API
curl http://localhost:3001/api/workouts

# Test exercises API
curl http://localhost:3001/api/exercises

# Test stats API
curl http://localhost:3001/api/stats
```

## 🎉 Volledig Werkend Platform

Na deze setup heb je:
- ✅ **PostgreSQL Database** - Via cloud provider
- ✅ **Complete CRUD API's** - Voor alle data operaties
- ✅ **Authentication** - JWT tokens
- ✅ **File Upload** - Vercel Blob storage
- ✅ **Real-time Data** - Database-driven platform

## 🆘 Troubleshooting

### Database Connection Error:
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
npm run db:push
```

### API Endpoint Error:
```bash
# Check server logs
# Verify environment variables
# Test individual endpoints
```

### Prisma Client Error:
```bash
# Regenerate client
npm run db:generate
```

---

**🎯 Met deze setup heb je binnen 5 minuten een volledig werkend platform!**
