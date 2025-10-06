import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MapLegend } from "./components/MapLegend";

// ---------- Types ----------
type ZoneType =
  | "extremely_dangerous"
  | "dangerous"
  | "relatively_unsafe"
  | "accident_zone"
  | "wildlife_danger"
  | "aquatic_danger"
  | "disease_cholera"
  | "disease_malaria"
  | "disease_tb"
  | "disease_measles";

interface Zone {
  id: number;
  type: ZoneType;
  latitude: number;
  longitude: number;
  radius: number;
  title: string;
  description: string;
  timestamp: string;
}

// ---------- Zone configs ----------
const ZONE_CONFIGS: Record<
  ZoneType,
  {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    shouldBlink: boolean;
    markerEmoji?: string;
  }
> = {
  extremely_dangerous: {
    fillColor: "rgba(255, 0, 0, 0.3)",
    strokeColor: "#FF0000",
    strokeWidth: 2,
    shouldBlink: true,
  },
  dangerous: {
    fillColor: "rgba(220, 20, 20, 0.25)",
    strokeColor: "#DC1414",
    strokeWidth: 2,
    shouldBlink: false,
  },
  relatively_unsafe: {
    fillColor: "rgba(255, 165, 0, 0.2)",
    strokeColor: "#FFA500",
    strokeWidth: 2,
    shouldBlink: false,
  },
  accident_zone: {
    fillColor: "rgba(139, 69, 19, 0.25)",
    strokeColor: "#8B4513",
    strokeWidth: 2,
    shouldBlink: false,
  },
  wildlife_danger: {
    fillColor: "rgba(0, 128, 0, 0.25)",
    strokeColor: "#008000",
    strokeWidth: 2,
    shouldBlink: true,
    markerEmoji: "🦁",
  },
  aquatic_danger: {
    fillColor: "rgba(0, 0, 255, 0.2)",
    strokeColor: "#0000FF",
    strokeWidth: 2,
    shouldBlink: true,
    markerEmoji: "🐊",
  },
  disease_cholera: {
    fillColor: "rgba(138, 43, 226, 0.25)",
    strokeColor: "#8A2BE2",
    strokeWidth: 2,
    shouldBlink: true,
    markerEmoji: "💧",
  },
  disease_malaria: {
    fillColor: "rgba(255, 215, 0, 0.25)",
    strokeColor: "#FFD700",
    strokeWidth: 2,
    shouldBlink: true,
    markerEmoji: "🦟",
  },
  disease_tb: {
    fillColor: "rgba(255, 20, 147, 0.25)",
    strokeColor: "#FF1493",
    strokeWidth: 2,
    shouldBlink: false,
    markerEmoji: "🫁",
  },
  disease_measles: {
    fillColor: "rgba(255, 105, 180, 0.25)",
    strokeColor: "#FF69B4",
    strokeWidth: 2,
    shouldBlink: true,
    markerEmoji: "🤒",
  },
};

