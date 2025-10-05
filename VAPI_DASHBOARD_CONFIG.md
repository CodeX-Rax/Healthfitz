# 🎯 VAPI Assistant Dashboard Configuration

## 📋 **Copy These Exact Settings to Your VAPI Dashboard**

### **🔗 Go to:** https://dashboard.vapi.ai/assistants/bf38cd93-8c9d-44be-9f2f-c0f6f18bea82

---

## **1. Basic Settings**

### **Assistant Name:**
```
CodeFlex Fitness AI
```

### **Model:**
```
gpt-4o-mini
```

### **Voice:**
```
sarah
```

### **Max Duration:**
```
300 seconds
```

---

## **2. System Message (Copy This Exactly):**

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

---

## **3. First Message:**

```
Hello! I'm CodeFlex AI, your personal fitness and nutrition coach. I'm here to help you create a personalized workout and diet plan. Let's start by learning about your fitness goals and current situation. What's your name?
```

---

## **4. Function Configuration**

### **Go to "Functions" section and add:**

**Function Name:**
```
generate_fitness_plan
```

**Description:**
```
Generate personalized fitness and diet plan based on user information
```

**URL:**
```
https://adorable-chicken-667.convex.cloud/vapi/generate-program
```

**Method:**
```
POST
```

**Headers:**
```
Content-Type: application/json
User-Agent: Vapi-AI-Webhook/1.0
```

**Timeout:**
```
30 seconds
```

**Parameters (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The user's unique identifier"
    },
    "age": {
      "type": "string",
      "description": "User's age in years"
    },
    "height": {
      "type": "string",
      "description": "User's height (e.g., '5'8\"', '175cm')"
    },
    "weight": {
      "type": "string",
      "description": "User's weight (e.g., '150 lbs', '68kg')"
    },
    "injuries": {
      "type": "string",
      "description": "Any injuries or physical limitations"
    },
    "workout_days": {
      "type": "string",
      "description": "Number of days per week available for workouts"
    },
    "fitness_goal": {
      "type": "string",
      "description": "Primary fitness objective"
    },
    "fitness_level": {
      "type": "string",
      "description": "Current fitness experience level"
    },
    "dietary_restrictions": {
      "type": "string",
      "description": "Any dietary limitations or preferences"
    }
  },
  "required": ["user_id", "age", "height", "weight", "fitness_goal", "fitness_level"]
}
```

---

## **5. Server Messages (Enable These):**

✅ conversation-update
✅ end-of-call-report
✅ function-call
✅ speech-start
✅ speech-end
✅ message
✅ error

---

## **6. HTTP Headers (Add These):**

```
Content-Type: application/json
User-Agent: Vapi-AI-Webhook/1.0
```

---

## **7. Save Configuration**

After adding all these settings, click **"Save"** or **"Update"** in your VAPI dashboard.

---

## **✅ Configuration Complete!**

Your VAPI assistant is now configured to:
- ✅ Collect fitness information naturally
- ✅ Call your webhook when conversation ends
- ✅ Generate personalized plans automatically
- ✅ Handle errors gracefully
- ✅ Provide professional user experience
