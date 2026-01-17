// Sample itinerary based on the January 19th date
export const sampleItinerary = {
  title: "NYC Shopping & Games Day",
  date: new Date("2026-01-19"),
  status: "upcoming",
  description: "A full day of shopping, board games, dinner, and cozy chai time in NYC",

  keyLocations: [
    { name: "H&M", address: "589 5th Ave", shortNote: "at 48th St" },
    { name: "Uniqlo", address: "666 5th Ave", shortNote: "at 53rd St - World's largest!" },
    { name: "Abercrombie", address: "668 5th Ave", shortNote: "at 56th St" },
    { name: "Hex & Co West", address: "2911 Broadway", shortNote: "Upper West Side" },
    { name: "Leyla", address: "108 W 74th St", shortNote: "Upper West Side" },
    { name: "The Chai Spot", address: "156 Mott St", shortNote: "Little Italy/SoHo" }
  ],

  activities: [
    {
      id: "act-1",
      startTime: "11:00",
      endTime: "11:30",
      title: "Arrive at Penn Station",
      type: "arrival",
      location: {
        name: "Penn Station",
        address: "Penn Station",
        crossStreet: "",
        neighborhood: "Midtown",
        mapsUrl: null,
        stops: null
      },
      notes: "Take subway to start shopping",
      tips: "",
      budget: { estimated: null, actual: null, note: "" },
      completed: false,
      order: 0
    },
    {
      id: "act-2",
      startTime: "11:30",
      endTime: "14:30",
      title: "Shopping on 5th Avenue",
      type: "shopping",
      location: {
        name: "H&M, Uniqlo, Abercrombie",
        address: "589 5th Ave",
        crossStreet: "at 48th St",
        neighborhood: "Midtown",
        mapsUrl: "https://maps.google.com/?q=589+5th+Ave+New+York",
        stops: [
          { name: "H&M", address: "589 5th Ave", note: "Start here" },
          { name: "Uniqlo", address: "666 5th Ave", note: "5 blocks north, ~5 min walk. Massive! 89,000 sq ft, 3 floors, 100 dressing rooms" },
          { name: "Abercrombie", address: "668 5th Ave", note: "Literally next door to Uniqlo" }
        ]
      },
      notes: "All three stores within a 10-block stretch on 5th Ave",
      tips: "Budget extra time at Uniqlo - it's huge!",
      budget: { estimated: null, actual: null, note: "Variable (her budget)" },
      completed: false,
      order: 1
    },
    {
      id: "act-3",
      startTime: "14:45",
      endTime: "15:00",
      title: "Travel to Upper West Side",
      type: "travel",
      location: {
        name: "Subway",
        address: "5th Ave/53rd St Station",
        crossStreet: "",
        neighborhood: "",
        mapsUrl: null,
        stops: null
      },
      notes: "Take E/M train from 5th Ave/53rd St to 72nd St",
      tips: "Or walk to 7th Ave and take 1/2/3 train to 72nd St",
      budget: { estimated: null, actual: null, note: "" },
      completed: false,
      order: 2
    },
    {
      id: "act-4",
      startTime: "15:00",
      endTime: "17:30",
      title: "Hex & Co West (Board Games)",
      type: "activity",
      location: {
        name: "Hex & Co West",
        address: "2911 Broadway",
        crossStreet: "near 114th St",
        neighborhood: "Upper West Side",
        mapsUrl: "https://maps.google.com/?q=2911+Broadway+New+York",
        stops: null
      },
      notes: "$15pp for unlimited board games. Get coffee, snacks, relax after shopping. Play some games, chill out.",
      tips: "",
      budget: { estimated: 50, actual: null, note: "~$40-50" },
      completed: false,
      order: 3
    },
    {
      id: "act-5",
      startTime: "17:45",
      endTime: "18:00",
      title: "Walk to Leyla",
      type: "travel",
      location: {
        name: "Walking",
        address: "",
        crossStreet: "",
        neighborhood: "Upper West Side",
        mapsUrl: null,
        stops: null
      },
      notes: "~15 min walk south on Broadway/Amsterdam",
      tips: "Or quick subway ride (1 train: 116th St to 72nd St)",
      budget: { estimated: null, actual: null, note: "" },
      completed: false,
      order: 4
    },
    {
      id: "act-6",
      startTime: "18:00",
      endTime: "20:00",
      title: "Dinner at Leyla",
      type: "dining",
      location: {
        name: "Leyla",
        address: "108 W 74th St",
        crossStreet: "",
        neighborhood: "Upper West Side",
        mapsUrl: "https://maps.google.com/?q=108+W+74th+St+New+York",
        stops: null
      },
      notes: "Make reservation for 6:00 PM",
      tips: "Mediterranean restaurant",
      budget: { estimated: 100, actual: null, note: "~$80-120" },
      completed: false,
      order: 5
    },
    {
      id: "act-7",
      startTime: "20:30",
      endTime: "21:00",
      title: "Travel to The Chai Spot",
      type: "travel",
      location: {
        name: "Subway",
        address: "72nd St Station",
        crossStreet: "",
        neighborhood: "",
        mapsUrl: null,
        stops: null
      },
      notes: "Take 1/2/3 from 72nd St to Canal St/Broadway-Lafayette, then walk ~8 min",
      tips: "OR take B/D from 72nd St to Broadway-Lafayette",
      budget: { estimated: null, actual: null, note: "" },
      completed: false,
      order: 6
    },
    {
      id: "act-8",
      startTime: "21:00",
      endTime: "22:00",
      title: "The Chai Spot (Wind Down)",
      type: "cafe",
      location: {
        name: "The Chai Spot",
        address: "156 Mott St",
        crossStreet: "",
        neighborhood: "Little Italy",
        mapsUrl: "https://maps.google.com/?q=156+Mott+St+New+York",
        stops: null
      },
      notes: "Super cozy, colorful vibes with Pakistani decor. Famous for authentic chai (Cardamom Chai, Butter Chai, Iced options). Veggie samosas available. Free WiFi, lounge seating.",
      tips: "Hours: Wed-Sun, opens at 3 PM weekdays (12 PM weekends)",
      budget: { estimated: 20, actual: null, note: "~$15-20" },
      completed: false,
      order: 7
    }
  ],

  travelSegments: [
    {
      id: "travel-1",
      fromActivity: "act-2",
      toActivity: "act-4",
      duration: "15-20 min",
      directions: "Take E/M from 5th Ave/53rd St to 72nd St",
      alternatives: "OR walk to 7th Ave, take 1/2/3 to 72nd St"
    },
    {
      id: "travel-2",
      fromActivity: "act-4",
      toActivity: "act-6",
      duration: "~15 min",
      directions: "Walk south on Broadway/Amsterdam",
      alternatives: "Or 1 train: 116th St to 72nd St"
    },
    {
      id: "travel-3",
      fromActivity: "act-6",
      toActivity: "act-8",
      duration: "25-30 min",
      directions: "1/2/3 from 72nd St to Canal St, then walk ~8 min",
      alternatives: "B/D from 72nd St to Broadway-Lafayette"
    }
  ],

  budget: {
    estimated: {
      total: 190,
      breakdown: "Hex & Co: $40-50, Leyla: $80-120, Chai Spot: $15-20 (excludes shopping)"
    },
    actual: {
      total: null,
      breakdown: null
    }
  },

  memories: {
    photos: [],
    reflection: "",
    favoriteMemory: "",
    rating: null
  }
};

export const activityTypeIcons = {
  shopping: "ShoppingBag",
  dining: "UtensilsCrossed",
  cafe: "Coffee",
  activity: "Gamepad2",
  travel: "Train",
  arrival: "MapPin",
  surprise: "Gift"
};

export const activityTypeLabels = {
  shopping: "Shopping",
  dining: "Dining",
  cafe: "Cafe",
  activity: "Activity",
  travel: "Travel",
  arrival: "Arrival",
  surprise: "Surprise"
};
