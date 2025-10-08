# USDA FoodData Central API Setup

## Overzicht
Deze pagina integreert de gratis USDA FoodData Central API om automatisch voedingswaarden te importeren voor voedingsplannen.

## API Setup

### 1. USDA API Key Aanvragen
1. Ga naar: https://fdc.nal.usda.gov/api-guide.html
2. Klik op "Request API Key"
3. Vul het formulier in met je gegevens
4. Je ontvangt een gratis API key (1000 requests per dag)

### 2. API Key Configureren
1. Open de Voedingsplannen API pagina: `/admin/voedingsplannen-api`
2. Voer je API key in het veld "USDA API Key"
3. Klik op "Test API" om te controleren of de verbinding werkt

## Functionaliteiten

### 🔍 Zoeken in USDA Database
- Zoek naar specifieke ingredienten
- Filter op categorie (proteïnen, koolhydraten, etc.)
- Bekijk voedingswaarden per 100g
- Automatische categorisering

### 📊 Geïmporteerde Data
- **Calorieën**: Totaal aantal calorieën
- **Eiwit**: Gram eiwit per 100g
- **Koolhydraten**: Gram koolhydraten per 100g
- **Vet**: Gram vet per 100g
- **Vezels**: Gram vezels per 100g
- **Suiker**: Gram suiker per 100g
- **Categorie**: Automatisch toegewezen categorie
- **Bron**: USDA FoodData Central

### 💾 Database Import
- Importeer geselecteerde ingredienten naar de database
- Automatische duplicaat detectie
- Update bestaande ingredienten met nieuwe data
- Behoud van originele database ingredienten

## Gebruik

### Stap 1: API Key Invoeren
```
1. Ga naar Admin → Voedingsplannen API
2. Voer je USDA API key in
3. Test de verbinding
```

### Stap 2: Ingredienten Zoeken
```
1. Typ een zoekterm (bijv. "chicken breast")
2. Selecteer een categorie (optioneel)
3. Klik op "Zoek in USDA"
4. Bekijk de resultaten in de tabel
```

### Stap 3: Importeren
```
1. Selecteer de ingredienten die je wilt importeren
2. Klik op "Importeer naar Database"
3. Wacht tot de import voltooid is
4. Controleer de resultaten
```

## API Limieten

### USDA FoodData Central
- **Gratis**: 1000 requests per dag
- **Rate limit**: 1 request per seconde
- **Data**: 300.000+ voedingsmiddelen
- **Updates**: Maandelijks

### Tips voor Efficiënt Gebruik
- Zoek specifiek (bijv. "chicken breast" in plaats van "chicken")
- Gebruik categorie filters om resultaten te beperken
- Importeer alleen relevante ingredienten
- Test eerst met een kleine zoekopdracht

## Technische Details

### API Endpoints
- **Zoeken**: `/api/usda-search?query=...&apiKey=...`
- **Importeren**: `/api/import-ingredients`

### Database Schema
```sql
-- Bestaande ingredients tabel wordt gebruikt
-- Nieuwe velden toegevoegd:
- aliases: Array met API referenties
- source: Bron van de data (USDA, etc.)
```

### Error Handling
- API key validatie
- Rate limit respecteren
- Duplicaat detectie
- Fallback voor ontbrekende data

## Alternatieve APIs

### Edamam Nutrition API
- **Gratis**: 10 requests per dag
- **Betaald**: Vanaf $10/maand
- **Data**: 1.000.000+ voedingsmiddelen

### Spoonacular API
- **Gratis**: 150 requests per dag
- **Betaald**: Vanaf $9/maand
- **Data**: 500.000+ voedingsmiddelen

## Troubleshooting

### Veelvoorkomende Problemen

#### "API key is vereist"
- Controleer of je API key correct is ingevoerd
- Zorg dat er geen spaties zijn aan het begin/einde

#### "No results found"
- Probeer een andere zoekterm
- Controleer de spelling
- Gebruik Engelse termen

#### "Rate limit exceeded"
- Wacht 1 seconde tussen requests
- Gebruik minder zoekopdrachten per dag

#### "Import failed"
- Controleer database connectie
- Controleer of ingredient al bestaat
- Bekijk console logs voor details

## Support

Voor vragen over de API integratie:
1. Controleer deze documentatie
2. Bekijk de console logs
3. Test met een eenvoudige zoekopdracht
4. Neem contact op met de ontwikkelaar

---

*Laatste update: ${new Date().toLocaleDateString('nl-NL')}*




