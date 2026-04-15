// Get day index matching eRail runningDays format (0=Monday, 6=Sunday)
export const getDayIndexFromDate = (dateStr: string): number => {
  const [DD, MM, YYYY] = dateStr.split("-").map(Number);
  const date = new Date(YYYY, MM - 1, DD); // JS Date: month is 0-indexed
  const jsDay = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

  // Convert to eRail format: 0=Monday, 1=Tuesday, ..., 6=Sunday
  return jsDay === 0 ? 6 : jsDay - 1;
};

// Validate date format DD-MM-YYYY
export const isValidDateFormat = (dateStr: string): boolean => {
  return /^\d{2}-\d{2}-\d{4}$/.test(dateStr);
};
