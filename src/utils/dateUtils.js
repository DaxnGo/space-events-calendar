/**
 * Parses a date string and ensures proper timezone handling
 * @param {string} dateString - The date string to parse
 * @returns {Date} - A properly parsed Date object
 */
export const parseLaunchDate = (dateString) => {
  // Create a new Date object with the input string
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error(`Invalid date string: ${dateString}`);
    return new Date(); // Return current date as fallback
  }

  return date;
};

/**
 * Compares a launch date with current time
 * @param {string} launchDateString - The launch date string
 * @returns {boolean} - True if launch has occurred
 */
export const hasLaunchOccurred = (launchDateString) => {
  if (!launchDateString) return false;

  const launchDate = parseLaunchDate(launchDateString);
  const now = new Date();

  return now > launchDate;
};

/**
 * Formats a date for display
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
export const formatLaunchDate = (dateString) => {
  if (!dateString) return "Date unknown";

  const date = parseLaunchDate(dateString);

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date);
};
