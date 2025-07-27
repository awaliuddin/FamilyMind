import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, X, Send, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ChatMessage {
  id: string;
  message: string;
  messageType: 'user' | 'ai';
  createdAt: string;
  context?: {
    suggestions?: string[];
    actions?: any[];
  };
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat-messages'],
    enabled: isOpen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', { message });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-messages'] });
      setNewMessage("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendMessageMutation.isPending) return;
    
    const message = newMessage.trim();
    setNewMessage("");
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <Card className="fixed top-4 right-4 w-96 h-[600px] z-50 shadow-2xl border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">FamilyMind AI Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[520px]">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-purple-400" />
              <p className="text-sm">
                Hi! I'm your family assistant. I can help with scheduling, grocery planning, 
                and family coordination. What would you like to know?
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.reverse().map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.messageType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.messageType === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.messageType === 'ai' && (
                        <Bot className="h-4 w-4 mt-0.5 text-purple-500" />
                      )}
                      {message.messageType === 'user' && (
                        <User className="h-4 w-4 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.message}</p>
                        {message.context?.suggestions && message.context.suggestions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.context.suggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="text-xs bg-white/20 rounded px-2 py-1"
                              >
                                💡 {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your family schedule, groceries, or ideas..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
