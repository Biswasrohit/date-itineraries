# Rani's Journal 💕

**Tagline:** "Our adventures, one date at a time"

A romantic, personal application for creating and tracking date itineraries. Plan your perfect dates with detailed timelines, track memories, celebrate anniversaries, and share love notes with your partner.

![Made with React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)

---

## ✨ Features

### 📅 **Itinerary Management**
- Create detailed date itineraries with activities, locations, and timelines
- Visual timeline view with time slots and activity cards
- Drag-and-drop reordering of activities (coming soon)
- Mark activities as completed during your date
- Track budget estimates and actual spending

### ⏰ **Countdown Timer**
- Live countdown to your next upcoming date
- Days and hours display on the dashboard
- Automatic updates every second

### 🗺️ **Location Tracking**
- Key locations summary for quick reference
- Detailed location information per activity
- Multi-stop support (e.g., shopping routes)
- Google Maps integration

### 📸 **Memories**
- Upload photos from completed dates
- Gallery view of all your memories
- Reflections and favorite moments

### 🎉 **Anniversaries**
- Track important milestones and anniversaries
- Countdown to upcoming celebrations
- Recurring anniversary support

### 💌 **Love Notes**
- Send and receive romantic messages
- Chat-style interface
- Personalized with sender names
- Real-time message sync

### 🔗 **Sharing**
- Share itineraries via link
- Native share on mobile (iMessage, WhatsApp, etc.)
- Copy to clipboard fallback

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 19 + Vite |
| **Styling** | Tailwind CSS v4 (custom romantic theme) |
| **Backend** | Firebase (Auth + Firestore + Storage) |
| **Routing** | React Router DOM |
| **State** | Context API + Firebase real-time sync |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Date Utils** | date-fns |

---

## 📁 Project Structure

