# 🎯 Complete VAPI Assistant Workflow Configuration

## 📋 **VAPI Assistant Settings**

### **Basic Configuration:**
```
Assistant Name: CodeFlex Fitness AI
Model: gpt-4o-mini
Voice: sarah (or your preferred voice)
Max Duration: 300 seconds (5 minutes)
```

### **System Prompt:**
```
You are CodeFlex AI, a professional fitness and nutrition coach. Your goal is to collect comprehensive fitness information from users and create personalized workout and diet plans.

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

IMPORTANT: Always call the generate_fitness_plan function at the end of the conversation with all collected data.
```

### **Function Configuration:**
```
Function Name: generate_fitness_plan
Description: Generate personalized fitness and diet plan based on user information
URL: https://adorable-chicken-667.convex.cloud/vapi/generate-program
Method: POST
Headers: 
  - Content-Type: application/json
  - User-Agent: Vapi-AI-Webhook/1.0
Timeout: 30 seconds
Authentication: None
```

### **Function Parameters:**
```json
{
  "user_id": "{{user_id}}",
  "age": "{{age}}",
  "height": "{{height}}",
  "weight": "{{weight}}",
  "injuries": "{{injuries}}",
  "workout_days": "{{workout_days}}",
  "fitness_goal": "{{fitness_goal}}",
  "fitness_level": "{{fitness_level}}",
  "dietary_restrictions": "{{dietary_restrictions}}"
}
```

### **Variable Definitions:**
```
user_id: The user's unique identifier from the system
age: User's age in years
height: User's height (e.g., "5'8\"", "175cm")
weight: User's weight (e.g., "150 lbs", "68kg")
injuries: Any injuries or physical limitations (e.g., "None", "Lower back pain")
workout_days: Number of days per week available for workouts
fitness_goal: Primary fitness objective
fitness_level: Current fitness experience level
dietary_restrictions: Any dietary limitations or preferences
```

## 🔧 **Step-by-Step VAPI Dashboard Configuration**

### **1. Go to Your VAPI Assistant:**
Visit: https://dashboard.vapi.ai/assistants/bf38cd93-8c9d-44be-9f2f-c0f6f18bea82

### **2. Basic Settings:**
- **Name**: CodeFlex Fitness AI
- **Model**: gpt-4o-mini
- **Voice**: sarah (or your preference)
- **Max Duration**: 300 seconds

### **3. System Message:**
Copy and paste the system prompt from above

### **4. Add Function:**
1. Go to "Functions" section
2. Click "Add Function"
3. Configure with the function details above

### **5. Server Messages:**
Enable these server messages:
- conversation-update
- end-of-call-report
- function-call
- speech-start
- speech-end
- message
- error

### **6. HTTP Headers:**
Add these headers:
- Content-Type: application/json
- User-Agent: Vapi-AI-Webhook/1.0

## 🧪 **Testing the Configuration**

### **Test 1: Webhook Connectivity**
```bash
# Test if your webhook is accessible
curl -X POST https://adorable-chicken-667.convex.cloud/vapi/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### **Test 2: Full Webhook Test**
```bash
# Test the actual plan generation webhook
curl -X POST https://adorable-chicken-667.convex.cloud/vapi/generate-program \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "age": "25",
    "height": "5'\''8\"",
    "weight": "150 lbs",
    "injuries": "None",
    "workout_days": "4",
    "fitness_goal": "Build muscle",
    "fitness_level": "Intermediate",
    "dietary_restrictions": "None"
  }'
```

## ✅ **Expected Conversation Flow**

1. **User starts call** → Assistant greets and introduces itself
2. **Data collection** → Assistant asks about age, height, weight, goals, etc.
3. **Function call** → Assistant calls generate_fitness_plan with collected data
4. **Plan generation** → Your Convex endpoint generates personalized plans
5. **Confirmation** → Assistant confirms plan is being created
6. **Call ends** → User is redirected to profile page to view their plan

## 🚨 **Troubleshooting**

### **If webhook fails:**
1. Check URL is correct: `https://adorable-chicken-667.convex.cloud/vapi/generate-program`
2. Verify headers include `Content-Type: application/json`
3. Test webhook manually using curl commands above
4. Check Convex logs for incoming requests

### **If function doesn't trigger:**
1. Ensure function is properly configured in VAPI dashboard
2. Check that system prompt instructs assistant to call the function
3. Verify all required parameters are being collected
4. Test with a simple conversation first

### **If plans aren't generated:**
1. Check Gemini API key is correct in Convex environment
2. Verify Convex functions are deployed
3. Check Convex logs for errors
4. Ensure database schema matches the data being saved

## 🎯 **Success Indicators**

✅ Assistant greets user and collects information
✅ Function is called with all required parameters
✅ Webhook receives data successfully
✅ Plans are generated and saved to database
✅ User can view plans on profile page
✅ No errors in VAPI or Convex logs
