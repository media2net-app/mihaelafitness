// Test the actual API response
async function testApiResponse() {
  try {
    const planId = 'cmgh1c6jq006j89gxlq1h2eo8';
    const url = `http://localhost:6001/api/nutrition-plans/${planId}`;
    
    console.log('🔍 Testing API response from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('❌ API returned error:', response.status);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n📦 API Response structure:');
    console.log('  - id:', data.id);
    console.log('  - name:', data.name);
    console.log('  - Has weekMenu:', !!data.weekMenu);
    console.log('  - Has _ingredientTranslations:', !!data._ingredientTranslations);
    
    if (data._ingredientTranslations) {
      const count = Object.keys(data._ingredientTranslations).length;
      console.log('\n✅ Translations found:', count);
      console.log('\nFirst 10 translations:');
      Object.entries(data._ingredientTranslations).slice(0, 10).forEach(([en, ro]) => {
        console.log(`  "${en}" -> "${ro}"`);
      });
    } else {
      console.log('\n❌ NO _ingredientTranslations field in response!');
      console.log('\nAvailable fields in response:', Object.keys(data));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testApiResponse();

