import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Copy, Users, Share2, Mail, MessageSquare, Phone } from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  color?: string;
}

interface Family {
  id: string;
  name: string;
  inviteCode: string;
}

interface User {
  familyId?: string;
}

interface FamilyManagementProps {
  user: User;
}

export function FamilyManagement({ user }: FamilyManagementProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: family } = useQuery<Family>({
    queryKey: ['/api/family'],
    enabled: !!user?.familyId,
  });

  const { data: familyMembers = [] } = useQuery<FamilyMember[]>({
    queryKey: ['/api/family-members'],
    enabled: !!user?.familyId,
  });

  const copyInviteCode = () => {
    if (family?.inviteCode) {
      navigator.clipboard.writeText(family.inviteCode);
      toast({ 
        title: "Copied!", 
        description: "Invite code copied to clipboard." 
      });
    }
  };

  const shareViaEmail = () => {
    const subject = `Join our ${family?.name || 'family'} on FamilyMind!`;
    const body = `Hi there!

I'd like to invite you to join our family on FamilyMind, our AI-powered family coordination app.

To join our family, follow these steps:
1. Go to the FamilyMind app
2. Click "Join Existing Family"
3. Enter this invite code: ${family?.inviteCode}

FamilyMind helps us coordinate groceries, calendar events, family ideas, and more with AI assistance.

Looking forward to having you join us!`;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const shareViaSMS = () => {
    const message = `Join our ${family?.name || 'family'} on FamilyMind! Use invite code: ${family?.inviteCode}`;
    const smsLink = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsLink);
  };

  const shareViaMessaging = () => {
    const message = `Join our ${family?.name || 'family'} on FamilyMind with invite code: ${family?.inviteCode}`;
    navigator.clipboard.writeText(message);
    toast({ 
      title: "Message copied!", 
      description: "Message copied to clipboard - paste in any messaging app." 
    });
  };

  if (!user?.familyId || !family) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-green-800">{family.name}</CardTitle>
              <CardDescription className="text-green-600">
                {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-green-700 border-green-300 hover:bg-green-50">
                <Share2 className="h-4 w-4 mr-2" />
                Invite Family
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Family Members</DialogTitle>
                <DialogDescription>
                  Share your family's invite code to let others join
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="text-center">
                  <Label className="text-sm font-medium">Family Invite Code</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={family.inviteCode} 
                      readOnly 
                      className="text-center font-mono text-lg font-bold bg-gray-50"
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

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-3 block">Share via:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={shareViaEmail}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={shareViaSMS}
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      SMS
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={shareViaMessaging}
                      className="flex items-center gap-2 col-span-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Copy for Messaging Apps
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="text-blue-800">
                    <strong>Instructions for new members:</strong>
                  </p>
                  <ol className="text-blue-700 mt-1 space-y-1 list-decimal list-inside">
                    <li>Open the FamilyMind app</li>
                    <li>Click "Join Existing Family"</li>
                    <li>Enter the invite code: <strong>{family.inviteCode}</strong></li>
                  </ol>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div>
            <Label className="text-sm text-green-700">Family Members</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {familyMembers.map((member) => (
                <div 
                  key={member.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white border border-green-200"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: member.color || '#10b981' }}
                  />
                  {member.name}
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2 border-t border-green-200">
            <p className="text-sm text-green-600">
              Share your invite code <strong>{family.inviteCode}</strong> to add more family members
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}