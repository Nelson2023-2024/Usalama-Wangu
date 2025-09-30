import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Animated } from "react-native";
import { RecordingIndicator } from "./RecordingIndicator";
import { styles } from "../styles/emergencyButton.styles";

interface ActiveEmergencyViewProps {
  isRecording: boolean;
  isSending: boolean;
  recordingCountdown: number;
  recordedAudioUri: string | null;
  recordingAnim: Animated.Value;
  onPlayAudio: () => void;
  onCancel: () => void;
  onDone: () => void;
}

export const ActiveEmergencyView: React.FC<ActiveEmergencyViewProps> = ({
  isRecording,
  isSending,
  recordingCountdown,
  recordedAudioUri,
  recordingAnim,
  onPlayAudio,
  onCancel,
  onDone,
}) => {
  const handleCancel = () => {
    Alert.alert(
      "Cancel Emergency Alert",
      "Are you sure you want to cancel the emergency alert?",
      [
        {
          text: "No, Continue Alert",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: onCancel,
        },
      ]
    );
  };

  return (
    <View style={styles.activeEmergencyContainer}>
      <Text style={styles.emergencyActiveTitle}>
        🚨 EMERGENCY ALERT ACTIVE 🚨
      </Text>

      {isRecording && (
        <RecordingIndicator
          recordingCountdown={recordingCountdown}
          recordingAnim={recordingAnim}
        />
      )}

      {isSending && (
        <View style={styles.sendingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.sendingText}>
            Sending emergency alert...
          </Text>
        </View>
      )}

      {!isRecording && !isSending && recordedAudioUri && (
        <View style={styles.completedContainer}>
          <Text style={styles.completedText}>
            ✅ Recording Complete - Alert Sent!
          </Text>
          <TouchableOpacity
            style={styles.playButton}
            onPress={onPlayAudio}
          >
            <Text style={styles.playButtonText}>
              🎧 Play Recorded Audio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={onDone}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.emergencyInfo}>
        <Text style={styles.emergencyInfoText}>
          📱 Notifying emergency contacts
        </Text>
        <Text style={styles.emergencyInfoText}>
          📍 Location being sent
        </Text>
        <Text style={styles.emergencyInfoText}>
          🎤 Audio recording in progress
        </Text>
      </View>

      {(isRecording || isSending) && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel Emergency</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}