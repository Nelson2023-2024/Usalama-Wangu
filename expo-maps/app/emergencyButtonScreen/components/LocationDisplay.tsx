import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type * as Location from "expo-location";
import { styles } from "../styles/emergencyButton.styles";


interface LocationDisplayProps {
  location: Location.LocationObjectCoords | null;
  locationAddress: string | null;
  onRefresh: () => void;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({
  location,
  locationAddress,
  onRefresh,
}) => {
  if (!location) return null;

  return (
    <View style={styles.locationContainer}>
      <Text style={styles.locationTitle}>📍 Current Location</Text>
      <Text style={styles.locationAddress}>
        {locationAddress || "Getting address..."}
      </Text>
      <Text style={styles.locationCoords}>
        Lat: {location.latitude.toFixed(6)}, Lng:{" "}
        {location.longitude.toFixed(6)}
      </Text>
      <Text style={styles.locationAccuracy}>
        Accuracy: ±{Math.round(location.accuracy || 0)}m
      </Text>
      <TouchableOpacity
        style={styles.refreshLocationButton}
        onPress={onRefresh}
      >
        <Text style={styles.refreshLocationButtonText}>
          🔄 Refresh Location
        </Text>
      </TouchableOpacity>
    </View>
  );
};