```
date-itineraries/
├── src/
│   ├── components/
│   │   ├── common/               # Reusable UI components
│   │   ├── itinerary/
│   │   │   ├── ActivityCard.jsx  # Timeline activity display
│   │   │   ├── ActivityForm.jsx  # Add/Edit activity modal
│   │   │   └── ItineraryCard.jsx # List view card
│   │   ├── features/
│   │   │   ├── Countdown.jsx     # Live countdown timer
│   │   │   └── StatusBadge.jsx   # Status indicators
│   │   └── layout/
│   │       └── Navbar.jsx        # Navigation bar
│   ├── pages/
│   │   ├── Home.jsx              # Dashboard with countdown
│   │   ├── Itineraries.jsx       # List all itineraries
│   │   ├── ItineraryDetail.jsx   # View/edit single itinerary
│   │   ├── CreateItinerary.jsx   # Create new itinerary
│   │   ├── EditItinerary.jsx     # Edit entire itinerary
│   │   ├── Memories.jsx          # Photo gallery
│   │   ├── Anniversaries.jsx     # Track milestones
│   │   └── LoveNotesPage.jsx     # Love notes messaging
│   ├── context/
│   │   └── ItineraryContext.jsx  # CRUD operations for itineraries
│   ├── services/
│   │   └── firebase.js           # Firebase config & initialization
│   ├── hooks/
│   │   └── useCountdown.js       # Countdown timer logic
│   ├── utils/
│   │   └── dateUtils.js          # Date formatting utilities
│   ├── App.jsx                   # Main app with routes
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Custom theme & styles
├── public/
├── .env                          # Firebase config (not in repo)
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd date-itineraries
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Enable Storage (for photo uploads)
   - Copy your Firebase config

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

---

## 💻 Usage

### Creating Your First Date

1. Click **"Plan a New Date"** from the dashboard or itineraries page
2. Fill in basic information:
   - Date title (e.g., "NYC Shopping & Games Day")
   - Date
   - Optional description
3. Add key locations for quick reference
4. Add activities with:
   - Start/end times
   - Activity type (shopping, dining, cafe, activity, travel, arrival, surprise)
   - Location details
   - Notes and tips
   - Budget estimates
5. Add total budget summary
6. Click **"Create Date"**

### During Your Date

1. Open the itinerary detail page
2. Check off activities as you complete them ✓
3. View the timeline to see what's next
4. Access location details and maps links
5. Add activities on the fly with the **"Add Activity"** button

### After Your Date

1. Mark the entire date as completed
2. Upload photos to create a memory gallery (coming soon)
3. Add reflections and favorite moments (coming soon)

### Sharing Your Date

1. Open any itinerary detail page
2. Click the **Share** button
3. On mobile: Choose to share via iMessage, WhatsApp, or other apps
4. On desktop: Link is copied to clipboard automatically

---

## 🎨 Design System

### Color Palette

**Romantic Rose Tones:**
- Primary: Rose 500 (#f43f5e)
- Accents: Blush (#F8EDEE), Cream (#FDF8F5), Sand (#F5F1EA)
- Gold Accent: (#D4AF37) for completed states

**Activity Type Colors:**
- 🛍️ Shopping: Pink (#ec4899)
- 🍽️ Dining: Orange (#f97316)
- ☕ Cafe: Lime (#84cc16)
- 🎮 Activity: Blue (#3b82f6)
- 🚇 Travel: Purple (#8b5cf6)
- ✈️ Arrival: Cyan (#06b6d4)
- 🎁 Surprise: Rose (#f43f5e)

### Typography
- **Display:** Playfair Display (headers, titles)
- **Body:** Inter (content, UI text)
- **Script:** Dancing Script (special accents)

### Visual Elements
- Soft shadows with rose tint
- Rounded corners (1.25rem default)
- Timeline with gradient line and dots
- Smooth Framer Motion animations
- Responsive design for mobile and desktop

---

## 📊 Data Models

### Itinerary
```javascript
{
  id: string,
  title: string,                    // "NYC Shopping & Games Day"
  date: timestamp,                  // Date of the itinerary
  status: "upcoming" | "completed",
  description: string,

  keyLocations: [
    {
      name: string,                 // "H&M"
      address: string,              // "589 5th Ave"
      shortNote: string             // "at 48th St"
    }
  ],

  activities: [
    {
      id: string,
      startTime: "HH:MM",
      endTime: "HH:MM",
      title: string,
      type: string,                 // shopping, dining, cafe, etc.
      location: {
        name: string,
        address: string,
        crossStreet: string,
        neighborhood: string,
        mapsUrl: string,
        stops: array | null
      },
      notes: string,
      tips: string,
      budget: {
        estimated: number | null,
        actual: number | null,
        note: string
      },
      completed: boolean,
      order: number
    }
  ],

  budget: {
    estimated: {
      total: number,
      breakdown: string
    },
    actual: {
      total: number | null,
      breakdown: string | null
    }
  },

  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Anniversary
```javascript
{
  id: string,
  title: string,
  date: timestamp,
  recurring: boolean,
  description: string,
  createdAt: timestamp
}
```

### Love Note
```javascript
{
  id: string,
  fromName: string,
  message: string,
  createdAt: timestamp
}
```

---

## 🔮 Future Enhancements

- [ ] **Authentication**: User accounts and partner linking
- [ ] **Photo Upload**: Firebase Storage integration for memories
- [ ] **Drag & Drop**: Reorder activities with @dnd-kit
- [ ] **Weather Integration**: Show weather for date day
- [ ] **Notification System**: Reminders for upcoming dates
- [ ] **Export/Print**: Beautiful PDF exports of itineraries
- [ ] **Budget Tracking**: Detailed expense tracking and analytics
- [ ] **Map View**: Interactive map showing all locations
- [ ] **Templates**: Save favorite dates as reusable templates
- [ ] **Collaboration**: Real-time collaborative editing
- [ ] **Mobile App**: React Native version

---

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Build
npm run build        # Production build

# Preview
npm run preview      # Preview production build locally

# Lint
npm run lint         # Run ESLint
```

---

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own romantic adventures!

---

## 📄 License

MIT License - Feel free to use this for your own relationship!

---

## 💖 Acknowledgments

Built with love for Rani. Every feature is designed to make planning our adventures together easier and more memorable.

---

**Made with ❤️ by [Your Name]**