export default function App() {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [blinkingZones, setBlinkingZones] = useState<Record<number, boolean>>(
    {}
  );

  // ---------- Fetch zones from backend ----------
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch("http://192.168.0.101:4000/api/zones");
        const data: Zone[] = await response.json();
        setZones(data);
      } catch (error) {
        console.error("Error fetching zones:", error);
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
  }, []);

  // ---------- Request location ----------
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  // ---------- Blinking effect ----------
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkingZones((prev) => {
        const newState: Record<number, boolean> = {};
        zones.forEach((zone) => {
          const config = ZONE_CONFIGS[zone.type];
          if (config?.shouldBlink) {
            newState[zone.id] = !prev[zone.id];
          }
        });
        return newState;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [zones]);

  if (!location || loadingZones) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading map & zones...</Text>
      </View>
    );
  }

  const INITIAL_REGION = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Helper function to format timestamp
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const incidentDate = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - incidentDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  // ---------- Render safety zone circles ----------
  const renderSafetyZone = (zone: Zone) => {
    const config = ZONE_CONFIGS[zone.type];
    if (!config) return null;

    const isBlinking = config.shouldBlink && blinkingZones[zone.id];

    return (
      <Circle
        key={zone.id}
        center={{
          latitude: zone.latitude,
          longitude: zone.longitude,
        }}
        radius={zone.radius}
        fillColor={isBlinking ? "rgba(255, 0, 0, 0.6)" : config.fillColor}
        strokeColor={isBlinking ? "#FF0000" : config.strokeColor}
        strokeWidth={isBlinking ? 3 : config.strokeWidth}
      />
    );
  };

  // ---------- Render zone markers ----------
  const renderZoneMarker = (zone: Zone) => {
    const timeAgo = formatTimeAgo(zone.timestamp);
    const descriptionWithTime = `${zone.description}\nReported: ${timeAgo}`;
    const config = ZONE_CONFIGS[zone.type];

    // Handle disease zones with emojis
    if (config?.markerEmoji && zone.type.startsWith("disease_")) {
      return (
        <Marker
          key={`marker-${zone.id}`}
          coordinate={{
            latitude: zone.latitude,
            longitude: zone.longitude,
          }}
          title={zone.title}
          description={descriptionWithTime}
        >
          <View style={styles.diseaseMarker}>
            <View style={[
              styles.diseaseIcon,
              { backgroundColor: config.strokeColor }
            ]}>
              <Text style={styles.diseaseEmoji}>{config.markerEmoji}</Text>
            </View>
          </View>
        </Marker>
      );
    }

    // Accident zone marker
    if (zone.type === "accident_zone") {
      return (
        <Marker
          key={`marker-${zone.id}`}
          coordinate={{
            latitude: zone.latitude,
            longitude: zone.longitude,
          }}
          title={zone.title}
          description={descriptionWithTime}
        >
          <View style={styles.accidentMarker}>
            <View style={styles.accidentIcon}>
              <Text style={styles.accidentText}>🚗💥</Text>
            </View>
          </View>
        </Marker>
      );
    }

    // Wildlife danger marker
    if (zone.type === "wildlife_danger") {
      return (
        <Marker
          key={`marker-${zone.id}`}
          coordinate={{
            latitude: zone.latitude,
            longitude: zone.longitude,
          }}
          title={zone.title}
          description={descriptionWithTime}
        >
          <Text style={{ fontSize: 24 }}>🦁</Text>
        </Marker>
      );
    }

    // Aquatic danger marker
    if (zone.type === "aquatic_danger") {
      return (
        <Marker
          key={`marker-${zone.id}`}
          coordinate={{
            latitude: zone.latitude,
            longitude: zone.longitude,
          }}
          title={zone.title}
          description={descriptionWithTime}
        >
          <Text style={{ fontSize: 24 }}>🐊</Text>
        </Marker>
      );
    }

    // Exclamation mark markers for dangerous zones
    if (zone.type === "extremely_dangerous") {
      return (
        <Marker
          key={`marker-${zone.id}`}
          coordinate={{
            latitude: zone.latitude,
            longitude: zone.longitude,
          }}
          title={zone.title}
          description={descriptionWithTime}
        >
          <View style={styles.exclamationMarker}>
            <View style={[styles.exclamationIcon, styles.redExclamation]}>
              <Text style={styles.exclamationText}>!</Text>
            </View>
          </View>
        </Marker>
      );
    }

    if (zone.type === "dangerous") {
      return (
        <Marker
          key={`marker-${zone.id}`}
          coordinate={{
            latitude: zone.latitude,
            longitude: zone.longitude,
          }}
          title={zone.title}
          description={descriptionWithTime}
        >
          <View style={styles.exclamationMarker}>
            <View style={[styles.exclamationIcon, styles.darkRedExclamation]}>
              <Text style={styles.exclamationText}>!</Text>
            </View>
          </View>
        </Marker>
      );
    }

    if (zone.type === "relatively_unsafe") {
      return (
        <Marker
          key={`marker-${zone.id}`}
          coordinate={{
            latitude: zone.latitude,
            longitude: zone.longitude,
          }}
          title={zone.title}
          description={descriptionWithTime}
        >
          <View style={styles.exclamationMarker}>
            <View style={[styles.exclamationIcon, styles.orangeExclamation]}>
              <Text style={styles.exclamationText}>!</Text>
            </View>
          </View>
        </Marker>
      );
    }

    // Fallback to default marker
    return (
      <Marker
        key={`marker-${zone.id}`}
        coordinate={{
          latitude: zone.latitude,
          longitude: zone.longitude,
        }}
        title={zone.title}
        description={descriptionWithTime}
        pinColor="#FF0000"
      />
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton
      >
        {zones.map(renderSafetyZone)}
        {zones.map(renderZoneMarker)}
      </MapView>
      <MapLegend/>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  accidentMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  accidentIcon: {
    backgroundColor: "#8B4513",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  accidentText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  exclamationMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  exclamationIcon: {
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  redExclamation: {
    backgroundColor: "#FF0000",
  },
  darkRedExclamation: {
    backgroundColor: "#DC1414",
  },
  orangeExclamation: {
    backgroundColor: "#FFA500",
  },
  exclamationText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  diseaseMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  diseaseIcon: {
    borderRadius: 25,
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  diseaseEmoji: {
    fontSize: 22,
  },
});