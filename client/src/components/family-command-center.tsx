import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { 
  GroceryList, 
  GroceryItem, 
  CalendarEvent, 
  FamilyIdea, 
  VisionItem, 
  WishListItem 
} from "@shared/schema";
import {
  Calendar,
  ShoppingCart,
  Lightbulb,
  Heart,
  Gift,
  Plus,
  Trash2,
  Bot,
  TrendingUp,
  Users,
  Clock,
  Home,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import AIChat from "./ai-chat";

export default function FamilyCommandCenter() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auth error handler
  const handleUnauthorizedError = (error: Error) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return true;
    }
    return false;
  };

  // Fetch all data
  const { data: groceryLists = [], isLoading: loadingGrocery } = useQuery<(GroceryList & { items: GroceryItem[] })[]>({
    queryKey: ['/api/grocery-lists'],
    retry: false,
  });

  const { data: calendarEvents = [], isLoading: loadingEvents } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/calendar-events'],
    retry: false,
  });

  const { data: familyIdeas = [], isLoading: loadingIdeas } = useQuery<(FamilyIdea & { userLiked: boolean })[]>({
    queryKey: ['/api/family-ideas'],
    retry: false,
  });

  const { data: visionItems = [], isLoading: loadingVision } = useQuery<VisionItem[]>({
    queryKey: ['/api/vision-items'],
    retry: false,
  });

  const { data: wishlistItems = [], isLoading: loadingWishlist } = useQuery<WishListItem[]>({
    queryKey: ['/api/wishlist-items'],
    retry: false,
  });

  // Mutations
  const addGroceryItemMutation = useMutation({
    mutationFn: async ({ listId, name }: { listId: string; name: string }) => {
      const response = await apiRequest('POST', '/api/grocery-items', { listId, name });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-lists'] });
      setNewItemInputs(prev => ({ ...prev, [`grocery-${activeTab}`]: '' }));
    },
    onError: handleUnauthorizedError,
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (idea: { title: string; author: string }) => {
      const response = await apiRequest('POST', '/api/family-ideas', idea);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-ideas'] });
      setNewItemInputs(prev => ({ ...prev, 'new-idea': '' }));
    },
    onError: handleUnauthorizedError,
  });

  const likeIdeaMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      const response = await apiRequest('POST', `/api/family-ideas/${ideaId}/like`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-ideas'] });
    },
    onError: handleUnauthorizedError,
  });

  const createVisionMutation = useMutation({
    mutationFn: async (vision: { title: string; description: string; author: string; color: string; icon: string }) => {
      const response = await apiRequest('POST', '/api/vision-items', vision);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vision-items'] });
      setNewItemInputs(prev => ({ ...prev, 'new-vision': '' }));
    },
    onError: handleUnauthorizedError,
  });

  const createWishlistMutation = useMutation({
    mutationFn: async (item: { item: string; person: string; occasion: string; store?: string; price?: string }) => {
      const response = await apiRequest('POST', '/api/wishlist-items', item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist-items'] });
      setNewItemInputs(prev => ({ ...prev, 'new-wishlist': '', 'wishlist-person': '', 'wishlist-occasion': '' }));
    },
    onError: handleUnauthorizedError,
  });

  // Helper functions
  const handleInputChange = (key: string, value: string) => {
    setNewItemInputs(prev => ({ ...prev, [key]: value }));
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      pink: 'from-pink-100 to-pink-200 border-pink-300 text-pink-800',
      blue: 'from-blue-100 to-blue-200 border-blue-300 text-blue-800',
      green: 'from-green-100 to-green-200 border-green-300 text-green-800',
      yellow: 'from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800',
      purple: 'from-purple-100 to-purple-200 border-purple-300 text-purple-800',
      indigo: 'from-indigo-100 to-indigo-200 border-indigo-300 text-indigo-800',
    };
    return colorMap[color] || colorMap.blue;
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-800">FamilyMind</CardTitle>
                  <p className="text-sm text-gray-600">AI-Powered Family Assistant</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setChatOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Ask AI
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <TabsList className="grid w-full grid-cols-6 bg-gray-50">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="grocery" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <ShoppingCart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Grocery</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="ideas" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Lightbulb className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ideas</span>
              </TabsTrigger>
              <TabsTrigger value="vision" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Heart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Vision</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Gift className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Family Dashboard</h2>
                <p className="text-gray-600">Your family's intelligent command center</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">This Week</p>
                        <p className="text-2xl font-bold text-blue-800">{calendarEvents.length}</p>
                        <p className="text-blue-600 text-xs">Family Events</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Grocery Items</p>
                        <p className="text-2xl font-bold text-green-800">
                          {groceryLists.reduce((acc: number, list) => acc + list.items.length, 0)}
                        </p>
                        <p className="text-green-600 text-xs">Auto-managed</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-600 text-sm font-medium">Active Ideas</p>
                        <p className="text-2xl font-bold text-amber-800">{familyIdeas.length}</p>
                        <p className="text-amber-600 text-xs">Family voted</p>
                      </div>
                      <Lightbulb className="h-8 w-8 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-600 text-sm font-medium">Dreams</p>
                        <p className="text-2xl font-bold text-pink-800">{visionItems.length}</p>
                        <p className="text-pink-600 text-xs">Vision board</p>
                      </div>
                      <Heart className="h-8 w-8 text-pink-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-gray-50 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-800">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      {loadingEvents ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                      ) : calendarEvents.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No upcoming events</p>
                      ) : (
                        <div className="space-y-3">
                          {calendarEvents.slice(0, 5).map((event) => (
                            <div key={event.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{event.title}</p>
                                <p className="text-sm text-gray-600">{formatDate(event.startTime)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-800">
                      <Lightbulb className="h-5 w-5 text-amber-600 mr-2" />
                      Top Family Ideas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      {loadingIdeas ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                        </div>
                      ) : familyIdeas.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No family ideas yet</p>
                      ) : (
                        <div className="space-y-3">
                          {familyIdeas.slice(0, 5).map((idea) => (
                            <div key={idea.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{idea.title}</p>
                                <p className="text-sm text-gray-600">by {idea.author}</p>
                              </div>
                              <div className="flex items-center space-x-1 text-red-500">
                                <Heart className="h-4 w-4 fill-current" />
                                <span className="text-sm font-medium">{idea.likes}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Grocery Tab */}
            <TabsContent value="grocery" className="p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Smart Grocery Lists</h2>
                <p className="text-gray-600">AI-powered shopping with store-specific optimization</p>
              </div>

              {loadingGrocery ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : groceryLists.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No grocery lists yet</p>
                    <p className="text-sm text-gray-400">Grocery lists will appear here as you create them</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {groceryLists.map((list) => (
                    <Card key={list.id} className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-blue-800">{list.store}</CardTitle>
                            {list.storeTip && (
                              <p className="text-blue-600 text-sm">💡 {list.storeTip}</p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {list.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="checkbox" 
                                  checked={item.completed || false}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className={`text-gray-800 ${item.completed ? 'line-through opacity-60' : ''}`}>
                                  {item.name}
                                </span>
                                {item.autoAdded && (
                                  <Badge variant="secondary" className="text-xs">Auto</Badge>
                                )}
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add item..."
                            value={newItemInputs[`grocery-${list.id}`] || ''}
                            onChange={(e) => handleInputChange(`grocery-${list.id}`, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newItemInputs[`grocery-${list.id}`]?.trim()) {
                                addGroceryItemMutation.mutate({
                                  listId: list.id,
                                  name: newItemInputs[`grocery-${list.id}`].trim()
                                });
                              }
                            }}
                          />
                          <Button
                            onClick={() => {
                              if (newItemInputs[`grocery-${list.id}`]?.trim()) {
                                addGroceryItemMutation.mutate({
                                  listId: list.id,
                                  name: newItemInputs[`grocery-${list.id}`].trim()
                                });
                              }
                            }}
                            disabled={!newItemInputs[`grocery-${list.id}`]?.trim() || addGroceryItemMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Family Calendar</h2>
                <p className="text-gray-600">Smart scheduling with conflict detection</p>
              </div>

              {loadingEvents ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : calendarEvents.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No events scheduled</p>
                    <p className="text-sm text-gray-400">Your family events will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {calendarEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {new Date(event.startTime).getDate()}
                              </div>
                              <div className="text-sm text-blue-600">
                                {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              <div>
                                <h3 className="font-semibold text-gray-800">{event.title}</h3>
                                <p className="text-sm text-gray-600">
                                  {formatDate(event.startTime)} - {formatDate(event.endTime)}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="secondary" className="capitalize">
                                    {event.eventType}
                                  </Badge>
                                  {event.location && (
                                    <span className="text-xs text-gray-500">{event.location}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Ideas Tab */}
            <TabsContent value="ideas" className="p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Family Idea Board</h2>
                <p className="text-gray-600">Share and vote on family activities and projects</p>
              </div>

              {/* Add Idea Section */}
              <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                    <Lightbulb className="h-5 w-5 text-amber-600 mr-2" />
                    Share a New Idea
                  </h3>
                  <div className="flex space-x-3">
                    <Input
                      placeholder="What fun family activity should we try?"
                      value={newItemInputs['new-idea'] || ''}
                      onChange={(e) => handleInputChange('new-idea', e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newItemInputs['new-idea']?.trim()) {
                          createIdeaMutation.mutate({
                            title: newItemInputs['new-idea'].trim(),
                            author: 'You'
                          });
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (newItemInputs['new-idea']?.trim()) {
                          createIdeaMutation.mutate({
                            title: newItemInputs['new-idea'].trim(),
                            author: 'You'
                          });
                        }
                      }}
                      disabled={!newItemInputs['new-idea']?.trim() || createIdeaMutation.isPending}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Idea
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {loadingIdeas ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : familyIdeas.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No family ideas yet</p>
                    <p className="text-sm text-gray-400">Add your first family activity idea above</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {familyIdeas.map((idea) => (
                    <Card key={idea.id} className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-2">{idea.title}</h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Users className="h-4 w-4 text-blue-600 mr-2" />
                              Suggested by {idea.author}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likeIdeaMutation.mutate(idea.id)}
                            disabled={likeIdeaMutation.isPending}
                            className={`flex items-center space-x-1 transition-colors ${
                              idea.userLiked ? 'text-red-600' : 'text-red-500 hover:text-red-700'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${idea.userLiked ? 'fill-current' : ''}`} />
                            <span>{idea.likes}</span>
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex space-x-2">
                            {idea.tags?.map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Vision Tab */}
            <TabsContent value="vision" className="p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Family Vision Board</h2>
                <p className="text-gray-600">Dream big together - your family's goals and aspirations</p>
              </div>

              {/* Add Vision Item */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <Heart className="h-5 w-5 text-purple-600 mr-2" />
                    Add a Family Dream or Goal
                  </h3>
                  <div className="flex space-x-3">
                    <Input
                      placeholder="What does your family dream of achieving?"
                      value={newItemInputs['new-vision'] || ''}
                      onChange={(e) => handleInputChange('new-vision', e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newItemInputs['new-vision']?.trim()) {
                          const colors = ['pink', 'blue', 'green', 'yellow', 'purple', 'indigo'];
                          const randomColor = colors[Math.floor(Math.random() * colors.length)];
                          createVisionMutation.mutate({
                            title: newItemInputs['new-vision'].trim(),
                            description: 'New family goal',
                            author: 'You',
                            color: randomColor,
                            icon: 'star'
                          });
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (newItemInputs['new-vision']?.trim()) {
                          const colors = ['pink', 'blue', 'green', 'yellow', 'purple', 'indigo'];
                          const randomColor = colors[Math.floor(Math.random() * colors.length)];
                          createVisionMutation.mutate({
                            title: newItemInputs['new-vision'].trim(),
                            description: 'New family goal',
                            author: 'You',
                            color: randomColor,
                            icon: 'star'
                          });
                        }
                      }}
                      disabled={!newItemInputs['new-vision']?.trim() || createVisionMutation.isPending}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Dream
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {loadingVision ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : visionItems.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No family dreams yet</p>
                    <p className="text-sm text-gray-400">Add your first family goal above</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {visionItems.map((item) => (
                    <Card key={item.id} className={`bg-gradient-to-br ${getColorClasses(item.color)} border-2 hover:shadow-lg transition-all text-center`}>
                      <CardContent className="p-6">
                        <div className="mb-4">
                          <Heart className={`h-8 w-8 mx-auto ${item.color === 'pink' ? 'text-pink-600' : 'text-blue-600'}`} />
                        </div>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm mb-3 opacity-80">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            by {item.author}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">{item.targetDate || 'Ongoing'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Family Wish Lists</h2>
                <p className="text-gray-600">Track gifts and purchases for special occasions</p>
              </div>

              {/* Add Wishlist Item */}
              <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                    <Gift className="h-5 w-5 text-red-600 mr-2" />
                    Add a Wish List Item
                  </h3>
                  <div className="grid md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Item name"
                      value={newItemInputs['new-wishlist'] || ''}
                      onChange={(e) => handleInputChange('new-wishlist', e.target.value)}
                    />
                    <Input
                      placeholder="For whom?"
                      value={newItemInputs['wishlist-person'] || ''}
                      onChange={(e) => handleInputChange('wishlist-person', e.target.value)}
                    />
                    <Input
                      placeholder="Occasion"
                      value={newItemInputs['wishlist-occasion'] || ''}
                      onChange={(e) => handleInputChange('wishlist-occasion', e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (newItemInputs['new-wishlist']?.trim() && 
                            newItemInputs['wishlist-person']?.trim() && 
                            newItemInputs['wishlist-occasion']?.trim()) {
                          createWishlistMutation.mutate({
                            item: newItemInputs['new-wishlist'].trim(),
                            person: newItemInputs['wishlist-person'].trim(),
                            occasion: newItemInputs['wishlist-occasion'].trim(),
                            store: 'Amazon',
                            price: '$0'
                          });
                        }
                      }}
                      disabled={!newItemInputs['new-wishlist']?.trim() || 
                               !newItemInputs['wishlist-person']?.trim() || 
                               !newItemInputs['wishlist-occasion']?.trim() || 
                               createWishlistMutation.isPending}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {loadingWishlist ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                </div>
              ) : wishlistItems.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No wishlist items yet</p>
                    <p className="text-sm text-gray-400">Add your first wishlist item above</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                              <Gift className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 text-lg">{item.item}</h3>
                              <p className="text-sm text-gray-600 mb-1">
                                for {item.person} • {item.occasion}
                              </p>
                              <div className="flex items-center space-x-3">
                                <Badge variant="secondary">{item.store || 'Store TBD'}</Badge>
                                <span className="font-semibold text-green-600">
                                  {item.price || 'Price TBD'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                              View
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Card>
        </Tabs>

        {/* AI Chat Component */}
        <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-gray-600 bg-white/50">
        <p className="text-sm">&copy; 2024 FamilyMind AI. Bringing families closer through intelligent organization.</p>
      </footer>
    </div>
  );
}
