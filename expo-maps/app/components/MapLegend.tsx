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
      description: "Active violent incidents",
      shouldBlink: true,
    },
    {
      icon: "!",
      iconBg: "#DC1414",
      color: "#DC1414",
      title: "Dangerous Zone",
      description: "Recent crime reports",
      shouldBlink: false,
    },
    {
      icon: "!",
      iconBg: "#FFA500",
      color: "#FFA500",
      title: "Relatively Unsafe",
      description: "Past security incidents",
      shouldBlink: false,
    },
    {
      icon: "🚗💥",
      iconBg: "#8B4513",
      color: "#8B4513",
      title: "Accident Hotspot",
      description: "Traffic accidents",
      shouldBlink: false,
    },
    {
      icon: "🦁",
      iconBg: "#008000",
      color: "#008000",
      title: "Wildlife Danger",
      description: "Animal attacks",
      shouldBlink: true,
    },
    {
      icon: "🐊",
      iconBg: "#0000FF",
      color: "#0000FF",
      title: "Aquatic Danger",
      description: "Water hazards",
      shouldBlink: true,
    },
    {
      icon: "💧",
      iconBg: "#8A2BE2",
      color: "#8A2BE2",
      title: "Cholera Outbreak",
      description: "Waterborne disease",
      shouldBlink: true,
    },
    {
      icon: "🦟",
      iconBg: "#FFD700",
      color: "#FFD700",
      title: "Malaria Alert",
      description: "Mosquito zone",
      shouldBlink: true,
    },
    {
      icon: "🫁",
      iconBg: "#FF1493",
      color: "#FF1493",
      title: "Tuberculosis",
      description: "TB outbreak area",
      shouldBlink: false,
    },
    {
      icon: "🤒",
      iconBg: "#FF69B4",
      color: "#FF69B4",
      title: "Measles",
      description: "Measles outbreak",
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
            <View style={[
              styles.blinkingDot,
              { opacity: isBlinking ? 1 : 0.3 }
            ]} />
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
                        borderWidth: isCurrentlyBlinking ? 3 : 2,
                        borderColor: isCurrentlyBlinking ? "#FF0000" : "#FFFFFF",
                      },
                    ]}
                  >
                    <Text style={styles.legendIcon}>{item.icon}</Text>
                  </View>

                  {/* Text Info */}
                  <View style={styles.legendTextContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.legendItemTitle}>{item.title}</Text>
                      {item.shouldBlink && (
                        <View style={styles.blinkBadge}>
                          <Text style={styles.blinkBadgeText}>⚡</Text>
                        </View>
                      )}
                    </View>
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
                        borderWidth: isCurrentlyBlinking ? 3 : 2,
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
              💡 Tap markers for details
            </Text>
            <Text style={styles.footerText}>
              ⚡ = Active/Blinking zone
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
    minWidth: 20,
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
    maxHeight: 450,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  legendItems: {
    padding: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    flexWrap: "wrap",
  },
  legendItemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
    marginRight: 4,
  },
  blinkBadge: {
    backgroundColor: "#FF0000",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  blinkBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
  },
  legendItemDescription: {
    fontSize: 11,
    color: "#666",
    lineHeight: 15,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
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