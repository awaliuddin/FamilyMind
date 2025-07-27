import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ShoppingCart, Lightbulb, Heart, Gift, Brain, Users, Clock, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800">FamilyMind</h1>
              <p className="text-lg text-gray-600">AI-Powered Family Assistant</p>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            Transform Your Family Organization
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            An intelligent family assistant that proactively manages household operations, 
            anticipates needs, and streamlines family coordination through natural conversation.
          </p>
          
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started for Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-blue-800">Smart Scheduling</CardTitle>
              <CardDescription>
                AI-powered calendar management with conflict detection and optimization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Intelligent Grocery Lists</CardTitle>
              <CardDescription>
                Store-specific shopping lists with consumption pattern predictions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-amber-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                <Lightbulb className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-amber-800">Family Ideas Board</CardTitle>
              <CardDescription>
                Collaborative space for family activities with voting and suggestions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-pink-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle className="text-pink-800">Vision Board</CardTitle>
              <CardDescription>
                Track family goals and dreams with progress monitoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-purple-800">Wish Lists</CardTitle>
              <CardDescription>
                Organized gift tracking for birthdays, holidays, and special occasions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-indigo-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-indigo-800">AI Assistant</CardTitle>
              <CardDescription>
                Natural conversation interface for all your family coordination needs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">Why Choose FamilyMind?</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Save 2+ Hours Weekly</h4>
              <p className="text-gray-600">Automate routine family tasks and reduce administrative overhead</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Improve Family Harmony</h4>
              <p className="text-gray-600">Prevent conflicts with intelligent scheduling and coordination</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Proactive Intelligence</h4>
              <p className="text-gray-600">Anticipate needs before they become problems</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Family Organization?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of families who have reduced their mental load and improved coordination with FamilyMind.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-gray-600 bg-white/50">
        <p className="text-sm">&copy; 2024 FamilyMind AI. Bringing families closer through intelligent organization.</p>
      </footer>
    </div>
  );
}
