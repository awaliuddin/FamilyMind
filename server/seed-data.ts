import { db } from "./db";
import { 
  groceryLists, 
  groceryItems, 
  calendarEvents, 
  familyIdeas, 
  visionItems, 
  wishListItems 
} from "@shared/schema";

export async function seedSampleData(userId: string) {
  console.log("Seeding sample data for user:", userId);

  // Create grocery lists
  const walmartList = await db.insert(groceryLists).values({
    userId,
    store: "Walmart",
    storeTip: "Good prices for frozen foods and bulk items"
  }).returning();

  const costcoList = await db.insert(groceryLists).values({
    userId,
    store: "Costco",
    storeTip: "Bulk buys for supplements and staples like paper towels"
  }).returning();

  const marianosList = await db.insert(groceryLists).values({
    userId,
    store: "Marianos",
    storeTip: "Best for fresh produce and premade meals"
  }).returning();

  // Add grocery items
  await db.insert(groceryItems).values([
    { listId: walmartList[0].id, name: "Frozen vegetables", completed: false },
    { listId: walmartList[0].id, name: "Ice cream", completed: false },
    { listId: walmartList[0].id, name: "Bread", completed: true },
    { listId: costcoList[0].id, name: "Paper towels (bulk)", completed: false },
    { listId: costcoList[0].id, name: "Vitamins", completed: false },
    { listId: costcoList[0].id, name: "Protein powder", completed: false },
    { listId: marianosList[0].id, name: "Fresh strawberries", completed: false },
    { listId: marianosList[0].id, name: "Salad mix", completed: true },
    { listId: marianosList[0].id, name: "Rotisserie chicken", completed: false }
  ]);

  // Create calendar events
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  await db.insert(calendarEvents).values([
    {
      userId,
      title: "Mom - Work Meeting",
      description: "Quarterly review with team",
      startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
      eventType: "work",
      attendees: ["Mom"],
      location: "Office"
    },
    {
      userId,
      title: "Church Service",
      description: "Sunday morning service",
      startTime: new Date(today.setHours(10, 0, 0, 0)),
      endTime: new Date(today.setHours(11, 30, 0, 0)),
      eventType: "family",
      attendees: ["Family"],
      location: "St. Mary's Church"
    },
    {
      userId,
      title: "Sarah - Soccer Practice",
      description: "Weekly soccer practice",
      startTime: new Date(tomorrow.setHours(18, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(19, 30, 0, 0)),
      eventType: "sports",
      attendees: ["Sarah"],
      location: "Community Park"
    },
    {
      userId,
      title: "Asif - Client Call",
      description: "Project review call",
      startTime: new Date(dayAfter.setHours(14, 0, 0, 0)),
      endTime: new Date(dayAfter.setHours(15, 0, 0, 0)),
      eventType: "work",
      attendees: ["Asif"],
      location: "Home Office"
    },
    {
      userId,
      title: "Volunteering at Food Bank",
      description: "Monthly family volunteer activity",
      startTime: new Date(dayAfter.setHours(11, 0, 0, 0)),
      endTime: new Date(dayAfter.setHours(13, 0, 0, 0)),
      eventType: "volunteer",
      attendees: ["Family"],
      location: "Downtown Food Bank"
    }
  ]);

  // Create family ideas
  await db.insert(familyIdeas).values([
    {
      userId,
      title: "Family camping trip to Starved Rock",
      description: "Weekend camping with hiking and s'mores",
      author: "Asif",
      likes: 3,
      tags: ["outdoor", "weekend", "adventure"]
    },
    {
      userId,
      title: "Visit the Chicago Zoo",
      description: "Educational family day out",
      author: "Sarah",
      likes: 2,
      tags: ["educational", "animals", "day-trip"]
    },
    {
      userId,
      title: "Family game night every Friday",
      description: "Weekly board game and pizza night",
      author: "Mom",
      likes: 4,
      tags: ["weekly", "games", "family-time"]
    },
    {
      userId,
      title: "Learn to cook pizza together",
      description: "Make homemade pizza from scratch",
      author: "Tommy",
      likes: 1,
      tags: ["cooking", "learning", "food"]
    }
  ]);

  // Create vision items
  await db.insert(visionItems).values([
    {
      userId,
      title: "Travel to Europe as a family",
      description: "Visit Italy, France, and Spain together",
      author: "Mom",
      color: "pink",
      targetDate: "2025",
      progress: 25
    },
    {
      userId,
      title: "Build a treehouse in backyard",
      description: "A special place for kids to play and read",
      author: "Kids",
      color: "green",
      targetDate: "Summer 2024",
      progress: 10
    },
    {
      userId,
      title: "Start a family garden",
      description: "Grow vegetables and herbs together",
      author: "Asif",
      color: "blue",
      targetDate: "Spring 2024",
      progress: 40
    },
    {
      userId,
      title: "Learn Spanish together",
      description: "Family language learning adventure",
      author: "Sarah",
      color: "yellow",
      targetDate: "Ongoing",
      progress: 60
    }
  ]);

  // Create wish list items
  await db.insert(wishListItems).values([
    {
      userId,
      item: "Nintendo Switch OLED",
      description: "Latest gaming console",
      store: "Amazon",
      price: "$349",
      person: "Tommy",
      occasion: "Christmas",
      priority: 3
    },
    {
      userId,
      item: "Stand Mixer",
      description: "KitchenAid professional mixer",
      store: "Target",
      price: "$199",
      person: "Mom",
      occasion: "Birthday",
      priority: 2
    },
    {
      userId,
      item: "Wireless Headphones",
      description: "Noise-canceling headphones for studying",
      store: "Best Buy",
      price: "$129",
      person: "Sarah",
      occasion: "Birthday",
      priority: 2
    },
    {
      userId,
      item: "Coffee Machine",
      description: "Automatic espresso maker",
      store: "Amazon",
      price: "$89",
      person: "Asif",
      occasion: "Christmas",
      priority: 1
    }
  ]);

  console.log("Sample data seeded successfully!");
}