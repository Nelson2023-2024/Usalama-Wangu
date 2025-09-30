import React from "react";
import {
  TouchableOpacity,
  Text,
  Animated,
  Alert,
  Vibration,
} from "react-native";
import { styles } from "../styles/emergencyButton.styles";

interface EmergencyButtonProps {
  onPress: () => void;
  blinkAnim: Animated.Value;
  pulseAnim: Animated.Value;
  isEmergencyActive: boolean;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  onPress,
  blinkAnim,
  pulseAnim,
  isEmergencyActive,
}) => {
  const handlePress = () => {
    if (isEmergencyActive) return;

    // Haptic feedback
    Vibration.vibrate([0, 250, 100, 250]);

    Alert.alert(
      "Emergency Alert",
      "This will immediately notify your emergency contacts and record audio for 30 seconds. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "SEND ALERT",
          style: "destructive",
          onPress,
        },
      ]
    );
  };

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        {
          opacity: blinkAnim,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>EMERGENCY</Text>
        <Text style={styles.buttonSubText}>PRESS FOR HELP</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};