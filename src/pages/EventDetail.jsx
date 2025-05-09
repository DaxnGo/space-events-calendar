import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchLaunchById, pollLaunchUpdates } from "../utils/fetchLaunches";
import CountdownTimer from "../components/CountdownTimer";
import LoadingScreen from "../components/LoadingScreen";
import EmptyState from "../components/EmptyState";
import {
  parseLaunchDate,
  hasLaunchOccurred,
  formatLaunchDate,
} from "../utils/dateUtils";

const EventDetail = () => {
  const { id } = useParams();
  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cleanup;

    const loadLaunchDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchLaunchById(id);
        setLaunch(data);

        // Set up polling for updates
        cleanup = await pollLaunchUpdates(id, (updatedData) => {
          setLaunch(updatedData);
        });
      } catch (err) {
        setError("Failed to fetch launch details. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLaunchDetails();

    // Cleanup polling when component unmounts
    return () => {
      if (cleanup) cleanup();
    };
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "long",
    }).format(date);
  };

  // Create a function to determine the launch status
  const getLaunchStatus = (launch) => {
    if (!launch || !launch.status) return "unknown";

    // Convert to lowercase for consistent comparison
    const status =
      launch.status.abbrev?.toLowerCase() ||
      launch.status.name?.toLowerCase() ||
      "unknown";

    if (status.includes("go") || status.includes("success")) return "go";
    if (status.includes("tbd") || status.includes("to be determined"))
      return "tbd";
    if (status.includes("hold")) return "hold";
    if (status.includes("failure") || status.includes("fail")) return "failure";
    if (status.includes("success") || status.includes("complete"))
      return "completed";

    return "unknown";
  };

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <EmptyState
        title="Error Loading Launch Details"
        description={error}
        icon={
          <svg
            className="w-12 h-12 text-red-400 mx-auto"
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
        }
        action={
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Return to Calendar
          </Link>
        }
      />
    );
  }

  if (!launch) {
    return (
      <EmptyState
        title="Launch Not Found"
        description="The launch you're looking for doesn't exist or has been removed."
        icon={
          <svg
            className="w-12 h-12 text-gray-400 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        action={
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Return to Calendar
          </Link>
        }
      />
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-4xl">
      <div className="bg-space-900/95 backdrop-blur-sm rounded-xl border border-space-700 overflow-hidden nebula-glow">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col gap-3 mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
              {launch.name}
            </h1>
            <span
              className={`self-start inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${
                launch.status?.abbrev === "Go"
                  ? "bg-cosmos-500/30 text-cosmos-200 border-2 border-cosmos-500"
                  : "bg-nebula-500/30 text-white border-2 border-nebula-500"
              }`}>
              {launch.status?.name || "Status Unknown"}
            </span>
          </div>

          {/* Countdown Section */}
          <div className="mb-6">
            <CountdownTimer
              launchDate={launch.net}
              launchStatus={getLaunchStatus(launch)}
            />
          </div>

          {/* Launch Status Banner */}
          {hasLaunchOccurred(launch.net) &&
            getLaunchStatus(launch) !== "tbd" && (
              <div className="bg-space-800/80 border border-space-600 rounded-lg p-3 mb-6">
                <p className="text-red-400 font-semibold text-base sm:text-lg text-center">
                  Launch has occurred!
                </p>
              </div>
            )}

          {/* Main Content - Stack on mobile, grid on larger screens */}
          <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
            {/* Launch Details Section */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 text-white flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-cosmos-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Launch Details
              </h2>
              <dl className="space-y-3 bg-space-800/50 rounded-lg p-3 sm:p-4 border border-space-700">
                <div className="grid grid-cols-3">
                  <dt className="text-cosmos-200 font-medium col-span-1">
                    Mission
                  </dt>
                  <dd className="text-white col-span-2">
                    {launch.mission?.name || "N/A"}
                  </dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="text-cosmos-200 font-medium col-span-1">
                    Date
                  </dt>
                  <dd className="text-white col-span-2">
                    {formatLaunchDate(launch.net)}
                  </dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="text-cosmos-200 font-medium col-span-1">
                    Provider
                  </dt>
                  <dd className="text-white col-span-2">
                    {launch.launch_service_provider?.name || "N/A"}
                  </dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="text-cosmos-200 font-medium col-span-1">
                    Rocket
                  </dt>
                  <dd className="text-white col-span-2">
                    {launch.rocket?.configuration?.name || "N/A"}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Launch Location Section */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 text-white flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-cosmos-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Launch Location
              </h2>
              <dl className="space-y-3 bg-space-800/50 rounded-lg p-3 sm:p-4 border border-space-700">
                <div className="grid grid-cols-3">
                  <dt className="text-cosmos-200 font-medium col-span-1">
                    Pad
                  </dt>
                  <dd className="text-white col-span-2">
                    {launch.pad?.name || "N/A"}
                  </dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="text-cosmos-200 font-medium col-span-1">
                    Location
                  </dt>
                  <dd className="text-white col-span-2">
                    {launch.pad?.location?.name || "N/A"}
                  </dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="text-cosmos-200 font-medium col-span-1">
                    Country
                  </dt>
                  <dd className="text-white col-span-2">
                    {launch.pad?.location?.country_code || "N/A"}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Mission Description Section */}
          {launch.mission?.description && (
            <section className="mt-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 text-white flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-cosmos-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Mission Description
              </h2>
              <div className="bg-space-800/50 rounded-lg p-3 sm:p-4 border border-space-700">
                <p className="text-white text-sm sm:text-base leading-relaxed">
                  {launch.mission.description}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
