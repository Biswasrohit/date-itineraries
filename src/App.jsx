import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ItineraryProvider } from './context/ItineraryContext';
import Navbar from './components/layout/Navbar';

// Pages
import Home from './pages/Home';
import Itineraries from './pages/Itineraries';
import ItineraryDetail from './pages/ItineraryDetail';
import CreateItinerary from './pages/CreateItinerary';
import EditItinerary from './pages/EditItinerary';
import Memories from './pages/Memories';
import Anniversaries from './pages/Anniversaries';
import LoveNotesPage from './pages/LoveNotesPage';

// Layout Component
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

function App() {
  return (
    <Router>
      <ItineraryProvider>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/itineraries" element={<Layout><Itineraries /></Layout>} />
          <Route path="/itineraries/new" element={<Layout><CreateItinerary /></Layout>} />
          <Route path="/itineraries/:id/edit" element={<Layout><EditItinerary /></Layout>} />
          <Route path="/itineraries/:id" element={<Layout><ItineraryDetail /></Layout>} />
          <Route path="/memories" element={<Layout><Memories /></Layout>} />
          <Route path="/anniversaries" element={<Layout><Anniversaries /></Layout>} />
          <Route path="/notes" element={<Layout><LoveNotesPage /></Layout>} />
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ItineraryProvider>
    </Router>
  );
}

export default App;
