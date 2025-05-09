const API_BASE_URL = "https://lldev.thespacedevs.com/2.2.0"; // Using development API instead of production

// Add proper caching to reduce API calls - increased to 30 minutes
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
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

// Helper function to fetch all paginated results
const fetchAllPages = async (initialUrl, retries = 0, maxRetries = 3) => {
  let allResults = [];
  let nextUrl = initialUrl;

  try {
    while (nextUrl && allResults.length < 500) {
      // Safety limit of 500 launches to prevent infinite loops
      console.log(`Fetching launches from: ${nextUrl}`);

      const response = await fetch(nextUrl);

      // Handle rate limiting
      if (response.status === 429) {
        if (retries >= maxRetries) {
          console.log(
            "Max retries reached for rate limiting. Using partial results."
          );
          return allResults;
        }

        const retryAfter =
          response.headers.get("Retry-After") || 30 * Math.pow(2, retries);
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));

        // Recursive call with increased retry count
        return fetchAllPages(nextUrl, retries + 1, maxRetries);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add results from this page
      if (data.results && Array.isArray(data.results)) {
        allResults = [...allResults, ...data.results];
      }

      // Move to next page if it exists
      nextUrl = data.next;

      // Increased delay between requests to be kinder to the API
      if (nextUrl) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return allResults;
  } catch (error) {
    console.error("Error fetching paginated results:", error);
    throw error;
  }
};

// Save data to localStorage for offline support
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.warn("Failed to save data to localStorage:", error);
  }
};

// Get data from localStorage
const getFromLocalStorage = (key) => {
  try {
    const storedData = localStorage.getItem(key);
    if (!storedData) return null;

    return JSON.parse(storedData);
  } catch (error) {
    console.warn("Failed to retrieve data from localStorage:", error);
    return null;
  }
};

