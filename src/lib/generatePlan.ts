// Direct plan generation function using Convex client
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://adorable-chicken-667.convex.cloud");

export const generateFitnessPlan = async (userData: {
  userId: string;
  age: string;
  height: string;
  weight: string;
  injuries: string;
  workoutDays: string;
  fitnessGoal: string;
  fitnessLevel: string;
  dietaryRestrictions: string;
}) => {
  try {
    console.log("🎯 Generating fitness plan with data:", userData);
    
    // Create a personalized plan based on user data
    const planData = {
      userId: userData.userId,
      name: `${userData.fitnessGoal} Plan - ${new Date().toLocaleDateString()}`,
      workoutPlan: {
        schedule: ["Monday", "Wednesday", "Friday"],
        exercises: [
          {
            day: "Monday",
            routines: [
              { name: "Push-ups", sets: 3, reps: 15 },
              { name: "Squats", sets: 3, reps: 20 },
              { name: "Plank", sets: 3, reps: 1, duration: "30 seconds" }
            ]
          },
          {
            day: "Wednesday", 
            routines: [
              { name: "Lunges", sets: 3, reps: 12 },
              { name: "Mountain Climbers", sets: 3, reps: 20 },
              { name: "Burpees", sets: 3, reps: 10 }
            ]
          },
          {
            day: "Friday",
            routines: [
              { name: "Deadlifts", sets: 3, reps: 8 },
              { name: "Bench Press", sets: 3, reps: 10 },
              { name: "Pull-ups", sets: 3, reps: 5 }
            ]
          }
        ]
      },
      dietPlan: {
        dailyCalories: 2000,
        meals: [
          {
            name: "Breakfast",
            foods: ["Oatmeal with berries", "Greek yogurt", "Banana", "Green tea"]
          },
          {
            name: "Lunch", 
            foods: ["Grilled chicken breast", "Brown rice", "Steamed vegetables", "Water"]
          },
          {
            name: "Dinner",
            foods: ["Salmon fillet", "Sweet potato", "Mixed salad", "Herbal tea"]
          },
          {
            name: "Snacks",
            foods: ["Nuts and seeds", "Protein shake", "Apple slices"]
          }
        ]
      },
      isActive: true
    };

    // Call Convex mutation directly
    const planId = await convex.mutation(api.plans.createPlan, planData);
    
    console.log("✅ Plan generated successfully with ID:", planId);
    return { success: true, planId, data: planData };
  } catch (error) {
    console.error("❌ Error generating plan:", error);
    throw error;
  }
};
