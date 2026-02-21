import { useState, useCallback, useRef } from "react";

export interface VoiceCommandResult {
  type: "navigate" | "grocery-add" | "unknown";
  tab?: string;
  item?: string;
  store?: string;
  transcript: string;
}

const TAB_ALIASES: Record<string, string> = {
  home: "dashboard",
  dashboard: "dashboard",
  grocery: "grocery",
  groceries: "grocery",
  shopping: "grocery",
  calendar: "calendar",
  schedule: "calendar",
  events: "calendar",
  ideas: "ideas",
  vision: "vision",
  goals: "vision",
  wishlist: "wishlist",
  wishes: "wishlist",
  gifts: "wishlist",
  recipes: "recipes",
  recipe: "recipes",
  cooking: "recipes",
  food: "recipes",
};

export function parseCommand(
  transcript: string,
  groceryLists: Array<{ id: string; store: string }>,
): VoiceCommandResult {
  const text = transcript.toLowerCase().trim();

  // Tab navigation: "go to grocery", "open calendar", "show recipes"
  const navMatch = text.match(
    /(?:go\s+to|open|show|switch\s+to|navigate\s+to)\s+(.+)/,
  );
  if (navMatch) {
    const target = navMatch[1].trim();
    const tab = TAB_ALIASES[target];
    if (tab) return { type: "navigate", tab, transcript };
  }

  // Direct tab name as standalone command: "grocery", "calendar"
  if (TAB_ALIASES[text]) {
    return { type: "navigate", tab: TAB_ALIASES[text], transcript };
  }

  // Grocery add: "add milk to costco list", "add eggs to walmart"
  const groceryMatch = text.match(/add\s+(.+?)\s+to\s+(.+?)(?:\s+list)?$/);
  if (groceryMatch) {
    const item = groceryMatch[1].trim();
    const storeQuery = groceryMatch[2].trim().replace(/\s+list$/, "");
    const matchedList = groceryLists.find((l) =>
      l.store.toLowerCase().includes(storeQuery),
    );
    if (matchedList) {
      return {
        type: "grocery-add",
        item,
        store: matchedList.store,
        transcript,
      };
    }
  }

  return { type: "unknown", transcript };
}

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    : null;

export const isVoiceSupported = !!SpeechRecognitionAPI;

export function useVoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(
    (
      onResult: (result: VoiceCommandResult) => void,
      groceryLists: Array<{ id: string; store: string }>,
    ) => {
      if (!SpeechRecognitionAPI || isListening) return;

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const result = parseCommand(transcript, groceryLists);
        onResult(result);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    },
    [isListening],
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return { isListening, startListening, stopListening, isSupported: isVoiceSupported };
}
