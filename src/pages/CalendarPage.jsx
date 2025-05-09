import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { fetchUpcomingLaunches } from "../utils/fetchLaunches";
import LoadingScreen from "../components/LoadingScreen";
import EmptyState from "../components/EmptyState";

const CalendarPage = () => {
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [view, setView] = useState("dayGridMonth");
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLaunches = async () => {
      try {
        setLoading(true);
        if (error) setError(null);

        const data = await fetchUpcomingLaunches();

        // Validate the data
        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid data format received from API");
        }

        // Filter out any malformed launch data
        const validLaunches = data.filter(
          (launch) =>
            launch && launch.id && launch.name && launch.net && launch.status
        );

        console.log(
          `Received ${data.length} launches, ${validLaunches.length} valid`
        );
        setLaunches(validLaunches);
      } catch (err) {
        if (err.message.includes("429")) {
          setError(
            "The space launch data service is currently rate limited. Please try again in a few minutes."
          );
        } else {
          setError(`Failed to fetch launch data: ${err.message}`);
        }
        console.error(err);
      } finally {
        setLoading(false);
        setRetrying(false);
      }
    };

    loadLaunches();
  }, [retrying]);

  // Track screen size changes
  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Automatically switch to week view on small screens
  useEffect(() => {
    if (screenSize < 640 && view === "dayGridMonth") {
      setView("dayGridWeek");
    }
  }, [screenSize, view]);

  // Transform launches for FullCalendar with error handling
  const events = launches.map((launch) => {
    try {
      // Safely get properties with defaults if missing
      const getStatus = () => {
        try {
          return launch.status && launch.status.abbrev === "Go";
        } catch (e) {
          return false; // Default to non-Go status
        }
      };

      const getProviderName = () => {
        try {
          return launch.launch_service_provider?.name || "Unknown Provider";
        } catch (e) {
          return "Unknown Provider";
        }
      };

      const isConfirmed = getStatus();

      return {
        id: launch.id,
        title: launch.name || "Unnamed Launch",
        start: new Date(launch.net),
        allDay: false,
        backgroundColor: isConfirmed
          ? "rgba(57, 64, 222, 0.9)" // Darker blue for confirmed
          : "rgba(153, 51, 255, 0.9)", // Darker purple for tentative
        borderColor: isConfirmed
          ? "#6670FF" // Bright blue border
          : "#B366FF", // Bright purple border
        textColor: "#FFFFFF", // White text for better contrast
        extendedProps: {
          launchId: launch.id,
          status: launch.status?.abbrev || "Unknown",
          provider: getProviderName(),
        },
        classNames: ["calendar-event"],
      };
    } catch (error) {
      console.error("Error transforming launch for calendar:", error, launch);
      // Return a minimal valid event instead of failing
      return {
        id:
          launch.id || `unknown-${Math.random().toString(36).substring(2, 9)}`,
        title: (launch.name || "Unknown Launch") + " (Data Error)",
        start: launch.net ? new Date(launch.net) : new Date(),
        backgroundColor: "rgba(255, 0, 0, 0.5)", // Red for error
        borderColor: "#FF0000",
        textColor: "#FFFFFF",
        extendedProps: {
          launchId: launch.id || "unknown",
          status: "Error",
          provider: "Unknown",
        },
      };
    }
  });

  const handleEventClick = (info) => {
    navigate(`/event/${info.event.extendedProps.launchId}`);
  };

  const renderEventContent = (eventInfo) => {
    try {
      const isMobile = window.innerWidth < 768;
      const eventTime = eventInfo.timeText;
      const eventTitle = eventInfo.event.title;
      const provider = eventInfo.event.extendedProps.provider;

      // Truncate long titles
      const truncateText = (text, maxLength) => {
        if (!text) return "";
        return text.length > maxLength
          ? text.substring(0, maxLength) + "..."
          : text;
      };

      const truncatedTitle = truncateText(eventTitle, isMobile ? 15 : 20);

      return (
        <div className="event-content p-1 backdrop-blur-sm bg-space-800/90 rounded border border-space-700">
          <div className="event-time text-[9px] leading-tight font-medium text-space-200">
            {eventTime}
          </div>
          <div className="event-title text-[10px] leading-tight font-semibold text-white truncate">
            {truncatedTitle}
          </div>
          {!isMobile && provider && (
            <div className="event-provider text-[8px] leading-tight text-space-300 truncate">
              {truncateText(provider, 15)}
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error("Error rendering event content:", error);
      return (
        <div className="event-content p-1 bg-red-900/80 rounded border border-red-700">
          <div className="text-[10px] text-white">Data Error</div>
        </div>
      );
    }
  };

  // Function to handle clicking on the "more" link
  const handleMoreLinkClick = (args) => {
    // Custom handling of the "more" link click
    // You can keep the default behavior by returning true
    // or create your own popup by returning false and implementing custom logic
    return true; // Keep default behavior
  };

  const handleRetry = () => {
    setRetrying(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-space-900/90 backdrop-blur-sm rounded-xl border border-space-700 p-8 text-center">
          <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-cosmos-400 border-t-transparent rounded-full"></div>
          <p className="text-cosmos-200">Loading space launches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-space-900/90 backdrop-blur-sm rounded-xl border border-space-700 p-8 text-center">
          <svg
            className="w-12 h-12 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold text-red-400 mb-4">
            {error.includes("429")
              ? "API Rate Limit Exceeded"
              : "Error Loading Launches"}
          </h2>
          <p className="text-space-200 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className={`px-4 py-2 rounded-lg text-white font-medium transition ${retrying ? "bg-blue-700/50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
            {retrying ? "Trying again..." : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  // Display empty state if no launches were found
  if (!launches || launches.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-space-900/90 backdrop-blur-sm rounded-xl border border-space-700 p-8 text-center">
          <svg
            className="w-12 h-12 text-cosmos-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mb-4">
            No Upcoming Launches
          </h2>
          <p className="text-space-200 mb-6">
            No upcoming launches were found in the database.
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700">
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-7xl">
      <div className="bg-space-900/90 backdrop-blur-sm rounded-xl border border-space-700 overflow-hidden nebula-glow">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Upcoming Launches
              </h2>
              <p className="text-space-200 text-xs sm:text-sm">
                {view === "dayGridMonth"
                  ? "Monthly Overview"
                  : "Weekly Schedule"}
              </p>
            </div>

            <div className="flex items-center space-x-4 text-xs sm:text-sm">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-cosmos-500 rounded-full mr-1 sm:mr-2"></span>
                <span className="text-space-200">Confirmed</span>
              </div>
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-nebula-500 rounded-full mr-1 sm:mr-2"></span>
                <span className="text-space-200">Tentative</span>
              </div>
            </div>
          </div>

          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView={screenSize < 640 ? "dayGridWeek" : "dayGridMonth"}
              events={events}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              height="auto"
              className="space-calendar"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,dayGridWeek",
              }}
              dayMaxEvents={5}
              dayMaxEventRows={5}
              moreLinkContent={({ num }) => `+${num}`}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: false,
                hour12: false,
              }}
              eventDisplay="block"
              dayCellClassNames="calendar-day-cell"
              viewDidMount={(info) => setView(info.view.type)}
              moreLinkClick={handleMoreLinkClick}
            />
          </div>

          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-space-300">
            Tap on any launch event for details • Showing {launches.length}{" "}
            upcoming launches
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
