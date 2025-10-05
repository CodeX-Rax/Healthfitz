// VAPI Assistant Setup Script
// This script helps you configure your VAPI assistant programmatically

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const ASSISTANT_ID = "bf38cd93-8c9d-44be-9f2f-c0f6f18bea82";

const assistantConfig = {
  name: "CodeFlex Fitness AI",
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 1000
  },
  voice: {
    provider: "elevenlabs",
    voiceId: "sarah" // or your preferred voice
  },
  firstMessage: "Hello! I'm CodeFlex AI, your personal fitness and nutrition coach. I'm here to help you create a personalized workout and diet plan. Let's start by learning about your fitness goals and current situation. What's your name?",
  systemMessage: `You are CodeFlex AI, a professional fitness and nutrition coach. Your goal is to collect comprehensive fitness information from users and create personalized workout and diet plans.

CONVERSATION FLOW:
1. Greet the user warmly and introduce yourself as their personal AI fitness coach
2. Collect the following information in a natural, conversational way:
   - Age
   - Height (in feet and inches or cm)
   - Weight (in lbs or kg)
   - Current fitness level (Beginner/Intermediate/Advanced)
   - Fitness goals (Build muscle/Lose weight/Get stronger/General fitness)
   - Available workout days per week
   - Any injuries or physical limitations
   - Dietary restrictions or preferences
   - Experience with exercise equipment

3. Once you have all the information, call the generate_fitness_plan function
4. After calling the function, thank the user and let them know their personalized plan is being created

TONE: Professional, encouraging, and supportive. Make the user feel comfortable sharing personal information.

IMPORTANT: Always call the generate_fitness_plan function at the end of the conversation with all collected data.`,
  maxDurationSeconds: 300,
  functions: [
    {
      name: "generate_fitness_plan",
      description: "Generate personalized fitness and diet plan based on user information",
      parameters: {
        type: "object",
        properties: {
          user_id: {
            type: "string",
            description: "The user's unique identifier"
          },
          age: {
            type: "string",
            description: "User's age in years"
          },
          height: {
            type: "string",
            description: "User's height (e.g., '5'8\"', '175cm')"
          },
          weight: {
            type: "string",
            description: "User's weight (e.g., '150 lbs', '68kg')"
          },
          injuries: {
            type: "string",
            description: "Any injuries or physical limitations"
          },
          workout_days: {
            type: "string",
            description: "Number of days per week available for workouts"
          },
          fitness_goal: {
            type: "string",
            description: "Primary fitness objective"
          },
          fitness_level: {
            type: "string",
            description: "Current fitness experience level"
          },
          dietary_restrictions: {
            type: "string",
            description: "Any dietary limitations or preferences"
          }
        },
        required: ["user_id", "age", "height", "weight", "fitness_goal", "fitness_level"]
      },
      url: "https://adorable-chicken-667.convex.cloud/vapi/generate-program",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Vapi-AI-Webhook/1.0"
      }
    }
  ],
  serverMessages: [
    "conversation-update",
    "end-of-call-report",
    "function-call",
    "speech-start",
    "speech-end",
    "message",
    "error"
  ]
};

async function updateVAPIAssistant() {
  if (!VAPI_API_KEY) {
    console.error("❌ VAPI_API_KEY not found in environment variables");
    return;
  }

  try {
    console.log("🚀 Updating VAPI Assistant Configuration...");
    console.log("Assistant ID:", ASSISTANT_ID);
    
    const response = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantConfig)
    });

    if (response.ok) {
      console.log("✅ VAPI Assistant updated successfully!");
      console.log("📋 Configuration applied:");
      console.log("- Name:", assistantConfig.name);
      console.log("- Model:", assistantConfig.model.model);
      console.log("- Voice:", assistantConfig.voice.voiceId);
      console.log("- Functions:", assistantConfig.functions.length);
      console.log("- Max Duration:", assistantConfig.maxDurationSeconds, "seconds");
    } else {
      const error = await response.text();
      console.error("❌ Failed to update VAPI Assistant:", error);
    }
  } catch (error) {
    console.error("💥 Error updating VAPI Assistant:", error.message);
  }
}

// Test webhook connectivity
async function testWebhook() {
  console.log("🧪 Testing webhook connectivity...");
  
  try {
    const response = await fetch("https://adorable-chicken-667.convex.cloud/vapi/test", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true, timestamp: new Date().toISOString() })
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Webhook test successful:", result.message);
    } else {
      console.error("❌ Webhook test failed:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("💥 Webhook test error:", error.message);
  }
}

// Test plan generation
async function testPlanGeneration() {
  console.log("🧪 Testing plan generation...");
  
  const testPayload = {
    user_id: "test_user_" + Date.now(),
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
    const response = await fetch("https://adorable-chicken-667.convex.cloud/vapi/generate-program", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Plan generation test successful!");
      console.log("📋 Plan ID:", result.data?.planId);
      console.log("💪 Workout plan generated:", !!result.data?.workoutPlan);
      console.log("🥗 Diet plan generated:", !!result.data?.dietPlan);
    } else {
      const error = await response.text();
      console.error("❌ Plan generation test failed:", error);
    }
  } catch (error) {
    console.error("💥 Plan generation test error:", error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log("🔧 CodeFlex AI - Complete Setup and Testing");
  console.log("=" .repeat(50));
  
  await testWebhook();
  console.log("");
  
  await testPlanGeneration();
  console.log("");
  
  await updateVAPIAssistant();
  console.log("");
  
  console.log("🎯 Setup Complete! Your VAPI assistant is ready to generate fitness plans.");
  console.log("📱 Test it by visiting your app and clicking 'Start Call'");
}

// Run if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  updateVAPIAssistant,
  testWebhook,
  testPlanGeneration,
  runAllTests
};
