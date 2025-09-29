# 💡 Database Usage Examples - Mihaela Fitness

## 🚀 Quick Start Examples

### 1. Nieuwe Klant Toevoegen
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jan Janssen",
    "email": "jan@example.com",
    "phone": "+31612345678",
    "goal": "Afvallen",
    "plan": "Premium",
    "trainingFrequency": 3
  }'
```

### 2. Nieuwe Workout Toevoegen
```bash
curl -X POST http://localhost:3001/api/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Full Body Strength",
    "category": "Kracht",
    "difficulty": "Intermediate",
    "duration": 60,
    "exercises": 8,
    "description": "Complete full body workout"
  }'
```

### 3. Workout Toewijzen aan Klant
```bash
curl -X POST http://localhost:3001/api/customer-workouts \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cmg40s3t400016reaj691t59r",
    "workoutId": "workout_id_here",
    "notes": "Start met lichte gewichten"
  }'
```

### 4. Trainingssessie Inplannen
```bash
curl -X POST http://localhost:3001/api/training-sessions \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cmg40s3t400016reaj691t59r",
    "date": "2024-01-15",
    "startTime": "10:00",
    "endTime": "11:00",
    "type": "1:1",
    "notes": "Eerste sessie"
  }'
```

### 5. Foto Uploaden (Vercel Blob)
```bash
curl -X POST http://localhost:3001/api/customer-photos \
  -F "file=@/path/to/photo.jpg" \
  -F "customerId=cmg40s3t400016reaj691t59r" \
  -F "week=1" \
  -F "position=front" \
  -F "date=2024-01-15"
```

## 📊 Database Queries

### Alle Klanten Ophalen
```bash
curl http://localhost:3001/api/users
```

### Specifieke Klant
```bash
curl http://localhost:3001/api/users/cmg40s3t400016reaj691t59r
```

### Klant Workouts
```bash
curl "http://localhost:3001/api/customer-workouts?customerId=cmg40s3t400016reaj691t59r"
```

### Trainingssessies voor Datum
```bash
curl "http://localhost:3001/api/training-sessions?date=2024-01-15"
```

### Database Statistieken
```bash
curl http://localhost:3001/api/stats
```

## 🔄 Update Operations

### Klant Gegevens Bijwerken
```bash
curl -X PUT http://localhost:3001/api/users/cmg40s3t400016reaj691t59r \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jan Janssen Updated",
    "goal": "Spiermassa opbouwen",
    "trainingFrequency": 4
  }'
```

### Trainingssessie Bijwerken
```bash
curl -X PUT http://localhost:3001/api/training-sessions \
  -H "Content-Type: application/json" \
  -d '{
    "id": "session_id_here",
    "status": "completed",
    "notes": "Sessie succesvol afgerond"
  }'
```

## 🗑️ Delete Operations

### Workout Verwijderen
```bash
curl -X DELETE "http://localhost:3001/api/workouts?id=workout_id_here"
```

### Trainingssessie Verwijderen
```bash
curl -X DELETE "http://localhost:3001/api/training-sessions?id=session_id_here"
```

### Klant Foto Verwijderen
```bash
curl -X DELETE "http://localhost:3001/api/customer-photos?id=photo_id_here"
```

## 🧮 Voeding & Macro's

### Voedingsplan Toevoegen
```bash
curl -X POST http://localhost:3001/api/nutrition-plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cutting Plan",
    "goal": "Afvallen",
    "calories": 1800,
    "protein": 150,
    "carbs": 180,
    "fat": 60,
    "meals": 4,
    "description": "Plan voor gewichtsverlies"
  }'
```

### Macro's Berekenen
```bash
curl -X POST http://localhost:3001/api/calculate-macros \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 70,
    "height": 175,
    "age": 30,
    "gender": "male",
    "activityLevel": "moderate",
    "goal": "maintenance"
  }'
```

## 📈 Voortgang Tracking

### Metingen Toevoegen
```bash
curl -X POST http://localhost:3001/api/customer-measurements \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cmg40s3t400016reaj691t59r",
    "week": 1,
    "date": "2024-01-15",
    "weight": 75.5,
    "bodyFat": 18.5,
    "muscleMass": 35.2,
    "waist": 85,
    "chest": 95
  }'
```

### Voortgang Bijwerken
```bash
curl -X POST http://localhost:3001/api/customer-progression \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cmg40s3t400016reaj691t59r",
    "week": 1,
    "date": "2024-01-15",
    "endurance": 7.5,
    "strength": 6.8,
    "flexibility": 8.0,
    "balance": 7.2,
    "progressRating": 8,
    "trainerNotes": "Goede vooruitgang"
  }'
```

## 💰 Prijsberekeningen

### Prijsberekening Opslaan
```bash
curl -X POST http://localhost:3001/api/pricing-calculations \
  -H "Content-Type: application/json" \
  -d '{
    "service": "Personal Training",
    "duration": 60,
    "frequency": 12,
    "discount": 10,
    "finalPrice": 540,
    "includeNutritionPlan": true,
    "customerId": "cmg40s3t400016reaj691t59r",
    "customerName": "Jan Janssen"
  }'
```

## 🔍 Complex Queries

### Klant met Alle Relaties
```javascript
// Via Prisma Studio of directe database query
const customer = await prisma.user.findUnique({
  where: { id: "cmg40s3t400016reaj691t59r" },
  include: {
    customerWorkouts: {
      include: { workout: true }
    },
    customerNutritionPlans: {
      include: { nutritionPlan: true }
    },
    trainingSessions: true,
    measurements: true,
    progressions: true,
    customerPhotos: true
  }
});
```

### Dashboard Data
```javascript
const dashboardData = await Promise.all([
  prisma.user.count(),
  prisma.workout.count(),
  prisma.trainingSession.count({
    where: { date: { gte: new Date() } }
  }),
  prisma.customerPhoto.count()
]);
```

## 🎯 Best Practices

### 1. Error Handling
```javascript
try {
  const result = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!result.ok) {
    throw new Error(`HTTP error! status: ${result.status}`);
  }
  
  const data = await result.json();
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error);
}
```

### 2. Loading States
```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/users');
    const result = await response.json();
    setData(result);
  } finally {
    setLoading(false);
  }
};
```

### 3. Optimistic Updates
```javascript
const updateUser = async (userId, updates) => {
  // Optimistic update
  setUsers(prev => prev.map(user => 
    user.id === userId ? { ...user, ...updates } : user
  ));
  
  try {
    await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (error) {
    // Revert on error
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...originalData } : user
    ));
  }
};
```

## 🔧 Development Tools

### Prisma Studio
```bash
npx prisma studio
# Open: http://localhost:5555
```

### Database Reset
```bash
# Reset database (voor development)
npx prisma migrate reset

# Seed met test data
npm run db:seed
```

### Schema Changes
```bash
# Na schema wijzigingen
npx prisma db push
npx prisma generate
```

---

**🎯 Met deze voorbeelden heb je volledige controle over alle database operaties!**
