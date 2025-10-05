"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { vapi } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ConfigChecker from "@/components/ConfigChecker";
// import { useMutation } from "convex/react";
// import { api } from "../../../convex/_generated/api";

const GenerateProgramPage = () => {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  // User inputs to drive dynamic plan generation
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [injuries, setInjuries] = useState("");
  const [workoutDays, setWorkoutDays] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [planCreated, setPlanCreated] = useState(false);
  const [showConfigChecker, setShowConfigChecker] = useState(false);

  const { user } = useUser();
  const router = useRouter();
  // keep around for possible future direct Convex usage
  // const createPlan = useMutation(api.plans.createPlan);

  const messageContainerRef = useRef<HTMLDivElement>(null);
  // Keep latest form values accessible inside event handlers
  const latestFormRef = useRef({
    age: "",
    height: "",
    weight: "",
    injuries: "",
    workoutDays: "",
    fitnessGoal: "",
    fitnessLevel: "",
    dietaryRestrictions: "",
  });

  useEffect(() => {
    latestFormRef.current = {
      age,
      height,
      weight,
      injuries,
      workoutDays,
      fitnessGoal,
      fitnessLevel,
      dietaryRestrictions,
    };
  }, [age, height, weight, injuries, workoutDays, fitnessGoal, fitnessLevel, dietaryRestrictions]);

  // SOLUTION to get rid of "Meeting has ended" error
  useEffect(() => {
    const originalError = console.error;
    // override console.error to ignore "Meeting has ended" errors
    console.error = function (msg, ...args) {
      if (
        msg &&
        (msg.includes("Meeting has ended") ||
          (args[0] && args[0].toString().includes("Meeting has ended")))
      ) {
        console.log("Ignoring known error: Meeting has ended");
        return; // don't pass to original handler
      }

      // pass all other errors to the original handler
      return originalError.call(console, msg, ...args);
    };

    // restore original handler on unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  // auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // navigate user to profile page only after a plan is successfully created
  useEffect(() => {
    if (planCreated) {
      const redirectTimer = setTimeout(() => {
        router.push("/profile");
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [planCreated, router]);

  // setup event listeners for vapi
  useEffect(() => {
    const handleCallStart = () => {
      console.log("Call started");
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
      setPlanCreated(false);
    };

    const handleCallEnd = async () => {
      console.log("Call ended");
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      
      // Generate plan directly when call ends
      try {
        console.log("🎯 Generating fitness plan...");
        setMessages(prev => [...prev, {
          content: "🎯 Generating your personalized fitness plan...",
          role: "system"
        }]);
        
        // Validate required inputs (fallback to early message instead of making a bad request)
        const {
          age: vAge,
          height: vHeight,
          weight: vWeight,
          injuries: vInjuries,
          workoutDays: vWorkoutDays,
          fitnessGoal: vFitnessGoal,
          fitnessLevel: vFitnessLevel,
          dietaryRestrictions: vDietaryRestrictions,
        } = latestFormRef.current;

        const requiredMissing = [
          ["age", vAge],
          ["height", vHeight],
          ["weight", vWeight],
          ["workout_days", vWorkoutDays],
          ["fitness_goal", vFitnessGoal],
          ["fitness_level", vFitnessLevel],
        ].filter((pair) => !String(pair[1] || "").trim());

        if (requiredMissing.length > 0) {
          const missingList = requiredMissing.map(([k]) => k).join(", ");
          setMessages(prev => [...prev, {
            content: `❌ Missing required info: ${missingList}. Please fill the form on the right and try again.`,
            role: "system"
          }]);
          // do not redirect on validation failure
          return;
        }

        // Call dynamic plan generation API
        const res = await fetch("/api/vapi/generate-program", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user?.id,
            age: String(vAge).trim(),
            height: String(vHeight).trim(),
            weight: String(vWeight).trim(),
            injuries: String(vInjuries || "None").trim(),
            workout_days: String(vWorkoutDays).trim(),
            fitness_goal: String(vFitnessGoal).trim(),
            fitness_level: String(vFitnessLevel).trim(),
            dietary_restrictions: String(vDietaryRestrictions || "None").trim(),
          }),
        });

        if (!res.ok) {
          let errText = "";
          try { const j = await res.json(); errText = j?.error || JSON.stringify(j); } catch {}
          throw new Error(`Failed to generate plan dynamically (status ${res.status}): ${errText}`);
        }

        const result = await res.json();
        console.log("✅ Dynamic plan generated:", result);
        
        setMessages(prev => [...prev, {
          content: "✅ Your dynamic fitness plan has been created and saved!",
          role: "system"
        }]);
        setPlanCreated(true);
        setCallEnded(true);
      } catch (error) {
        console.error("❌ Error generating plan:", error);
        setMessages(prev => [...prev, {
          content: "❌ Error generating plan. Please try again.",
          role: "system"
        }]);
        // do not redirect on error
      }
    };

    const handleSpeechStart = () => {
      console.log("AI started Speaking");
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      console.log("AI stopped Speaking");
      setIsSpeaking(false);
    };
    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { content: message.transcript, role: message.role };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleError = (error: any) => {
      console.log("Vapi Error", error);
      setConnecting(false);
      setCallActive(false);
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    // cleanup event listeners on unmount
    return () => {
      vapi
        .off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)
        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError);
    };
  }, [user?.id]);

  // Manual generation using the filled form (no voice call needed)
  const generatePlanFromForm = async () => {
    try {
      setMessages([]);
      setCallEnded(false);
      setPlanCreated(false);

      const requiredMissing = [
        ["age", age],
        ["height", height],
        ["weight", weight],
        ["workout_days", workoutDays],
        ["fitness_goal", fitnessGoal],
        ["fitness_level", fitnessLevel],
      ].filter((pair) => !String(pair[1] || "").trim());

      if (requiredMissing.length > 0) {
        const missingList = requiredMissing.map((pair) => pair[0]).join(", ");
        setMessages((prev) => [
          ...prev,
          {
            content: `❌ Missing required info: ${missingList}. Please fill the form and try again.`,
            role: "system",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { content: "🎯 Generating your personalized fitness plan...", role: "system" },
      ]);

      const res = await fetch("/api/vapi/generate-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          age: String(age).trim(),
          height: String(height).trim(),
          weight: String(weight).trim(),
          injuries: String(injuries || "None").trim(),
          workout_days: String(workoutDays).trim(),
          fitness_goal: String(fitnessGoal).trim(),
          fitness_level: String(fitnessLevel).trim(),
          dietary_restrictions: String(dietaryRestrictions || "None").trim(),
        }),
      });

      if (!res.ok) {
        let errText = "";
        try {
          const j = await res.json();
          errText = j?.error || JSON.stringify(j);
        } catch {}
        throw new Error(`Failed to generate plan (status ${res.status}): ${errText}`);
      }

      const result = await res.json();
      console.log("✅ Manual plan generated:", result);
      setMessages((prev) => [
        ...prev,
        { content: "✅ Your fitness plan has been created and saved!", role: "system" },
      ]);
      setPlanCreated(true);
      setCallEnded(true);
    } catch (error) {
      console.error("❌ Error generating plan manually:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessages((prev) => [
        ...prev,
        { content: `❌ Error generating plan: ${errorMessage}`, role: "system" },
      ]);
    }
  };

  // Handle Enter key to submit the manual form
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      generatePlanFromForm();
    }
  };

  const toggleCall = async () => {
    if (callActive) {
      vapi.stop();
    } else {
      try {
        // Validate environment variables
        if (!process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID) {
          throw new Error("VAPI Workflow ID is not configured. Please check your environment variables.");
        }

        if (!process.env.NEXT_PUBLIC_VAPI_API_KEY) {
          throw new Error("VAPI API Key is not configured. Please check your environment variables.");
        }

        if (!user?.id) {
          throw new Error("User not authenticated. Please sign in first.");
        }

        setConnecting(true);
        setMessages([]);
        setCallEnded(false);

        const fullName = user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : "There";

        console.log("=== Starting VAPI Call ===");
        console.log("Workflow ID:", process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID);
        console.log("API Key configured:", !!process.env.NEXT_PUBLIC_VAPI_API_KEY);
        console.log("User ID:", user?.id);
        console.log("Full name:", fullName);

        // Add a system message to show the call is starting
        setMessages([{
          content: `🤖 Starting fitness consultation for ${fullName}...`,
          role: "system"
        }]);

        // Skip webhook test for now - we'll handle plan generation differently
        console.log("✅ Starting VAPI call without webhook dependency");

        // Use latest values when starting the call
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            full_name: fullName,
            user_id: user?.id,
            age: latestFormRef.current.age,
            height: latestFormRef.current.height,
            weight: latestFormRef.current.weight,
            injuries: latestFormRef.current.injuries,
            workout_days: latestFormRef.current.workoutDays,
            fitness_goal: latestFormRef.current.fitnessGoal,
            fitness_level: latestFormRef.current.fitnessLevel,
            dietary_restrictions: latestFormRef.current.dietaryRestrictions,
          },
        });
      } catch (error) {
        console.error("Failed to start call", error);
        setConnecting(false);
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setMessages([{
          content: `❌ Error: ${errorMessage}`,
          role: "system"
        }]);
        
        alert(`Failed to start call: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden  pb-6 pt-24">
      <div className="container mx-auto px-4 h-full max-w-5xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-mono">
            <span>Generate Your </span>
            <span className="text-primary uppercase">Fitness Program</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Have a voice conversation with our AI assistant to create your personalized plan
          </p>
        </div>

        {/* VIDEO CALL AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AI ASSISTANT CARD */}
          <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* AI VOICE ANIMATION */}
              <div
                className={`absolute inset-0 ${
                  isSpeaking ? "opacity-30" : "opacity-0"
                } transition-opacity duration-300`}
              >
                {/* Voice wave animation when speaking */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`mx-1 h-16 w-1 bg-primary rounded-full ${
                        isSpeaking ? "animate-sound-wave" : ""
                      }`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: isSpeaking ? `${Math.random() * 50 + 20}%` : "5%",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* AI IMAGE */}
              <div className="relative size-32 mb-4">
                <div
                  className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${
                    isSpeaking ? "animate-pulse" : ""
                  }`}
                />

                <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10"></div>
                  <img
                    src="/ai-avatar.png"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground">CodeFlex AI</h2>
              <p className="text-sm text-muted-foreground mt-1">Fitness & Diet Coach</p>

              {/* SPEAKING INDICATOR */}

              <div
                className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${
                  isSpeaking ? "border-primary" : ""
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSpeaking ? "bg-primary animate-pulse" : "bg-muted"
                  }`}
                />

                <span className="text-xs text-muted-foreground">
                  {isSpeaking
                    ? "Speaking..."
                    : callActive
                      ? "Listening..."
                      : callEnded
                        ? "Redirecting to profile..."
                        : "Waiting..."}
                </span>
              </div>
            </div>
          </Card>

          {/* USER CARD */}
          <Card className={`bg-card/90 backdrop-blur-sm border overflow-hidden relative`}>
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* User Image */}
              <div className="relative size-32 mb-4">
                <img
                  src={user?.imageUrl}
                  alt="User"
                  // ADD THIS "size-full" class to make it rounded on all images
                  className="size-full object-cover rounded-full"
                />
              </div>

              <h2 className="text-xl font-bold text-foreground">You</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user ? (user.firstName + " " + (user.lastName || "")).trim() : "Guest"}
              </p>

              {/* Pre-call inputs */}
              <div className="mt-4 w-full max-w-sm space-y-2 text-left">
                <input value={age} onChange={e=>setAge(e.target.value)} onKeyDown={onInputKeyDown} placeholder="Age" className="w-full px-3 py-2 rounded border bg-background" />
                <input value={height} onChange={e=>setHeight(e.target.value)} onKeyDown={onInputKeyDown} placeholder={'Height (e.g., 5\'8" or 172cm)'} className="w-full px-3 py-2 rounded border bg-background" />
                <input value={weight} onChange={e=>setWeight(e.target.value)} onKeyDown={onInputKeyDown} placeholder="Weight (e.g., 150 lbs or 68kg)" className="w-full px-3 py-2 rounded border bg-background" />
                <input value={fitnessGoal} onChange={e=>setFitnessGoal(e.target.value)} onKeyDown={onInputKeyDown} placeholder="Fitness Goal (e.g., Build muscle)" className="w-full px-3 py-2 rounded border bg-background" />
                <input value={fitnessLevel} onChange={e=>setFitnessLevel(e.target.value)} onKeyDown={onInputKeyDown} placeholder="Fitness Level (Beginner/Intermediate/Advanced)" className="w-full px-3 py-2 rounded border bg-background" />
                <input value={workoutDays} onChange={e=>setWorkoutDays(e.target.value)} onKeyDown={onInputKeyDown} placeholder="Workout Days per week (e.g., 3)" className="w-full px-3 py-2 rounded border bg-background" />
                <input value={injuries} onChange={e=>setInjuries(e.target.value)} onKeyDown={onInputKeyDown} placeholder="Injuries or limitations (optional)" className="w-full px-3 py-2 rounded border bg-background" />
                <input value={dietaryRestrictions} onChange={e=>setDietaryRestrictions(e.target.value)} onKeyDown={onInputKeyDown} placeholder="Dietary restrictions (optional)" className="w-full px-3 py-2 rounded border bg-background" />
                <Button onClick={generatePlanFromForm} disabled={connecting || callActive} className="w-full mt-2">
                  Generate Plan
                </Button>
                <p className="text-xs text-muted-foreground">These details will be shared with the assistant and used to generate your plan.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* MESSAGE COINTER  */}
        {messages.length > 0 && (
          <div
            ref={messageContainerRef}
            className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-64 overflow-y-auto transition-all duration-300 scroll-smooth"
          >
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-muted-foreground mb-1">
                    {msg.role === "assistant" ? "CodeFlex AI" : "You"}:
                  </div>
                  <p className="text-foreground">{msg.content}</p>
                </div>
              ))}

              {callEnded && (
                <div className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-primary mb-1">System:</div>
                  <p className="text-foreground">
                    Your fitness program has been created! Redirecting to your profile...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CALL CONTROLS */}
        <div className="w-full flex justify-center gap-4">
          <Button
            className={`w-40 text-xl rounded-3xl ${
              callActive
                ? "bg-destructive hover:bg-destructive/90"
                : callEnded
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary hover:bg-primary/90"
            } text-white relative`}
            onClick={toggleCall}
            disabled={connecting || callEnded}
          >
            {connecting && (
              <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
            )}

            <span>
              {callActive
                ? "End Call"
                : connecting
                  ? "Connecting..."
                  : callEnded
                    ? "View Profile"
                    : "Start Call"}
            </span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowConfigChecker(!showConfigChecker)}
            className="w-40 text-lg rounded-3xl"
          >
            {showConfigChecker ? "Hide Config" : "Check Config"}
          </Button>
        </div>

        {/* CONFIGURATION CHECKER */}
        {showConfigChecker && (
          <div className="mt-8">
            <ConfigChecker />
          </div>
        )}
      </div>
    </div>
  );
};
export default GenerateProgramPage;