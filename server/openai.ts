import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface FamilyAssistantResponse {
  message: string;
  suggestions?: string[];
  actions?: {
    type: 'add_calendar_event' | 'add_grocery_item' | 'schedule_conflict' | 'family_suggestion';
    data: any;
  }[];
}

export async function getFamilyAssistantResponse(
  userMessage: string,
  context: {
    familyMembers?: any[];
    upcomingEvents?: any[];
    groceryLists?: any[];
    recentIdeas?: any[];
  } = {}
): Promise<FamilyAssistantResponse> {
  try {
    const systemPrompt = `You are FamilyMind, an AI-powered family assistant. You help families with:
- Scheduling and calendar management
- Grocery shopping and meal planning
- Family activity suggestions
- Conflict resolution and optimization
- Household organization

You have access to the family's:
- Family members: ${JSON.stringify(context.familyMembers || [])}
- Upcoming events: ${JSON.stringify(context.upcomingEvents || [])}
- Grocery lists: ${JSON.stringify(context.groceryLists || [])}
- Recent ideas: ${JSON.stringify(context.recentIdeas || [])}

Provide helpful, proactive suggestions that anticipate family needs. Be warm, friendly, and family-focused.
Respond with JSON in this format: { "message": "your response", "suggestions": ["suggestion1", "suggestion2"], "actions": [{"type": "action_type", "data": {}}] }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      message: result.message || "I'm here to help with your family coordination!",
      suggestions: result.suggestions || [],
      actions: result.actions || []
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      message: "I'm having trouble processing your request right now. Please try again in a moment.",
      suggestions: [],
      actions: []
    };
  }
}

export async function generateGroceryPredictions(
  consumptionHistory: any[],
  familySize: number
): Promise<{ item: string; confidence: number; reason: string }[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a grocery prediction AI. Analyze consumption patterns and predict what items the family will need soon. Return JSON with predictions."
        },
        {
          role: "user",
          content: `Family size: ${familySize}. Recent grocery history: ${JSON.stringify(consumptionHistory)}. Predict items needed in the next week.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.predictions || [];
  } catch (error) {
    console.error("Grocery prediction error:", error);
    return [];
  }
}

export async function detectScheduleConflicts(
  events: any[]
): Promise<{ conflicts: any[]; suggestions: string[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a schedule optimization AI. Detect conflicts and suggest solutions. Return JSON with conflicts and suggestions."
        },
        {
          role: "user",
          content: `Analyze these events for conflicts: ${JSON.stringify(events)}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      conflicts: result.conflicts || [],
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error("Schedule conflict detection error:", error);
    return { conflicts: [], suggestions: [] };
  }
}
