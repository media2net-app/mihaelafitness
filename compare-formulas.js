// Compare old vs new formula for Chiel's data
const weight = 88;
const age = 32;
const gender = 'male';
const bodyType = 'ectomorf';
const objective = 'crestere';
const objectivePercentage = 10;
const dailyActivity = 10;
const trainingHours = 1;
const trainingIntensity = 6;

console.log('=== VERGELIJKING OUDE VS NIEUWE FORMULE ===\n');
console.log('Input: 88kg, 32j, male, ectomorf, +10% creștere, +10% activitate, 1u/week, intensiteit 6\n');

const mb = weight * 24; // 2112

// OUDE FORMULE (cumulatief) - zoals opgeslagen in DB
console.log('--- OUDE FORMULE (CUMULATIEF) ---');
let old = mb; // 2112
old = old; // Gender (male = geen aanpassing)
old = old; // Age (< 40 = geen aanpassing)
old = old * 1.05; // Body Type +5% → 2218
old = old * 1.10; // Objective +10% → 2439
old = old * 1.10; // Daily Activity +10% → 2683
old = old + (weight * trainingHours * trainingIntensity) / 7; // Training → 2759
console.log('Resultaat:', Math.round(old), 'kcal (zoals opgeslagen in DB)\n');

// NIEUWE FORMULE (alle percentages op MB) - volgens notitie
console.log('--- NIEUWE FORMULE (ALLE % OP MB) ---');
let newCalc = mb; // 2112
newCalc += 0; // Gender (male = geen aanpassing)
newCalc += 0; // Age (< 40 = geen aanpassing)
newCalc += mb * 0.05; // Body Type +5% van MB → +106 → 2218
newCalc += mb * 0.10; // Objective +10% van MB → +211 → 2429
newCalc += mb * 0.10; // Daily Activity +10% van MB → +211 → 2640
newCalc += (weight * trainingHours * trainingIntensity) / 7; // Training → +75 → 2715
console.log('Resultaat:', Math.round(newCalc), 'kcal (volgens exacte notitie)\n');

console.log('Verschil:', Math.round(newCalc - old), 'kcal');
