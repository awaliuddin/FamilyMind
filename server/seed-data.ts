import { storage } from "./storage";

// Import everything needed for seeding

export async function seedSampleData(userId: string) {
  console.log("Seeding sample data for user:", userId);

  // Get user and ensure they have a family
  const user = await storage.getUser(userId);
  let familyId = user?.familyId;
  
  if (!familyId) {
    // Create a family for the user
    const inviteCode = storage.generateInviteCode();
    const family = await storage.createFamily({
      name: "My Family",
      inviteCode,
      ownerId: userId
    });
    
    await storage.joinFamily(userId, family.id);
    familyId = family.id;
  }

  // Check if family already has data
  const existingMembers = await storage.getFamilyMembers(familyId);
  if (existingMembers.length > 0) {
    console.log("Family already has sample data");
    return;
  }

  // Create grocery lists using storage interface
  const walmartList = await storage.createGroceryList({
    familyId,
    store: "Walmart",
    storeTip: "Good prices for frozen foods and bulk items"
  });

  const costcoList = await storage.createGroceryList({
    familyId,
    store: "Costco",
    storeTip: "Bulk buys for supplements and staples like paper towels"
  });

  const marianosList = await storage.createGroceryList({
    familyId,
    store: "Marianos",
    storeTip: "Best for fresh produce and premade meals"
  });

  // Add grocery items using storage interface
  const groceryItems = [
    { listId: walmartList.id, name: "Frozen vegetables", completed: false },
    { listId: walmartList.id, name: "Ice cream", completed: false },
    { listId: walmartList.id, name: "Bread", completed: true },
    { listId: costcoList.id, name: "Paper towels (bulk)", completed: false },
    { listId: costcoList.id, name: "Vitamins", completed: false },
    { listId: costcoList.id, name: "Protein powder", completed: false },
    { listId: marianosList.id, name: "Fresh strawberries", completed: false },
    { listId: marianosList.id, name: "Salad mix", completed: true },
    { listId: marianosList.id, name: "Rotisserie chicken", completed: false }
  ];

  for (const item of groceryItems) {
    await storage.addGroceryItem(item);
  }

  // Create calendar events
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  // Create calendar events using storage interface
  const calendarEventsData = [
    {
      familyId,
      title: "Mom - Work Meeting",
      description: "Quarterly review with team",
      startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
      eventType: "work" as const,
      attendees: ["Mom"],
      location: "Office"
    },
    {
      familyId,
      title: "Church Service",
      description: "Sunday morning service",
      startTime: new Date(today.setHours(10, 0, 0, 0)),
      endTime: new Date(today.setHours(11, 30, 0, 0)),
      eventType: "family" as const,
      attendees: ["Family"],
      location: "St. Mary's Church"
    },
    {
      familyId,
      title: "Sarah - Soccer Practice",
      description: "Weekly soccer practice",
      startTime: new Date(tomorrow.setHours(18, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(19, 30, 0, 0)),
      eventType: "sports" as const,
      attendees: ["Sarah"],
      location: "Community Park"
    },
    {
      familyId,
      title: "Asif - Client Call",
      description: "Project review call",
      startTime: new Date(dayAfter.setHours(14, 0, 0, 0)),
      endTime: new Date(dayAfter.setHours(15, 0, 0, 0)),
      eventType: "work" as const,
      attendees: ["Asif"],
      location: "Home Office"
    },
    {
      familyId,
      title: "Volunteering at Food Bank",
      description: "Monthly family volunteer activity",
      startTime: new Date(dayAfter.setHours(11, 0, 0, 0)),
      endTime: new Date(dayAfter.setHours(13, 0, 0, 0)),
      eventType: "volunteer" as const,
      attendees: ["Family"],
      location: "Downtown Food Bank"
    }
  ];

  for (const eventData of calendarEventsData) {
    await storage.createCalendarEvent(eventData);
  }

  // Create family ideas using storage interface
  const familyIdeasData = [
    {
      familyId,
      title: "Family camping trip to Starved Rock",
      description: "Weekend camping with hiking and s'mores",
      author: "Asif",
      likes: 3,
      tags: ["outdoor", "weekend", "adventure"]
    },
    {
      familyId,
      title: "Visit the Chicago Zoo",
      description: "Educational family day out",
      author: "Sarah",
      likes: 2,
      tags: ["educational", "animals", "day-trip"]
    },
    {
      familyId,
      title: "Family game night every Friday",
      description: "Weekly board game and pizza night",
      author: "Mom",
      likes: 4,
      tags: ["weekly", "games", "family-time"]
    },
    {
      familyId,
      title: "Learn to cook pizza together",
      description: "Make homemade pizza from scratch",
      author: "Tommy",
      likes: 1,
      tags: ["cooking", "learning", "food"]
    }
  ];

  for (const ideaData of familyIdeasData) {
    await storage.createFamilyIdea(ideaData);
  }

  // Create vision items using storage interface
  const visionItemsData = [
    {
      familyId,
      title: "Travel to Europe as a family",
      description: "Visit Italy, France, and Spain together",
      author: "Mom",
      color: "pink",
      targetDate: "2025",
      progress: 25
    },
    {
      familyId,
      title: "Build a treehouse in backyard",
      description: "A special place for kids to play and read",
      author: "Kids",
      color: "green",
      targetDate: "Summer 2024",
      progress: 10
    },
    {
      familyId,
      title: "Start a family garden",
      description: "Grow vegetables and herbs together",
      author: "Asif",
      color: "blue",
      targetDate: "Spring 2024",
      progress: 40
    },
    {
      familyId,
      title: "Learn Spanish together",
      description: "Family language learning adventure",
      author: "Sarah",
      color: "yellow",
      targetDate: "Ongoing",
      progress: 60
    }
  ];

  for (const visionData of visionItemsData) {
    await storage.createVisionItem(visionData);
  }

  // Create wish list items using storage interface
  const wishListItemsData = [
    {
      familyId,
      item: "Nintendo Switch OLED",
      description: "Latest gaming console",
      store: "Amazon",
      price: "$349",
      person: "Tommy",
      occasion: "Christmas",
      priority: 3
    },
    {
      familyId,
      item: "Stand Mixer",
      description: "KitchenAid professional mixer",
      store: "Target",
      price: "$199",
      person: "Mom",
      occasion: "Birthday",
      priority: 2
    },
    {
      familyId,
      item: "Wireless Headphones",
      description: "Noise-canceling headphones for studying",
      store: "Best Buy",
      price: "$129",
      person: "Sarah",
      occasion: "Birthday",
      priority: 2
    },
    {
      familyId,
      item: "Coffee Machine",
      description: "Automatic espresso maker",
      store: "Amazon",
      price: "$89",
      person: "Asif",
      occasion: "Christmas",
      priority: 1
    }
  ];

  for (const wishListData of wishListItemsData) {
    await storage.createWishListItem(wishListData);
  }

  // Create sample family members
  const familyMembersData = [
    {
      familyId,
      name: "Mom",
      role: "Parent",
      color: "pink",
      birthday: "1985-03-15",
      interests: ["cooking", "reading", "gardening"]
    },
    {
      familyId,
      name: "Asif",
      role: "Parent",
      color: "blue",
      birthday: "1983-07-22",
      interests: ["technology", "hiking", "photography"]
    },
    {
      familyId,
      name: "Sarah",
      role: "Teen",
      color: "purple",
      birthday: "2008-11-10",
      interests: ["soccer", "music", "art"]
    },
    {
      familyId,
      name: "Tommy",
      role: "Kid",
      color: "green",
      birthday: "2012-05-03",
      interests: ["video games", "legos", "dinosaurs"]
    }
  ];

  for (const memberData of familyMembersData) {
    await storage.createFamilyMember(memberData);
  }

  console.log("Sample data seeded successfully with family structure!");
}