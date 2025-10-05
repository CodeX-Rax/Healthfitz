// Test script to verify VAPI webhook is working
// Run this with: node test-webhook.js

const testWebhook = async () => {
  const webhookUrl = 'https://adorable-chicken-667.convex.cloud/vapi/generate-program';
  
  const testPayload = {
    user_id: "test_user_123",
    age: "25",
    height: "5'8\"",
    weight: "150 lbs",
    injuries: "None",
    workout_days: "4",
    fitness_goal: "Build muscle",
    fitness_level: "Intermediate",
    dietary_restrictions: "None"
  };

  try {
    console.log('🧪 Testing VAPI webhook...');
    console.log('📡 URL:', webhookUrl);
    console.log('📦 Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    
    console.log('✅ Response Status:', response.status);
    console.log('📄 Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('🎉 Webhook is working correctly!');
      console.log('📋 Response:', result);
      if (result.success) {
        console.log('📋 Plan ID:', result.data?.planId);
      }
    } else {
      console.log('❌ Webhook failed:', result.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
};

testWebhook();
