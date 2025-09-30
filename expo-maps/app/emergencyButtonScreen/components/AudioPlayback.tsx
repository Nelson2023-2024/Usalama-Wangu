import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/emergencyButton.styles";

interface AudioPlaybackProps {
  recordedAudioUri: string | null;
  isPlaying: boolean;
  playbackStatus: any;
  onPlay: () => void;
  onStop: () => void;
  onClear: () => void;
  formatPlaybackTime: (ms: number) => string;
}

export const AudioPlayback: React.FC<AudioPlaybackProps> = ({
  recordedAudioUri,
  isPlaying,
  playbackStatus,
  onPlay,
  onStop,
  onClear,
  formatPlaybackTime,
}) => {
  if (!recordedAudioUri) return null;

  return (
    <View style={styles.audioPlaybackContainer}>
      <Text style={styles.audioTitle}>🎵 Recorded Audio</Text>
      <View style={styles.audioControls}>
        <TouchableOpacity
          style={[styles.audioButton, isPlaying && styles.stopButton]}
          onPress={isPlaying ? onStop : onPlay}
        >
          <Text style={styles.audioButtonText}>
            {isPlaying ? "⏹️ Stop" : "▶️ Play"}
          </Text>
        </TouchableOpacity>

        {playbackStatus && (
          <Text style={styles.playbackTime}>
            {formatPlaybackTime(playbackStatus.positionMillis || 0)} /
            {formatPlaybackTime(playbackStatus.durationMillis || 0)}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.clearAudioButton} onPress={onClear}>
        <Text style={styles.clearAudioButtonText}>Clear Audio</Text>
      </TouchableOpacity>
    </View>
  );
};