const API_BASE_URL = "https://ll.thespacedevs.com/2.2.0";

// Add proper caching to reduce API calls
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let launchesCache = {
  data: null,
  timestamp: 0,
};

let launchDetailCache = {};

// Helper function to handle API rate limiting
const handleRateLimit = async (response) => {
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") || 30;
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return false;
  }
  return true;
};

export const fetchUpcomingLaunches = async () => {
  try {
    // Check cache first
    const now = Date.now();
    if (launchesCache.data && now - launchesCache.timestamp < CACHE_DURATION) {
      console.log("Using cached launch data");
      return launchesCache.data;
    }

    console.log("Fetching fresh launch data from API...");

    // Add fallback to sample data if development mode
    if (process.env.NODE_ENV === "development") {
      try {
        const response = await fetch(
          `${API_BASE_URL}/launch/upcoming/?limit=100&mode=detailed`
        );

        if (response.status === 429) {
          console.log("Rate limited by API, using sample data instead");
          return getSampleLaunchData();
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update cache
        launchesCache = {
          data: data.results,
          timestamp: now,
        };

        return data.results;
      } catch (error) {
        console.warn("Error fetching from API, using sample data:", error);
        return getSampleLaunchData();
      }
    } else {
      // Production mode - implement exponential backoff
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/launch/upcoming/?limit=100&mode=detailed`
          );

          if (response.status === 429) {
            const retryAfter =
              response.headers.get("Retry-After") || 30 * Math.pow(2, retries);
            console.log(
              `Rate limited. Retrying after ${retryAfter} seconds...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, retryAfter * 1000)
            );
            retries++;
            continue;
          }

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          // Update cache
          launchesCache = {
            data: data.results,
            timestamp: now,
          };

          return data.results;
        } catch (error) {
          retries++;
          if (retries >= maxRetries) throw error;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching launches:", error);
    throw error;
  }
};

export const fetchLaunchById = async (id) => {
  try {
    // Check cache first
    const now = Date.now();
    if (
      launchDetailCache[id] &&
      now - launchDetailCache[id].timestamp < CACHE_DURATION
    ) {
      console.log(`Using cached data for launch ${id}`);
      return launchDetailCache[id].data;
    }

    console.log(`Fetching details for launch ${id}...`);

    // Similar pattern to above with retries and fallback
    if (process.env.NODE_ENV === "development") {
      try {
        const response = await fetch(`${API_BASE_URL}/launch/${id}`);

        if (response.status === 429) {
          console.log("Rate limited by API, using sample data instead");
          return getSampleLaunchDetail(id);
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update cache
        launchDetailCache[id] = {
          data,
          timestamp: now,
        };

        return data;
      } catch (error) {
        console.warn(`Error fetching launch ${id}, using sample data:`, error);
        return getSampleLaunchDetail(id);
      }
    } else {
      // Production code with retries...
      // (similar to fetchUpcomingLaunches)
    }
  } catch (error) {
    console.error(`Error fetching launch ${id}:`, error);
    throw error;
  }
};

// Sample data functions for development fallback
function getSampleLaunchData() {
  return [
    {
      id: "1",
      name: "Falcon 9 Block 5 | Starlink Group 6-83",
      net: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      status: { name: "Go", abbrev: "Go" },
      launch_service_provider: { name: "SpaceX" },
      rocket: { configuration: { name: "Falcon 9" } },
      mission: {
        name: "Starlink Group 6-83",
        description:
          "A batch of satellites for the Starlink mega-constellation - SpaceX's project for space-based Internet communication system.",
      },
      pad: {
        name: "Space Launch Complex 40",
        location: { name: "Cape Canaveral, FL", country_code: "USA" },
      },
    },
    {
      id: "2",
      name: "Electron | Maiden Flight",
      net: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      status: { name: "Go", abbrev: "Go" },
      launch_service_provider: { name: "Rocket Lab" },
      rocket: { configuration: { name: "Electron" } },
      mission: {
        name: "Maiden Flight",
        description: "First test flight of the Electron rocket.",
      },
      pad: {
        name: "Launch Complex 1A",
        location: { name: "Māhia Peninsula, New Zealand", country_code: "NZL" },
      },
    },
    // Add more sample launches as needed
  ];
}

function getSampleLaunchDetail(id) {
  // Return detailed info for a specific launch ID
  const samples = getSampleLaunchData();
  return samples.find((launch) => launch.id === id) || samples[0];
}

// New function to poll for updates
export const pollLaunchUpdates = async (id, callback, interval = 60000) => {
  let lastData = null;

  const checkForUpdates = async () => {
    try {
      const data = await fetchLaunchById(id);

      // Compare with last data to see if there are updates
      if (lastData && JSON.stringify(data) !== JSON.stringify(lastData)) {
        callback(data);
      }

      lastData = data;
    } catch (error) {
      console.error("Error polling launch updates:", error);
    }
  };

  // Initial check
  await checkForUpdates();

  // Set up polling
  const pollId = setInterval(checkForUpdates, interval);

  // Return cleanup function
  return () => clearInterval(pollId);
};

export const getLaunchesGroupedByDate = (launches) => {
  return launches.reduce((acc, launch) => {
    const launchDate = new Date(launch.net).toISOString().split("T")[0];
    if (!acc[launchDate]) {
      acc[launchDate] = [];
    }
    acc[launchDate].push(launch);
    return acc;
  }, {});
};