export const fetchUpcomingLaunches = async () => {
  try {
    // Check memory cache first
    const now = Date.now();
    if (launchesCache.data && now - launchesCache.timestamp < CACHE_DURATION) {
      console.log("Using cached launch data from memory");
      return launchesCache.data;
    }

    // Then check localStorage cache
    const storedData = getFromLocalStorage("upcomingLaunches");
    if (storedData && now - storedData.timestamp < CACHE_DURATION) {
      console.log("Using cached launch data from localStorage");

      // Update memory cache
      launchesCache = {
        data: storedData.data,
        timestamp: storedData.timestamp,
      };

      return storedData.data;
    }

    console.log("Fetching fresh launch data from API...");

    // Add fallback to sample data if development mode
    if (process.env.NODE_ENV === "development") {
      try {
        // Use pagination to get all launches with a more reasonable limit
        const allResults = await fetchAllPages(
          `${API_BASE_URL}/launch/upcoming/?limit=50&mode=detailed`
        );

        if (allResults.length === 0) {
          console.log("No results from API, using sample data instead");
          return getSampleLaunchData();
        }

        // Update cache
        launchesCache = {
          data: allResults,
          timestamp: now,
        };

        // Save to localStorage
        saveToLocalStorage("upcomingLaunches", allResults);

        return allResults;
      } catch (error) {
        console.warn("Error fetching from API, using sample data:", error);
        // Try to use expired data from localStorage before falling back to sample data
        const oldData = getFromLocalStorage("upcomingLaunches");
        if (oldData && oldData.data && Array.isArray(oldData.data)) {
          console.log("Using expired data from localStorage");
          return oldData.data;
        }
        return getSampleLaunchData();
      }
    } else {
      // Production mode - implement exponential backoff with pagination
      let retries = 0;
      const maxRetries = 4; // Increased max retries

      while (retries < maxRetries) {
        try {
          // Use pagination to get all launches with a more reasonable limit per page
          const allResults = await fetchAllPages(
            `${API_BASE_URL}/launch/upcoming/?limit=50&mode=detailed`
          );

          // Update cache
          launchesCache = {
            data: allResults,
            timestamp: now,
          };

          // Save to localStorage
          saveToLocalStorage("upcomingLaunches", allResults);

          return allResults;
        } catch (error) {
          retries++;
          console.warn(`API request failed, retry ${retries}/${maxRetries}`);

          // Add exponential delay between retries
          if (retries < maxRetries) {
            const delayMs = 5000 * Math.pow(2, retries);
            console.log(`Waiting ${delayMs / 1000} seconds before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else {
            // Try to return cached data if available, even if expired
            const oldStoredData = getFromLocalStorage("upcomingLaunches");
            if (oldStoredData && oldStoredData.data) {
              console.warn("Using expired cached data due to API error");
              return oldStoredData.data;
            }
            throw error;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching launches:", error);
    // Final fallback - try to use any available data
    const oldStoredData = getFromLocalStorage("upcomingLaunches");
    if (oldStoredData && oldStoredData.data) {
      console.warn("FINAL FALLBACK: Using expired cached data");
      return oldStoredData.data;
    }
    throw error;
  }
};

export const fetchLaunchById = async (id) => {
  try {
    // Check memory cache first
    const now = Date.now();
    if (
      launchDetailCache[id] &&
      now - launchDetailCache[id].timestamp < CACHE_DURATION
    ) {
      console.log(`Using cached data for launch ${id} from memory`);
      return launchDetailCache[id].data;
    }

    // Check localStorage cache
    const storedData = getFromLocalStorage(`launch_${id}`);
    if (storedData && now - storedData.timestamp < CACHE_DURATION) {
      console.log(`Using cached data for launch ${id} from localStorage`);

      // Update memory cache
      launchDetailCache[id] = {
        data: storedData.data,
        timestamp: storedData.timestamp,
      };

      return storedData.data;
    }

    console.log(`Fetching details for launch ${id}...`);

    if (process.env.NODE_ENV === "development") {
      try {
        const response = await fetch(`${API_BASE_URL}/launch/${id}`);

        if (response.status === 429) {
          console.log("Rate limited by API, using sample data instead");
          // Try to fetch from localStorage before using sample data
          const oldData = getFromLocalStorage(`launch_${id}`);
          if (oldData && oldData.data) {
            console.log("Using expired localStorage data for launch detail");
            return oldData.data;
          }
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

        // Save to localStorage
        saveToLocalStorage(`launch_${id}`, data);

        return data;
      } catch (error) {
        console.warn(
          `Error fetching launch ${id}, using cached or sample data:`,
          error
        );
        // Try localStorage first
        const oldData = getFromLocalStorage(`launch_${id}`);
        if (oldData && oldData.data) {
          console.log("Using expired localStorage data for launch detail");
          return oldData.data;
        }
        return getSampleLaunchDetail(id);
      }
    } else {
      // Production code with retries
      let retries = 0;
      const maxRetries = 4; // Increased max retries

      while (retries < maxRetries) {
        try {
          const response = await fetch(`${API_BASE_URL}/launch/${id}`);

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
          launchDetailCache[id] = {
            data,
            timestamp: now,
          };

          // Save to localStorage
          saveToLocalStorage(`launch_${id}`, data);

          return data;
        } catch (error) {
          retries++;
          console.warn(
            `API request failed for launch ${id}, retry ${retries}/${maxRetries}`
          );

          // Add exponential delay between retries
          if (retries < maxRetries) {
            const delayMs = 5000 * Math.pow(2, retries);
            console.log(`Waiting ${delayMs / 1000} seconds before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else {
            // Try to return cached data if available, even if expired
            const oldStoredData = getFromLocalStorage(`launch_${id}`);
            if (oldStoredData && oldStoredData.data) {
              console.warn(
                `Using expired cached data for launch ${id} due to API error`
              );
              return oldStoredData.data;
            }
            throw error;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching launch ${id}:`, error);
    // Final fallback - try to use any available data
    const oldStoredData = getFromLocalStorage(`launch_${id}`);
    if (oldStoredData && oldStoredData.data) {
      console.warn(
        `FINAL FALLBACK: Using expired cached data for launch ${id}`
      );
      return oldStoredData.data;
    }
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
  if (!launches || !Array.isArray(launches)) {
    console.warn(
      "Invalid launches data provided to grouping function",
      launches
    );
    return {};
  }

  return launches.reduce((acc, launch) => {
    try {
      const launchDate = new Date(launch.net).toISOString().split("T")[0];
      if (!acc[launchDate]) {
        acc[launchDate] = [];
      }
      acc[launchDate].push(launch);
    } catch (error) {
      console.warn(
        "Error processing launch in grouping function:",
        error,
        launch
      );
    }
    return acc;
  }, {});
};
