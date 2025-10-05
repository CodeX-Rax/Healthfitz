"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";

interface ConfigStatus {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  link?: string;
}

const ConfigChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<ConfigStatus[]>([]);

  const checkConfiguration = async () => {
    setIsChecking(true);
    const checks: ConfigStatus[] = [];

    // Check environment variables
    const envChecks = [
      {
        name: "VAPI API Key",
        key: "NEXT_PUBLIC_VAPI_API_KEY",
        required: true
      },
      {
        name: "VAPI Workflow ID", 
        key: "NEXT_PUBLIC_VAPI_WORKFLOW_ID",
        required: true,
        expectedValue: "bf38cd93-8c9d-44be-9f2f-c0f6f18bea82"
      },
      {
        name: "Clerk Publishable Key",
        key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", 
        required: true
      },
      {
        name: "Convex URL",
        key: "NEXT_PUBLIC_CONVEX_URL",
        required: true
      },
      {
        name: "Gemini API Key",
        key: "GEMINI_API_KEY",
        required: true
      }
    ];

    envChecks.forEach(check => {
      const value = process.env[check.key];
      if (value && value.includes("your_") && value.includes("_here")) {
        checks.push({
          name: check.name,
          status: 'warning',
          message: "Please replace the placeholder value with your actual key"
        });
      } else if (check.expectedValue && value !== check.expectedValue) {
        checks.push({
          name: check.name,
          status: 'warning',
          message: `Expected: ${check.expectedValue}, Current: ${value}`
        });
      } else if (value && value.length > 10) {
        checks.push({
          name: check.name,
          status: 'success',
          message: "Configured correctly"
        });
      } else {
        checks.push({
          name: check.name,
          status: 'error',
          message: "Missing or invalid configuration"
        });
      }
    });

    // Check VAPI test endpoint
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/vapi/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      
      if (response.ok) {
        checks.push({
          name: "VAPI Webhook Endpoint",
          status: 'success',
          message: "Endpoint is accessible"
        });
      } else {
        checks.push({
          name: "VAPI Webhook Endpoint",
          status: 'error',
          message: `Endpoint returned ${response.status}`
        });
      }
    } catch {
      checks.push({
        name: "VAPI Webhook Endpoint",
        status: 'error',
        message: "Cannot reach webhook endpoint"
      });
    }

    setResults(checks);
    setIsChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500/20 bg-green-500/5';
      case 'error':
        return 'border-red-500/20 bg-red-500/5';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/5';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Configuration Checker
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Verify that all components are properly configured
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={checkConfiguration} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? "Checking..." : "Check Configuration"}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(result.status)}`}
              >
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm text-muted-foreground">{result.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Quick Setup Links:</h4>
          <div className="space-y-2 text-sm">
            <a 
              href="https://dashboard.vapi.ai/assistants/bf38cd93-8c9d-44be-9f2f-c0f6f18bea82" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Configure VAPI Assistant
            </a>
            <a 
              href="https://dashboard.clerk.com/apps/app_325rrgWgxDaHe4Lk6U8KOAmqtyC/instances/ins_325rrlG9bPZUdJwodcG7XqCJkUB/user-authentication/user-and-authentication" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Configure Clerk Webhooks
            </a>
            <a 
              href="https://dashboard.convex.dev/t/varunjaipurkar/codeflex-86c01/adorable-chicken-667/data?table=plans" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View Convex Database
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigChecker;


