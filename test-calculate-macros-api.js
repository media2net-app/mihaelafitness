async function testCalculateMacros() {
  try {
    console.log('🧪 Testing calculate-macros API with real meal data\n');
    
    // Real breakfast ingredients from the logs
    const ingredients = [
      '2 cmgbfewgp01b78igv3zsoydrf|1 Egg',
      '38 cmgbf5hwz016c8igv0rqomyyz|Avocado',
      '1 cmgbfeyyn01bl8igvuzmjc8ut|1 Slice Whole Wheat Bread',
      '50 cmgbf5ktt017a8igvd05un12c|Cottage Cheese',
      '100 cmgbf5i8q016g8igv11v4u9e7|Tomato',
      '100 cmgbf5i3r016e8igvfc3sfn5n|Spinach'
    ];
    
    console.log('📤 Sending to API:', ingredients);
    
    const response = await fetch('http://localhost:6001/api/calculate-macros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients })
    });
    
    if (!response.ok) {
      console.error('❌ API error:', response.status);
      const text = await response.text();
      console.error('Response:', text);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n📥 API Response:');
    console.log('  Total results:', data.results.length);
    
    data.results.forEach((result, idx) => {
      console.log(`\n  [${idx + 1}] ${result.ingredient}`);
      console.log(`      nameEn: "${result.nameEn || 'MISSING'}"`);
      console.log(`      nameRo: "${result.nameRo || 'MISSING'}"`);
      console.log(`      amount: ${result.amount}, unit: ${result.unit}, pieces: ${result.pieces || 0}`);
      console.log(`      macros:`, {
        calories: result.macros?.calories || 0,
        protein: result.macros?.protein || 0,
        carbs: result.macros?.carbs || 0,
        fat: result.macros?.fat || 0
      });
      if (result.error) {
        console.log(`      ⚠️ ERROR: ${result.error}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCalculateMacros();

