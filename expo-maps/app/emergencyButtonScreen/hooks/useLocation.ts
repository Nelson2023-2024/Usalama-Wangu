import { useState, useEffect } from "react";
import * as Location from "expo-location";

export const useLocation = () => {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);

  const getAddressFromCoords = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (response.length > 0) {
        const addr = response[0];
        return `${addr.street || ""} ${addr.city || ""} ${
          addr.region || ""
        }`.trim();
      }
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        setLocation(currentLocation.coords);

        const address = await getAddressFromCoords(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
        setLocationAddress(address);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const refreshLocation = async () => {
    try {
      setLocationAddress("Updating location...");
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation.coords);

      const address = await getAddressFromCoords(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      setLocationAddress(address);
    } catch (error) {
      console.error("Error refreshing location:", error);
      setLocationAddress("Failed to update location");
    }
  };

  // Get location on mount
  useEffect(() => {
    fetchLocation();
  }, []);

  return {
    location,
    locationAddress,
    refreshLocation,
    getAddressFromCoords,
  };
};