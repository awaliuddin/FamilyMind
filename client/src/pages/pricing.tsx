import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Brain, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || "";

function FeatureRow({ feature, free, premium }: { feature: string; free: boolean; premium: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-700">{feature}</span>
      <div className="flex gap-12">
        <span className="w-16 text-center">
          {free ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-300 mx-auto" />}
        </span>
        <span className="w-16 text-center">
          {premium ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-300 mx-auto" />}
        </span>
      </div>
    </div>
  );
}

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  async function handleUpgrade() {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    try {
      const res = await apiRequest("POST", "/api/billing/create-checkout", {
        priceId: STRIPE_PRICE_ID,
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Checkout creation failed — user may not have a family yet
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to app
        </button>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">FamilyMind Plans</h1>
          </div>
          <p className="text-lg text-gray-600">
            Choose the plan that fits your family
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Grocery lists</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Calendar management</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Ideas board &amp; vision board</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Wish lists &amp; recipes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Up to 2 family members</span>
                </li>
                <li className="flex items-center gap-2">
                  <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  <span className="text-gray-400">AI assistant</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-purple-400 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              RECOMMENDED
            </div>
            <CardHeader>
              <CardTitle className="text-xl text-purple-700">Premium</CardTitle>
              <CardDescription>For families who want it all</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Everything in Free</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited family members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">AI assistant &amp; smart suggestions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Grocery predictions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Schedule conflict detection</span>
                </li>
              </ul>
              <Button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end gap-12 mb-4 pr-0">
              <span className="w-16 text-center text-sm font-semibold text-gray-500">Free</span>
              <span className="w-16 text-center text-sm font-semibold text-purple-600">Premium</span>
            </div>
            <FeatureRow feature="Grocery lists" free premium />
            <FeatureRow feature="Calendar" free premium />
            <FeatureRow feature="Family ideas board" free premium />
            <FeatureRow feature="Vision board" free premium />
            <FeatureRow feature="Wish lists" free premium />
            <FeatureRow feature="Recipes & meal planning" free premium />
            <FeatureRow feature="Budget tracking" free premium />
            <FeatureRow feature="Real-time sync" free premium />
            <FeatureRow feature="Up to 2 family members" free premium />
            <FeatureRow feature="Unlimited family members" free={false} premium />
            <FeatureRow feature="AI assistant" free={false} premium />
            <FeatureRow feature="Smart grocery predictions" free={false} premium />
            <FeatureRow feature="Schedule conflict detection" free={false} premium />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
