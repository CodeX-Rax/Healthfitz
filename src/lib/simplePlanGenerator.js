// Simple plan generation function that works without complex imports
const generateSimplePlan = async (userData) => {
  try {
    console.log("🎯 Generating simple fitness plan with data:", userData);
    
    // Create a simple plan structure
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

    // Simulate saving to database
    console.log("✅ Plan generated successfully!");
    console.log("📋 Plan data:", JSON.stringify(planData, null, 2));
    
    return { 
      success: true, 
      planId: `plan_${Date.now()}`,
      data: planData 
    };
  } catch (error) {
    console.error("❌ Error generating plan:", error);
    throw error;
  }
};

module.exports = { generateSimplePlan };
