# 🚀 Supabase Migration Guide

## ⚡ STAP 1: Update .env.local

**Open `.env.local` en vervang de inhoud met:**

```bash
# Supabase Database - Direct Connection  
DATABASE_URL="postgres://postgres.efpqeufpwnwuyzsuikhf:ETxEgx2E6UDUfwLt@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_BDEIjRMqxsTZRKa8_24ZkD97dbXRvynyDlTAFkRHmagcicX"

# JWT Authentication
JWT_SECRET="mihaela_fitness_super_secret_jwt_key_2024_production"

# Application Settings
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:6001"
NEXTAUTH_SECRET="mihaela_fitness_nextauth_secret_2024_production"

# Supabase Config (optional)
NEXT_PUBLIC_SUPABASE_URL="https://efpqeufpwnwuyzsuikhf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcHFldWZwd253dXl6c3Vpa2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTU0MjAsImV4cCI6MjA3NTU5MTQyMH0.HMaeEOgnVRGlLoLWJ2U4RdyrfMfawzhBiig0pazMqVM"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcHFldWZwd253dXl6c3Vpa2hmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAxNTQyMCwiZXhwIjoyMDc1NTkxNDIwfQ.GorUXRP5ya0z-42VD77tEQ8_vL36vMFXHBJ3-qNP3tk"
```

## 🚀 STAP 2: Run Migration Script

**Open terminal en run:**

```bash
node migrate-to-supabase.js
```

Dit script zal:
- ✅ Data exporteren van oude database
- ✅ Schema pushen naar Supabase  
- ✅ Data importeren naar Supabase
- ✅ Backup maken (migration-backup.json)

**Verwachte output:**
```
🚀 SUPABASE MIGRATION STARTING...
📤 STEP 1: Exporting data...
   - Users: 3
   - Ingredients: 234
   - Nutrition Plans: 2
   ...
📋 STEP 2: Pushing schema...
📥 STEP 3: Importing data...
🎉 MIGRATION COMPLETE!
```

## ✅ STAP 3: Test Lokaal

**Start development server:**

```bash
npm run dev -- -p 6001
```

**Test URLs:**
- Admin: http://localhost:6001/admin/voedingsplannen
- Customer Plan: http://localhost:6001/my-plan/cmg72xn1g003sfofh52suc9zq

**Verwacht:**
- ✅ Alle ingrediënten laden
- ✅ Roemeense vertalingen werken
- ✅ Macro's tonen correct (niet 0!)
- ✅ Geen errors in console

## 🌐 STAP 4: Update Vercel Environment Variables

**Ga naar:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Update:**
- `DATABASE_URL` = `postgres://postgres.efpqeufpwnwuyzsuikhf:ETxEgx2E6UDUfwLt@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require`

**Alle andere blijven hetzelfde!**

## 🚀 STAP 5: Deploy naar Production

**Run:**

```bash
git add .
git commit -m "feat: Migrate to Supabase database"
git push origin main
npx vercel --prod --yes
```

**Test live:**
- https://www.mihaelafitness.com/my-plan/cmg72xn1g003sfofh52suc9zq

## 🎉 Success Criteria

- ✅ Lokaal werkt perfect
- ✅ Live toont correcte data (niet 0!)
- ✅ Roemeense vertalingen werken
- ✅ Alle macros correct berekend
- ✅ Shopping list werkt
- ✅ Admin pages laden

## 🆘 Troubleshooting

**Als migration script failt:**
1. Check `migration-backup.json` (data is veilig!)
2. Check DATABASE_URL in .env.local
3. Run opnieuw: `node migrate-to-supabase.js`

**Als lokaal niet werkt:**
1. Check .env.local is correct
2. Run: `npx prisma generate`
3. Restart server

**Als live niet werkt:**
1. Check Vercel env vars
2. Check deployment logs
3. Hard refresh browser (Ctrl+Shift+R)

