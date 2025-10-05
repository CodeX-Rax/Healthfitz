// Quick webhook test
const testWebhook = async () => {
  try {
    console.log('🧪 Testing webhook connectivity...');
    
    // Test 1: Test endpoint
    const testResponse = await fetch('https://adorable-chicken-667.convex.cloud/vapi/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    
    console.log('✅ Test endpoint status:', testResponse.status);
    const testResult = await testResponse.text();
    console.log('📄 Test response:', testResult);
    
    // Test 2: Main webhook endpoint
    console.log('\n🧪 Testing plan generation webhook...');
    const planResponse = await fetch('https://adorable-chicken-667.convex.cloud/vapi/generate-program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'test_user_123',
        age: '25',
        height: '5\'8"',
        weight: '150 lbs',
        injuries: 'None',
        workout_days: '4',
        fitness_goal: 'Build muscle',
        fitness_level: 'Intermediate',
        dietary_restrictions: 'None'
      })
    });
    
    console.log('✅ Plan webhook status:', planResponse.status);
    const planResult = await planResponse.text();
    console.log('📄 Plan response:', planResult);
    
    if (testResponse.ok && planResponse.ok) {
      console.log('\n🎉 ALL TESTS PASSED! Your webhook is working correctly!');
    } else {
      console.log('\n❌ Some tests failed. Check the responses above.');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
};

testWebhook();
