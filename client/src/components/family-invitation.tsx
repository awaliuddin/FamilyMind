import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Copy, Users, UserPlus, Share } from "lucide-react";

interface FamilyInvitationProps {
  user: any;
}

export function FamilyInvitation({ user }: FamilyInvitationProps) {
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showJoinFamily, setShowJoinFamily] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [generatedInviteCode, setGeneratedInviteCode] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFamilyMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/family/create", { name });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setGeneratedInviteCode(data.inviteCode);
      setFamilyName("");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Family Created!",
        description: "Your family has been created successfully. Share the invite code with family members.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create family. Please try again.",
        variant: "destructive",
      });
    },
  });

  const joinFamilyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/family/join", { inviteCode: code });
      return await response.json();
    },
    onSuccess: () => {
      setInviteCode("");
      setShowJoinFamily(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to the family!",
        description: "You've successfully joined the family.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join family. Please check the invite code.",
        variant: "destructive",
      });
    },
  });

  const copyInviteCode = () => {
    navigator.clipboard.writeText(generatedInviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard.",
    });
  };

  // If user already has a family, don't show this component
  if (user?.familyId) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="h-6 w-6" />
            Welcome to FamilyMind!
          </CardTitle>
          <CardDescription>
            To get started, create a new family or join an existing one using an invite code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => setShowCreateFamily(true)}
              className="h-24 flex flex-col gap-2"
              variant="outline"
            >
              <UserPlus className="h-8 w-8" />
              <span>Create New Family</span>
            </Button>
            <Button 
              onClick={() => setShowJoinFamily(true)}
              className="h-24 flex flex-col gap-2"
              variant="outline"
            >
              <Share className="h-8 w-8" />
              <span>Join Existing Family</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Family Dialog */}
      <Dialog open={showCreateFamily} onOpenChange={setShowCreateFamily}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Family</DialogTitle>
            <DialogDescription>
              Give your family a name and we'll generate an invite code to share with members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="The Smith Family"
              />
            </div>
            <Button 
              onClick={() => createFamilyMutation.mutate(familyName || "My Family")}
              disabled={createFamilyMutation.isPending}
              className="w-full"
            >
              {createFamilyMutation.isPending ? "Creating..." : "Create Family"}
            </Button>
            
            {generatedInviteCode && (
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Family Created Successfully!
                    </p>
                    <div className="text-center">
                      <Label className="text-sm">Share this invite code:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          value={generatedInviteCode} 
                          readOnly 
                          className="text-center font-mono text-lg font-bold"
                        />
                        <Button 
                          size="sm" 
                          onClick={copyInviteCode}
                          variant="outline"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Family Dialog */}
      <Dialog open={showJoinFamily} onOpenChange={setShowJoinFamily}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Existing Family</DialogTitle>
            <DialogDescription>
              Enter the invite code shared by your family member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF"
                className="text-center font-mono text-lg"
              />
            </div>
            <Button 
              onClick={() => joinFamilyMutation.mutate(inviteCode)}
              disabled={!inviteCode || joinFamilyMutation.isPending}
              className="w-full"
            >
              {joinFamilyMutation.isPending ? "Joining..." : "Join Family"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}