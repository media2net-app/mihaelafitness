# Dashboard Redesign Plan - NutriSense Style met Mihaela Fitness Huisstijl

## 🎨 Huidige Huisstijl Analyse

**Primaire Kleuren:**
- Rose/Pink: `#f43f5e` (rose-500), `#e11d48` (rose-600), `#ec4899` (primary-500)
- Gradient: `from-rose-500 to-pink-600`
- Achtergrond: Wit (`#ffffff`) en lichte rose tinten (`#fdf2f8`)
- Tekst: Donkergrijs tot zwart voor leesbaarheid

**Huidige Styling:**
- Clean, modern design
- Gradient backgrounds voor hero sections
- Witte cards met subtiele schaduwen
- Rose accenten voor interactieve elementen

## 🎯 Redesign Doelstellingen

1. **Modern Dashboard Layout** - Geïnspireerd op NutriSense
2. **Behoud Huisstijl** - Rose/pink kleuren blijven primair
3. **Verbeterde UX** - Duidelijkere data visualisatie en metrics
4. **Responsive Design** - Werkt perfect op alle devices
5. **Motiverende Sfeer** - Positieve, energieke uitstraling

## 📋 Implementatie Plan

### Fase 1: Layout & Structuur (Week 1)

#### 1.1 Dashboard Header Redesign
- **Huidige staat:** Basic header met tabs
- **Nieuwe staat:** 
  - Top navigation bar met: Home, Voedingsplan, Schema, Voortgang, Chat (optioneel)
  - Search bar rechtsboven
  - Profile dropdown rechts
  - Welcome message met persoonlijke groet: "Welkom terug, [Naam] 👋"

**Kleuren:**
- Background: Wit of licht rose-50
- Navigation items: Grijs met rose hover state
- Active state: Rose-500
- Search bar: Lichtgrijs met rose border bij focus

#### 1.2 Metrics Cards Sectie
- **Nieuwe component:** Row van 4-6 metric cards
- **Cards:**
  1. **Gewicht** - Met trend indicator (↑/↓)
  2. **Stappen** - Met bar chart visualisatie
  3. **Slaap** - Met vertical bars
  4. **Water Inname** - Met wavy line graph
  5. **Trainingen** - Met progress indicator
  6. **Consistentie Score** - Met circular progress

**Styling:**
- Cards: Wit met subtiele shadow
- Accent card (belangrijkste metric): Rose gradient background
- Icons: Rose-500 kleur
- Data: Grote, vette cijfers
- Labels: Kleinere, grijze tekst

#### 1.3 Grid Layout Systeem
- **2-column layout** op desktop
- **1-column** op mobile
- **Flexibele grid** voor verschillende content types

### Fase 2: Data Visualisatie (Week 1-2)

#### 2.1 Progress Charts
- **Circular Progress Charts** voor:
  - Calorieën (dagelijkse doelen)
  - Macro's (Carbs, Protein, Fats)
  - Training progress
- **Bar Charts** voor:
  - Stappen over tijd
  - Slaap kwaliteit
  - Water inname
- **Line Graphs** voor:
  - Gewicht trends
  - Voortgang over tijd

**Kleuren:**
- Primary: Rose-500
- Secondary: Pink-400
- Background: Rose-50
- Grid lines: Grijs-200

#### 2.2 Calendar Integration
- **Nutrition Calendar** - Geïntegreerd in dashboard
- **Training Calendar** - Overzicht van sessies
- **Highlighting** - Huidige dag duidelijk gemarkeerd
- **Clickable** - Navigeer naar details

### Fase 3: Content Secties (Week 2)

#### 3.1 "Vandaag - Quick Actions" Redesign
- **Huidige staat:** Basic cards met checkboxes
- **Nieuwe staat:**
  - Modern card design met rounded corners
  - Duidelijke iconen
  - Progress indicators
  - Hover states met rose accent

#### 3.2 Voedingsplan Sectie
- **Header:** Duidelijke titel met datum
- **Meal Cards:** 
  - Elke maaltijd in eigen card
  - Items binnen maaltijd duidelijk gescheiden
  - Checkboxes met rose accent
  - Progress indicator per maaltijd
- **Visual Feedback:** 
  - Groen voor voltooid
  - Rose voor in progress
  - Grijs voor niet gestart

#### 3.3 Training Sectie
- **Upcoming Sessions:** 
  - Card design met tijd en type
  - Status indicators (Gepland, Voltooid, Gemist)
  - Quick actions (Cancel, Reschedule)
- **Progress Tracking:**
  - Period overview met visualisatie
  - Session completion rate
  - Consistency metrics

#### 3.4 Weekly Overview
- **Week Calendar:**
  - 7-day view
  - Daily completion status
  - Color coding:
    - Groen: Alles voltooid
    - Rose: Gedeeltelijk
    - Grijs: Niet gestart
- **Statistics:**
  - Nutrition days
  - Water days
  - Training sessions
  - Consistency score

### Fase 4: Interactieve Elementen (Week 2-3)

#### 4.1 Buttons & CTAs
- **Primary Buttons:**
  - Rose gradient background
  - Witte tekst
  - Rounded corners (8-12px)
  - Hover: Donkerder rose
- **Secondary Buttons:**
  - Witte achtergrond
  - Rose border en tekst
  - Hover: Rose-50 background

