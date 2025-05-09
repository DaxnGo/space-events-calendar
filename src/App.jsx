import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import CalendarPage from "./pages/CalendarPage";
import EventDetail from "./pages/EventDetail";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-space-900 to-space-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-cosmos-400"
              viewBox="0 0 24 24"
              fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.83L19.17 19H4.83L12 5.83zM12 16c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
            </svg>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Space Launch
            </span>
          </Link>

          {!isHomePage && (
            <Link
              to="/"
              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-blue-100 hover:text-white bg-blue-700/50 rounded-lg hover:bg-blue-700/70 transition-colors"
              aria-label="Back to Calendar">
              <svg
                className="w-4 h-4 mr-1 md:w-5 md:h-5 md:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="hidden sm:inline">Back to Calendar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col space-bg text-white">
        <Navigation />

        <main className="flex-grow py-4 sm:py-6 md:py-8">
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/event/:id" element={<EventDetail />} />
          </Routes>
        </main>

        <footer className="bg-space-900/90 backdrop-blur-md border-t border-space-700 py-4 sm:py-6 md:py-8 mt-auto">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-cosmos-300">
                  About Space Launch Calendar
                </h3>
                <p className="text-space-200 text-xs sm:text-sm">
                  Track upcoming space launches worldwide with real-time updates
                  and detailed mission information.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-cosmos-300">
                  Quick Links
                </h3>
                <nav className="space-y-1 text-xs sm:text-sm">
                  <Link
                    to="/"
                    className="block text-space-200 hover:text-white transition-colors">
                    Calendar View
                  </Link>
                  <a
                    href="https://thespacedevs.com/llapi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-space-200 hover:text-white transition-colors">
                    Launch Library 2 API
                  </a>
                </nav>
                <p className="text-xs text-space-400 pt-3 border-t border-space-700">
                  © {new Date().getFullYear()} Space Launch Calendar
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
