import React from "react";
import { View, Text, Animated } from "react-native";
import { styles } from "../styles/emergencyButton.styles";

interface RecordingIndicatorProps {
  recordingCountdown: number;
  recordingAnim: Animated.Value;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  recordingCountdown,
  recordingAnim,
}) => {
  return (
    <Animated.View style={[styles.recordingIndicator, { opacity: recordingAnim }]}>
      <Text style={styles.recordingText}>🔴 RECORDING AUDIO</Text>
      <Text style={styles.countdownText}>{recordingCountdown}s remaining</Text>
    </Animated.View>
  );
};