# Plan 2026 - Klant Dashboard Features

## Visie
Een dashboard waar klanten hun eigen progressie kunnen zien, dagelijks hun taken kunnen afvinken, en consistentie kunnen behalen in training, voeding en waterinname.

---

## Dashboard Tabs/Secties

### 1. **Overview Tab** (Update voor Plan 2026)

**Focus: Weekoverzicht en Quick Actions**

- **Week Stats Cards:**
  - Deze week: Trainingen gedaan (3/3)
  - Deze week: Voeding gevolgd (5/7 dagen)
  - Deze week: Water doel behaald (6/7 dagen)
  - Consistentie score: 85% (gewogen gemiddelde)

- **Vandaag - Quick Actions:**
  - ✅ Training gedaan (checkbox)
  - ✅ Voeding gevolgd (checkbox)  
  - 💧 Water: [ 0 / 2L ] (progress bar met +/- buttons)
  - Status: "Goed bezig! 🎉" of "Kom op, je kan dit! 💪"

- **Deze Week Overzicht:**
  - Kalender view met per dag:
    - Training: ✅ / ❌
    - Voeding: ✅ / ❌
    - Water: ✅ / ❌ (2L doel)
  - Kleurcodering: groen = alles gedaan, geel = gedeeltelijk, rood = niets

- **Upcoming:**
  - Volgende training sessie
  - Weekcheck-in reminder (elke maandag)

---

### 2. **Daily Tasks Tab** (NIEUW)

**Dagelijkse Taken - Plan 2026 Focus**

**Vandaag:**
- Checklist met:
  - ☐ Training gedaan
  - ☐ Voeding gevolgd (volgens plan)
  - ☐ Water doel behaald (2L) - met input field
  - ☐ [Optional] Andere custom taken

**Deze Week:**
- Kalender grid view
- Per dag kan je zien/klikken:
  - Wat was geplanned
  - Wat is gedaan
  - Quick edit mogelijkheid

**Historie:**
- Scrollbare lijst van afgelopen weken
- Consistentie per week
- Streaks (bijv. "7 dagen op rij!")

---

### 3. **Weekly Check-in Tab** (NIEUW)

**Weekcheck-in - Elke Maandag**

**Huidige Week:**
- Status: "Nog niet ingevuld" / "Ingevuld op [datum]"
- Check-in formulier met:
  - Hoe voel je je deze week? (1-10 slider)
  - Energie level (1-10 slider)
  - Motivatie level (1-10 slider)
  - Wat ging goed deze week? (text area)
  - Waar had je moeite mee? (text area)
  - Gewicht update (optioneel)
  - Feedback voor coach (optioneel)
- Submit button

**Historie:**
- Lijst van vorige check-ins
- Grafiek: Energie en motivatie over tijd
- Trends en patronen

---

### 4. **My Plan Tab** (Update)

**Persoonlijk Plan Overzicht**

- **Training Plan:**
  - Weekoverzicht van geplande trainingen
  - Welke trainingen deze week
  - Link naar trainingsdetails

- **Nutrition Plan:**
  - Actief voedingsplan
  - Vandaag menu
  - Deze week overzicht
  - Macros doelen en behaald

- **Goals:**
  - Training doel: Xx per week
  - Water doel: 2L per dag
  - Voeding doel: Plan volgen
  - Custom doelen

---

### 5. **Progress Tab** (Update)

**Progress Tracking - Plan 2026 Focus**

- **Consistentie Grafieken:**
  - Training consistency (laatste 4 weken)
  - Voeding consistency (laatste 4 weken)
  - Water consistency (laatste 4 weken)
  - Overall consistency score

- **Trends:**
  - Gewicht over tijd
  - Maten over tijd
  - Check-in scores over tijd (energie, motivatie)

- **Achievements/Streaks:**
  - "7 dagen op rij training!"
  - "Perfecte week!"
  - "Maand consistentie!"

---

## Data Structuur (Database)

### DailyTask Model
```typescript
DailyTask {
  id
  customerId
  date (date only, no time)
  taskType: 'training' | 'nutrition' | 'water' | 'custom'
  taskName (voor custom tasks)
  completed: boolean
  waterAmount?: number (liters, alleen voor water type)
  notes?: string
  completedAt?: DateTime
  createdAt
  updatedAt
}
```

### WeeklyCheckIn Model
```typescript
WeeklyCheckIn {
  id
  customerId
  weekStartDate (maandag van de week)
  energyLevel: number (1-10)
  motivationLevel: number (1-10)
  howAreYouFeeling?: text
  whatWentWell?: text
  struggles?: text
  weight?: number
  measurements?: json
  feedbackForCoach?: text
  submittedAt
  createdAt
  updatedAt
}
```

---

## API Endpoints Nodig

1. **GET /api/daily-tasks**
   - Query params: customerId, date (optioneel, default vandaag), weekStart (voor weekoverzicht)
   - Returns: array van daily tasks

2. **POST /api/daily-tasks**
   - Body: { customerId, date, taskType, taskName?, waterAmount?, completed }
   - Create/update daily task

3. **GET /api/weekly-checkins**
   - Query params: customerId, weekStart (optioneel)
   - Returns: check-in voor specifieke week of lijst

4. **POST /api/weekly-checkins**
   - Body: { customerId, weekStartDate, energyLevel, motivationLevel, ... }
   - Create/update check-in

5. **GET /api/plan-2026/stats** (voor dashboard overview)
   - Query params: customerId, weekStart
   - Returns: consistency stats, week overview, etc.

---

## UI/UX Principes

- **Positief en motiverend:** Focus op wat wel is gedaan, niet alleen wat niet
- **Simpel en snel:** Makkelijk om dagelijks te gebruiken
- **Visueel:** Kleuren, iconen, grafieken om progressie te laten zien
- **Mobile-first:** Werkt perfect op telefoon (waar klanten het meest gebruiken)
- **Real-time feedback:** Directe updates wanneer taken worden afgevinkt

---

## Implementatie Fasen

### Fase 1: Database & API (Nu)
- [ ] DailyTask model toevoegen aan schema
- [ ] WeeklyCheckIn model toevoegen
- [ ] Prisma migrate
- [ ] API endpoints bouwen

### Fase 2: Dashboard Overview Update
- [ ] Overview tab updaten met weekstats
- [ ] Vandaag quick actions
- [ ] Week kalender view

### Fase 3: Daily Tasks Tab
- [ ] Daily Tasks tab toevoegen
- [ ] Vandaag checklist
- [ ] Weekoverzicht
- [ ] Integratie met API

### Fase 4: Weekly Check-in Tab
- [ ] Check-in formulier
- [ ] Historie view
- [ ] Grafieken voor trends

### Fase 5: Progress Tab Update
- [ ] Consistency grafieken
- [ ] Streaks/achievements
- [ ] Trends over tijd

