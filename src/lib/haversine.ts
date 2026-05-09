/**
 * Calculate distance between two geo coordinates using Haversine formula.
 * Returns distance in meters.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if user is within allowed radius from office.
 * If `radiusMeter <= 0`, radius validation is DISABLED and user is always
 * considered "inside" (used for testing or unrestricted attendance).
 */
export function isWithinRadius(
  userLat: number,
  userLon: number,
  officeLat: number,
  officeLon: number,
  radiusMeter: number
): { inside: boolean; distance: number; enforced: boolean } {
  const distance = haversineDistance(userLat, userLon, officeLat, officeLon);
  const enforced = radiusMeter > 0;
  return {
    inside: enforced ? distance <= radiusMeter : true,
    distance: Math.round(distance * 100) / 100,
    enforced,
  };
}
