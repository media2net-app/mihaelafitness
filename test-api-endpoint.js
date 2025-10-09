async function testAPI() {
  console.log('🔍 Testing API endpoint...\n');
  
  const customerId = 'cmg72xn1g003sfofh52suc9zq';
  const url = `http://localhost:6001/api/customer-nutrition-plans?customerId=${customerId}`;
  
  try {
    console.log(`📞 Fetching: ${url}`);
    const response = await fetch(url);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Success! Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testAPI();

