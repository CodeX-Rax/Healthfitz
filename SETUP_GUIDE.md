# CodeFlex - Health Fitness AI Project Setup Guide

## 🚀 **NEW FEATURES ADDED**

### ✅ **Built-in Configuration Checker**
- Added a configuration checker component that validates all your settings
- Access it by clicking "Check Config" button on the generate-program page
- Provides real-time validation of environment variables and webhook connectivity

### ✅ **Enhanced Error Handling**
- Better error messages and validation throughout the application
- Detailed logging for debugging webhook issues
- User-friendly error feedback in the UI

### ✅ **Test Endpoint**
- Added `/vapi/test` endpoint to verify webhook connectivity
- Use this to test if your VAPI assistant can reach your Convex endpoint

## 📋 **Step-by-Step Setup Instructions**

### **Step 1: Environment Variables Setup**

Create a `.env.local` file in your project root with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_clerk_key_here
CLERK_SECRET_KEY=sk_test_your_actual_clerk_secret_here
CLERK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://adorable-chicken-667.convex.cloud
CONVEX_DEPLOY_KEY=your_actual_convex_deploy_key_here

# VAPI AI
NEXT_PUBLIC_VAPI_API_KEY=your_actual_vapi_api_key_here
NEXT_PUBLIC_VAPI_WORKFLOW_ID=bf38cd93-8c9d-44be-9f2f-c0f6f18bea82

# Google Gemini AI
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**⚠️ IMPORTANT:** Replace all placeholder values with your actual API keys!

### **Step 2: VAPI Assistant Configuration**

**🔗 Go to your VAPI dashboard:** [https://dashboard.vapi.ai/assistants/5194e860-4266-4bc9-8c66-84ff331764c1](https://dashboard.vapi.ai/assistants/5194e860-4266-4bc9-8c66-84ff331764c1)

**Configure the webhook:**

1. **Navigate to your assistant settings**
2. **Add a Function Call or Webhook** with these exact details:
   - **URL**: `https://adorable-chicken-667.convex.cloud/vapi/generate-program`
   - **Method**: POST
   - **Trigger**: When conversation ends or when specific conditions are met
   - **Headers**: `Content-Type: application/json`

3. **The webhook payload structure** (copy this exactly):
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

**🧪 Test the webhook first:**
- Use the test endpoint: `https://adorable-chicken-667.convex.cloud/vapi/test`
- Send a POST request with `{"test": true}` to verify connectivity

### **Step 3: Clerk Webhook Setup**

**🔗 Go to your Clerk dashboard:** [https://dashboard.clerk.com/apps/app_325rrgWgxDaHe4Lk6U8KOAmqtyC/instances/ins_325rrlG9bPZUdJwodcG7XqCJkUB/user-authentication/user-and-authentication](https://dashboard.clerk.com/apps/app_325rrgWgxDaHe4Lk6U8KOAmqtyC/instances/ins_325rrlG9bPZUdJwodcG7XqCJkUB/user-authentication/user-and-authentication)

**Configure the webhook:**

1. **Navigate to Webhooks section**
2. **Add a new webhook endpoint** with these details:
   - **URL**: `https://adorable-chicken-667.convex.cloud/clerk-webhook`
   - **Events**: Select `user.created` and `user.updated`
   - **Secret**: Use the same secret as `CLERK_WEBHOOK_SECRET` in your env file

### 4. Issues Fixed in Code

#### A. Database Schema Mismatch
- Fixed the `createPlan` mutation to match the schema definition
- Made `sets`, `reps`, `duration`, `description`, and `exercises` optional in routines

#### B. Enhanced Error Handling and Logging
- Added comprehensive logging in the HTTP endpoint
- Added validation for required fields
- Improved error messages for debugging

#### C. VAPI Integration Improvements
- Added better error handling in the generate-program page
- Added logging for debugging VAPI calls
- Added user feedback for failed calls

#### D. Added New Query Function
- Added `getActivePlan` query to easily fetch the user's active plan

### **Step 4: Testing the Integration**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Deploy Convex functions:**
   ```bash
   npx convex dev
   ```

3. **Test the configuration:**
   - Go to `/generate-program`
   - Click the "Check Config" button
   - Verify all components show green checkmarks

4. **Test the complete flow:**
   - Click "Start Call" to begin conversation with VAPI assistant
   - Complete the fitness consultation conversation
   - Check your profile page to see if the plan was created
   - Verify data in your [Convex Dashboard](https://dashboard.convex.dev/t/varunjaipurkar/codeflex-86c01/adorable-chicken-667/data?table=plans)

### **Step 5: Debugging Steps**

If plans are still not being generated:

1. **Use the built-in config checker** - Click "Check Config" button
2. **Check browser console** for VAPI errors
3. **Check Convex logs** in the dashboard for HTTP endpoint errors
4. **Test the webhook endpoint** using the `/vapi/test` endpoint
5. **Verify all environment variables** are correctly set
6. **Check VAPI assistant logs** for webhook call attempts

### **Step 6: Key Files Modified**

- ✅ `convex/plans.ts` - Fixed schema mismatch
- ✅ `convex/http.ts` - Enhanced logging, error handling, and added test endpoint
- ✅ `src/app/generate-program/page.tsx` - Improved VAPI integration and added config checker
- ✅ `src/components/ConfigChecker.tsx` - New configuration validation component
- ✅ `SETUP_GUIDE.md` - Updated with new features and improved instructions

### **Step 7: Quick Start Checklist**

- [ ] Create `.env.local` file with your actual API keys
- [ ] Configure VAPI webhook to call your Convex endpoint
- [ ] Configure Clerk webhook for user management
- [ ] Run `npm run dev` and `npx convex dev`
- [ ] Test configuration using the built-in checker
- [ ] Test the complete flow end-to-end

### **🎯 Expected Result**

Once properly configured, your flow will work like this:

1. ✅ User starts conversation with VAPI assistant
2. ✅ Assistant collects fitness information through voice
3. ✅ Conversation ends → VAPI calls your Convex endpoint
4. ✅ Convex generates workout/diet plans using Gemini AI
5. ✅ Plans are saved to your database automatically
6. ✅ User sees their personalized plan on the profile page

**The critical missing piece was the VAPI webhook configuration. Now with the built-in checker and enhanced error handling, you can easily identify and fix any remaining issues!**
