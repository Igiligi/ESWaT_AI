/**
 * Parses a GPS string "lat, lng" into numbers.
 * Converts to float and trims spaces.
 * Returns null if the format is invalid.
 */
export const parseGPS = (gpsStr?: string): { lat: number, lng: number } | null => {
  if (!gpsStr) return null;
  
  const hasComma = gpsStr.includes(',');
  if (!hasComma) return null;

  const parts = gpsStr.split(',');
  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());

  if (isNaN(lat) || isNaN(lng)) return null;

  return { lat, lng };
};

export const getGeocodeQuery = (street: string, location: string): string => {
  return `${street}, ${location}, Enugu, Nigeria`;
};
