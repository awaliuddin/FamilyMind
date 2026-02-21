import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceCommands, isVoiceSupported } from "@/hooks/useVoiceCommands";
import type { VoiceCommandResult } from "@/hooks/useVoiceCommands";
import { useToast } from "@/hooks/use-toast";
import { useGroceryLists, useGroceryMutations } from "@/hooks/useGroceryLists";

interface VoiceButtonProps {
  onNavigate: (tab: string) => void;
}

export function VoiceButton({ onNavigate }: VoiceButtonProps) {
  const { isListening, startListening, stopListening } = useVoiceCommands();
  const { toast } = useToast();
  const { groceryLists } = useGroceryLists();
  const { addItem } = useGroceryMutations();

  if (!isVoiceSupported) return null;

  const handleResult = (result: VoiceCommandResult) => {
    switch (result.type) {
      case "navigate":
        onNavigate(result.tab!);
        toast({
          title: `Navigating to ${result.tab}`,
          description: `"${result.transcript}"`,
        });
        break;

      case "grocery-add":
        {
          const list = groceryLists.find(
            (l) => l.store.toLowerCase() === result.store!.toLowerCase(),
          );
          if (list) {
            addItem.mutate({ listId: list.id, name: result.item! });
            toast({
              title: `Added "${result.item}" to ${result.store}`,
              description: `"${result.transcript}"`,
            });
          }
        }
        break;

      case "unknown":
        toast({
          title: "Didn't catch that",
          description: `Heard: "${result.transcript}". Try "add milk to Costco list" or "go to calendar".`,
          variant: "destructive",
        });
        break;
    }
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      const lists = groceryLists.map((l) => ({ id: l.id, store: l.store }));
      startListening(handleResult, lists);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={isListening ? "destructive" : "outline"}
      size="sm"
      className={
        isListening
          ? "relative animate-pulse bg-red-500 hover:bg-red-600 text-white"
          : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
      }
      aria-label={isListening ? "Stop listening" : "Voice command"}
    >
      {isListening ? (
        <>
          <span className="absolute inset-0 rounded-md animate-ping bg-red-400 opacity-30" />
          <MicOff className="h-4 w-4 relative" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
