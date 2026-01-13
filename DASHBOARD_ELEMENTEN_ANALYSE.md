# Dashboard Elementen Analyse

## Huidige Structuur

### BOVEN TABS (Altijd zichtbaar):
1. **WelcomeBanner** - Welkomstbericht met motivatie
2. **MetricsRow** - 6 metrics cards (Gewicht, Stappen, Slaap, Water, Training, Consistentie)
3. **Client Info** - Profiel informatie (naam, email, training frequency, periode badge)

### OVERVIEW TAB - Main Content:
1. **Nutrition Progress Card** - Calorieën en macro's progress (circular charts)
2. **"Deze Week Overzicht"** sectie (maar staat in "Vandaag - Quick Actions" blok!):
   - 4 stat cards: Training, Voeding, Water, Consistentie
   - Weekkalender met dagelijkse completion status
3. **Weight Trend Graph** - Gewicht trend over tijd
4. **"Vandaag - Quick Actions"** sectie:
   - Daily Tasks (10.000 stappen, 10 pagina's lezen, 10 min mediteren)
   - Nutrition Plan Meals (maaltijden per type: ontbijt, lunch, etc.)
   - Nutrition & Water tracking (checkboxes en +/- buttons)
5. **Upcoming Sessions** - Aankomende trainingen lijst

### RIGHT COLUMN (Sidebar):
1. **Upcoming Sessions** - Duplicaat van main content!
2. **Quick Stats Card** - Snelle overzicht (trainingen, consistentie, voeding dagen)

## Problemen:
1. ❌ "Deze Week Overzicht" staat IN "Vandaag - Quick Actions" blok (verwarrend)
2. ❌ Data en gebruikersdata staan door elkaar
3. ❌ Upcoming Sessions staat 2x (main + sidebar)
4. ❌ Weight Trend Graph staat tussen week overzicht en vandaag acties
5. ❌ Logische flow ontbreekt: vandaag → week → trends → toekomst

## Logische Volgorde (User Journey):

### FASE 1: PERSOONLIJKE CONTEXT (Bovenaan)
- WelcomeBanner
- Client Info (wie ben ik, wat is mijn pakket)
- MetricsRow (snelle status check)

### FASE 2: VANDAAG - ACTIES (Wat moet ik nu doen?)
1. **Vandaag - Quick Actions** (prioriteit 1):
   - Daily Tasks (stappen, lezen, mediteren)
   - Nutrition Plan Meals (wat moet ik vandaag eten?)
   - Water tracking (hoeveel heb ik gedronken?)

### FASE 3: DEZE WEEK - OVERZICHT (Hoe gaat het deze week?)
1. **Nutrition Progress Card** (voedingsdoelen deze week)
2. **Deze Week Stats** (4 cards: Training, Voeding, Water, Consistentie)
3. **Weekkalender** (visuele weergave van completion per dag)

### FASE 4: TRENDS & VOORTGANG (Langere termijn)
1. **Weight Trend Graph** (gewicht ontwikkeling over tijd)

### FASE 5: TOEKOMST - PLANNING (Wat staat er gepland?)
1. **Upcoming Sessions** (aankomende trainingen)

### RIGHT COLUMN (Sidebar):
- **Quick Stats Card** (samenvatting)
- **Upcoming Sessions** (compact, max 3 items)

## Nieuwe Structuur:

```
┌─────────────────────────────────────────────────┐
│ WelcomeBanner                                    │
│ MetricsRow (6 cards)                              │
│ Client Info                                      │
├─────────────────────────────────────────────────┤
│ OVERVIEW TAB                                     │
│ ┌─────────────────────┬──────────────────────┐  │
│ │ MAIN CONTENT        │ SIDEBAR              │  │
│ │                     │                      │  │
│ │ 1. VANDAAG ACTIES   │ Quick Stats          │  │
│ │    - Daily Tasks    │ Upcoming (3)        │  │
│ │    - Meals          │                      │  │
│ │    - Water          │                      │  │
│ │                     │                      │  │
│ │ 2. DEZE WEEK        │                      │  │
│ │    - Nutrition Card│                      │  │
│ │    - 4 Stat Cards  │                      │  │
│ │    - Weekkalender   │                      │  │
│ │                     │                      │  │
│ │ 3. TRENDS           │                      │  │
│ │    - Weight Graph   │                      │  │
│ │                     │                      │  │
│ │ 4. TOEKOMST         │                      │  │
│ │    - Upcoming       │                      │  │
│ └─────────────────────┴──────────────────────┘  │
└─────────────────────────────────────────────────┘
```

