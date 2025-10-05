import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";

// Legend Component
export const MapLegend = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Blinking effect for icons that should blink
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking((prev) => !prev);
    }, 800); // Same timing as in App.tsx
    return () => clearInterval(interval);
  }, []);

  const legendItems = [
    {
      icon: "!",
      iconBg: "#FF0000",
      color: "#FF0000",
      title: "Extremely Dangerous",
      description: "Active violent incidents (blinking)",
      shape: "circle",
      shouldBlink: true,
    },
    {
      icon: "!",
      iconBg: "#DC1414",
      color: "#DC1414",
      title: "Dangerous Zone",
      description: "Recent crime reports",
      shape: "circle",
      shouldBlink: false,
    },
    {
      icon: "!",
      iconBg: "#FFA500",
      color: "#FFA500",
      title: "Relatively Unsafe",
      description: "Past security incidents",
      shape: "circle",
      shouldBlink: false,
    },
    {
      icon: "🚗💥",
      iconBg: "#8B4513",
      color: "#8B4513",
      title: "Accident Hotspot",
      description: "Frequent traffic accidents",
      shape: "circle",
      shouldBlink: false,
    },
    {
      icon: "🦁",
      iconBg: "#008000",
      color: "#008000",
      title: "Wildlife Danger",
      description: "Animal attack reports (blinking)",
      shape: "circle",
      shouldBlink: true,
    },
    {
      icon: "🐊",
      iconBg: "#0000FF",
      color: "#0000FF",
      title: "Aquatic Danger",
      description: "Water-related hazards (blinking)",
      shape: "circle",
      shouldBlink: true,
    },
  ];

  return (
    <View style={styles.legendContainer}>
      {/* Toggle Button */}
      <TouchableOpacity
        style={styles.legendToggle}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.legendHeader}>
          <Text style={styles.legendTitle}>
            {isExpanded ? "▼" : "►"} Map Legend
          </Text>
          <View style={styles.statusIndicator}>
            <View style={styles.blinkingDot} />
            <Text style={styles.statusText}>Live</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded Legend Content */}
      {isExpanded && (
        <ScrollView style={styles.legendContent} nestedScrollEnabled>
          <View style={styles.legendItems}>
            {legendItems.map((item, index) => {
              // Determine if this icon should be in blinking state
              const isCurrentlyBlinking = item.shouldBlink && isBlinking;
              
              return (
                <View key={index} style={styles.legendItem}>
                  {/* Icon Circle with blinking effect */}
                  <View
                    style={[
                      styles.legendIconContainer,
                      { 
                        backgroundColor: isCurrentlyBlinking ? "#FF0000" : item.iconBg,
                        opacity: isCurrentlyBlinking ? 1 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.legendIcon}>{item.icon}</Text>
                  </View>

                  {/* Text Info */}
                  <View style={styles.legendTextContainer}>
                    <Text style={styles.legendItemTitle}>{item.title}</Text>
                    <Text style={styles.legendItemDescription}>
                      {item.description}
                    </Text>
                  </View>

                  {/* Color Indicator (Circle) with blinking effect */}
                  <View
                    style={[
                      styles.colorIndicator,
                      {
                        borderColor: isCurrentlyBlinking ? "#FF0000" : item.color,
                        backgroundColor: isCurrentlyBlinking 
                          ? "rgba(255, 0, 0, 0.6)" 
                          : `${item.color}40`,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>

          {/* Footer Info */}
          <View style={styles.legendFooter}>
            <Text style={styles.footerText}>
              💡 Tap any marker for details
            </Text>
            <Text style={styles.footerText}>
              ⚡ Blinking zones = Active threat
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    position: "absolute",
    top: 60,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 280,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  legendToggle: {
    padding: 12,
  },
  legendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  blinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF0000",
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FF0000",
  },
  legendContent: {
    maxHeight: 400,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  legendItems: {
    padding: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  legendIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  legendIcon: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  legendTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  legendItemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  legendItemDescription: {
    fontSize: 11,
    color: "#666",
    lineHeight: 14,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  legendFooter: {
    padding: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  footerText: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
});