import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);




function validateWorkoutPlan(plan: any) {
  const validated = {
    schedule: Array.isArray(plan?.schedule) ? plan.schedule : [],
    exercises: Array.isArray(plan?.exercises)
      ? plan.exercises.map((exercise: any) => ({
          day: exercise.day,
          routines: Array.isArray(exercise?.routines)
            ? exercise.routines.map((routine: any) => ({
                name: routine.name,
                sets:
                  typeof routine.sets === "number"
                    ? routine.sets
                    : parseInt(routine.sets) || 1,
                reps:
                  typeof routine.reps === "number"
                    ? routine.reps
                    : parseInt(routine.reps) || 8,
                duration: routine.duration,
                description: routine.description,
                exercises: routine.exercises,
              }))
            : [],
        }))
      : [],
  };
  return validated;
}

function validateDietPlan(plan: any) {
  const validated = {
    dailyCalories:
      typeof plan?.dailyCalories === "number"
        ? plan.dailyCalories
        : parseInt(plan?.dailyCalories) || 2000,
    meals: Array.isArray(plan?.meals)
      ? plan.meals.map((meal: any) => ({ name: meal.name, foods: meal.foods }))
      : [],
  };
  return validated;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const {
      user_id,
      age,
      height,
      weight,
      injuries,
      workout_days,
      fitness_goal,
      fitness_level,
      dietary_restrictions,
    } = payload || {};

    const missing: string[] = [];
    if (!user_id) missing.push("user_id");
    if (!age) missing.push("age");
    if (!height) missing.push("height");
    if (!weight) missing.push("weight");
    if (!fitness_goal) missing.push("fitness_goal");
    if (!fitness_level) missing.push("fitness_level");
    if (missing.length) {
      return NextResponse.json(
        { success: false, error: `Missing: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      generationConfig: { temperature: 0.8, responseMimeType: "application/json" },
    });

    // Determine number of workout days (default 3 if missing)
    const dayCount = Math.max(1, Math.min(7, parseInt(String(workout_days || "3")) || 3));
    const dayNames = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const requestedDaysText = `Create a schedule with exactly ${dayCount} distinct day names chosen from Monday..Sunday.`;

    // Helper to parse JSON that might come wrapped in code fences
    const parseJson = (text: string) => {
      const trimmed = text.trim().replace(/^```(json)?/i, "").replace(/```$/i, "");
      return JSON.parse(trimmed);
    };

    const workoutPrompt = `You are a certified strength and conditioning coach. Create a weekly workout plan.
Age: ${age}
Height: ${height}
Weight: ${weight}
Injuries: ${injuries}
Days available: ${workout_days}
Goal: ${fitness_goal}
Level: ${fitness_level}

${requestedDaysText}
Vary exercises per day and align with the user's level and goal. Use realistic sets and reps (numbers only). Avoid repeating the same routine across all days.

Return JSON with this EXACT structure and keys only:
{
  "schedule": ["Day 1", "Day 2"],
  "exercises": [
    {"day": "Day 1", "routines": [{"name": "Exercise", "sets": 3, "reps": 10}]}
  ]
}`;

    const workoutResult = await model.generateContent(workoutPrompt);
    const workoutPlanText = workoutResult.response.text();
    if (!workoutPlanText) {
      throw new Error("Empty response from model for workout plan");
    }
    let workoutPlan;
    try {
      workoutPlan = validateWorkoutPlan(parseJson(workoutPlanText));
    } catch {
      // Fallback minimal plan if parsing fails
      const schedule = dayNames.slice(0, dayCount);
      workoutPlan = validateWorkoutPlan({
        schedule,
        exercises: schedule.map((day) => ({
          day,
          routines: [
            { name: "Full Body Circuit", sets: 3, reps: 12 },
            { name: "Core Plank", sets: 3, reps: 1, duration: "45 seconds" },
          ],
        })),
      });
    }

    const dietPrompt = `You are a certified nutritionist. Build a daily diet plan.
Age: ${age}
Height: ${height}
Weight: ${weight}
Goal: ${fitness_goal}
Diet restrictions: ${dietary_restrictions}

Return JSON with this EXACT structure and keys only:
{
  "dailyCalories": 2000,
  "meals": [
    {"name": "Breakfast", "foods": ["Food 1", "Food 2"]}
  ]
}`;

    const dietResult = await model.generateContent(dietPrompt);
    const dietPlanText = dietResult.response.text();
    if (!dietPlanText) {
      throw new Error("Empty response from model for diet plan");
    }
    let dietPlan;
    try {
      dietPlan = validateDietPlan(parseJson(dietPlanText));
    } catch {
      dietPlan = validateDietPlan({
        dailyCalories: 2000,
        meals: [
          { name: "Breakfast", foods: ["Eggs", "Oats", "Fruit"] },
          { name: "Lunch", foods: ["Chicken", "Rice", "Salad"] },
          { name: "Dinner", foods: ["Fish", "Potato", "Veggies"] },
        ],
      });
    }

    const name = `${fitness_goal} Plan - ${new Date().toLocaleDateString()}`;

    const planId = await convex.mutation(api.plans.createPlan, {
      userId: user_id,
      name,
      workoutPlan,
      dietPlan,
      isActive: true,
    });

    return NextResponse.json(
      { success: true, data: { planId, workoutPlan, dietPlan } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}