#### 4.2 Input Fields
- **Search Bar:**
  - Lichtgrijs background
  - Rose border bij focus
  - Placeholder: "Zoek hier..."
- **Form Inputs:**
  - Clean design
  - Rose focus state
  - Subtiele shadows

#### 4.3 Cards & Containers
- **Background:** Wit
- **Border:** Subtiel grijs of rose-100
- **Shadow:** Subtiel (0 1px 3px rgba(0,0,0,0.1))
- **Hover:** Lichte rose tint
- **Rounded Corners:** 12-16px

### Fase 5: Animations & Micro-interactions (Week 3)

#### 5.1 Transitions
- **Smooth transitions** voor alle interacties
- **Duration:** 200-300ms
- **Easing:** ease-in-out

#### 5.2 Loading States
- **Skeleton screens** tijdens data loading
- **Rose accent** voor loading indicators
- **Smooth fade-in** voor content

#### 5.3 Hover Effects
- **Cards:** Lichte lift effect (transform: translateY(-2px))
- **Buttons:** Scale effect (1.02)
- **Icons:** Rose color transition

### Fase 6: Responsive Design (Week 3)

#### 6.1 Mobile Optimization
- **Stack layout** op mobile
- **Touch-friendly** buttons (min 44px)
- **Swipe gestures** voor calendar
- **Collapsible sections**

#### 6.2 Tablet Optimization
- **2-column layout** waar mogelijk
- **Optimized spacing**
- **Touch targets** aangepast

### Fase 7: Final Touches (Week 4)

#### 7.1 Typography
- **Headers:** Bold, large (24-32px)
- **Body:** Regular, medium (14-16px)
- **Labels:** Small, light (12-14px)
- **Font:** Inter (huidige font behouden)

#### 7.2 Spacing
- **Consistent padding:** 16px, 24px, 32px
- **Card spacing:** 16-24px
- **Section spacing:** 32-48px

#### 7.3 Color Refinement
- **Rose tints** voor verschillende states
- **Grijs schaal** voor tekst hiërarchie
- **Accent colors** voor success/error states

## 🎨 Kleuren Mapping

### NutriSense → Mihaela Fitness

| NutriSense | Mihaela Fitness | Gebruik |
|------------|-----------------|---------|
| Oranje (#FF6B35) | Rose-500 (#f43f5e) | Primary actions, important metrics |
| Licht beige | Rose-50 (#fff1f2) | Backgrounds, subtle accents |
| Wit | Wit (#ffffff) | Cards, content areas |
| Donkergrijs | Grijs-800 (#1f2937) | Primary text |
| Lichtgrijs | Grijs-400 (#9ca3af) | Secondary text |
| Groen | Groen-500 (#10b981) | Success states (behouden) |

## 📐 Component Structuur

```
Dashboard
├── Header
│   ├── Navigation
│   ├── Search
│   └── Profile
├── Welcome Section
│   └── Personalized Greeting
├── Metrics Row
│   ├── Weight Card
│   ├── Steps Card
│   ├── Sleep Card
│   ├── Water Card
│   ├── Training Card
│   └── Consistency Card
├── Main Content (Grid)
│   ├── Left Column
│   │   ├── Quick Actions
│   │   ├── Nutrition Plan
│   │   └── Water Tracking
│   └── Right Column
│       ├── Training Schedule
│       ├── Progress Charts
│       └── Weekly Overview
└── Footer (optioneel)
```

## 🚀 Implementatie Volgorde

1. **Week 1:**
   - Layout restructure
   - Header redesign
   - Metrics cards component
   - Basic grid system

2. **Week 2:**
   - Data visualisatie components
   - Content secties redesign
   - Calendar integration
   - Button & input styling

3. **Week 3:**
   - Animations & transitions
   - Responsive design
   - Mobile optimization
   - Testing & refinements

4. **Week 4:**
   - Final touches
   - Performance optimization
   - Accessibility checks
   - User testing

## 📝 Technische Details

### Nieuwe Componenten
- `MetricCard.tsx` - Herbruikbare metric card
- `ProgressChart.tsx` - Circular progress component
- `BarChart.tsx` - Bar chart component
- `WeekCalendar.tsx` - Weekly calendar view
- `WelcomeBanner.tsx` - Personalized welcome section

### Styling Updates
- Update `tailwind.config.js` met nieuwe kleuren
- Nieuwe utility classes voor gradients
- Card component styles
- Animation utilities

### Data Structure
- Metrics data format
- Chart data format
- Calendar data structure

## ✅ Success Criteria

- [ ] Modern, clean dashboard layout
- [ ] Rose/pink huisstijl consistent toegepast
- [ ] Alle data duidelijk gevisualiseerd
- [ ] Responsive op alle devices
- [ ] Smooth animations en transitions
- [ ] Verbeterde UX en gebruiksvriendelijkheid
- [ ] Performance geoptimaliseerd
- [ ] Accessibility compliant

## 🔄 Iteratie Plan

1. **V1.0:** Basic layout en metrics cards
2. **V1.1:** Data visualisatie toegevoegd
3. **V1.2:** Content secties volledig redesigned
4. **V1.3:** Animations en micro-interactions
5. **V2.0:** Final polish en optimizations

---

**Start Datum:** [Te bepalen]
**Verwachte Duur:** 4 weken
**Prioriteit:** Hoog

