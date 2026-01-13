# 🔄 Backup Recovery Guide - Zoeken naar verwijderde data

## 📋 Situatie
Het voedingsplan van Andreea Radulescu (ID: `cmhz9zcck0000ie04rtjh9rod`) is waarschijnlijk verwijderd en het ID is hergebruikt voor een plan van Andreea Nuta.

## 🔍 Methoden om backups te vinden

### 1. Supabase Point-in-Time Recovery (PITR)

Supabase biedt Point-in-Time Recovery voor PostgreSQL databases:

1. **Ga naar Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Selecteer je project
   - Ga naar **Database** → **Backups**

2. **Zoek naar backup van 9 november 2025:**
   - Klik op "Point-in-Time Recovery"
   - Selecteer datum: **9 november 2025**
   - Kies een tijdstip (bijv. 12:00)
   - Klik op "Restore to this point"

3. **Query uitvoeren op backup:**
   ```sql
   -- Zoek naar plan met ID cmhz9zcck0000ie04rtjh9rod op 9 november
   SELECT * FROM nutrition_plans 
   WHERE id = 'cmhz9zcck0000ie04rtjh9rod';
   
   -- Zoek naar assignments voor Andreea Radulescu
   SELECT cnp.*, np.name as plan_name, u.name as customer_name
   FROM customer_nutrition_plans cnp
   JOIN nutrition_plans np ON cnp."nutritionPlanId" = np.id
   JOIN users u ON cnp."customerId" = u.id
   WHERE u.name ILIKE '%Radulescu%'
   AND cnp."assignedAt" <= '2025-11-09 23:59:59';
   ```

### 2. Via Prisma - Direct SQL Queries

Je kunt via Prisma direct SQL queries uitvoeren:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Zoek in backup SQL bestanden
async function searchInBackup() {
  // Lees backup bestand
  const backupContent = await fs.readFile(
    './backups/supabase_backup_20251016_195403.sql',
    'utf-8'
  );
  
  // Zoek naar plan ID
  const planMatch = backupContent.match(
    new RegExp(`cmhz9zcck0000ie04rtjh9rod[\\s\\S]{0,5000}`, 'i')
  );
  
  if (planMatch) {
    console.log('Plan gevonden in backup!');
    console.log(planMatch[0]);
  }
  
  // Zoek naar Andreea Radulescu assignments
  const assignmentMatch = backupContent.match(
    new RegExp(`cmgziq5zr000ijp04wig5wn45[\\s\\S]{0,5000}`, 'i')
  );
  
  if (assignmentMatch) {
    console.log('Assignment gevonden in backup!');
    console.log(assignmentMatch[0]);
  }
}
```

### 3. Via Prisma - Query Raw SQL

```typescript
// Als je toegang hebt tot een backup database
const result = await prisma.$queryRaw`
  SELECT 
    np.id,
    np.name,
    np."weekMenu",
    np."createdAt",
    cnp."assignedAt",
    u.name as customer_name
  FROM nutrition_plans np
  LEFT JOIN customer_nutrition_plans cnp ON np.id = cnp."nutritionPlanId"
  LEFT JOIN users u ON cnp."customerId" = u.id
  WHERE np.id = 'cmhz9zcck0000ie04rtjh9rod'
  OR (u.name ILIKE '%Radulescu%' AND cnp."assignedAt" <= '2025-11-09')
  ORDER BY cnp."assignedAt" DESC;
`;
```

### 4. Backup SQL Bestanden Doorzoeken

De backup bestanden staan in `/backups/`:

```bash
# Zoek in backup bestanden
cd backups
grep -i "cmhz9zcck0000ie04rtjh9rod" *.sql
grep -i "Radulescu" *.sql
grep -i "cmgziq5zr000ijp04wig5wn45" *.sql
```

### 5. Supabase Logs Controleren

1. Ga naar Supabase Dashboard
2. **Logs** → **Postgres Logs**
3. Filter op datum: **9 november 2025**
4. Zoek naar:
   - `DELETE FROM nutrition_plans`
   - `DELETE FROM customer_nutrition_plans`
   - `cmhz9zcck0000ie04rtjh9rod`

## 🛠️ Praktische Stappen

### Stap 1: Check Supabase PITR
```bash
# Ga naar Supabase dashboard en check of PITR beschikbaar is
# Meestal beschikbaar voor betaalde plannen
```

### Stap 2: Zoek in Lokale Backups
```bash
cd /Users/gebruiker/Desktop/MIHAELAFITNESS/mihaela-fitness/backups
grep -A 50 "cmhz9zcck0000ie04rtjh9rod" supabase_backup_20251016_195403.sql
```

### Stap 3: Maak Script om Backup te Doorzoeken
Zie `search-backup-files.ts` voor een volledig script.

### Stap 4: Als Plan Gevonden Wordt
1. Extract de `weekMenu` data uit backup
2. Maak nieuw plan aan met dezelfde data
3. Wijs toe aan Andreea Radulescu

## 📝 Notities

- **Backup datums:** 16 oktober 2025 (te vroeg voor 9 november)
- **Huidig plan:** Aangemaakt op 14 november 2025 (na 9 november)
- **Conclusie:** Plan is waarschijnlijk verwijderd tussen 9-14 november

## 🔗 Handige Links

- [Supabase PITR Documentation](https://supabase.com/docs/guides/platform/backups#point-in-time-recovery)
- [Prisma Raw Queries](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)






