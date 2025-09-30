import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { Audio } from "expo-av";

export const useAudioPlayback = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);

  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const onPlaybackStatusUpdate = (status: any) => {
    setPlaybackStatus(status);
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const playRecordedAudio = async (audioUri: string | null) => {
    try {
      if (!audioUri) {
        Alert.alert("No Audio", "No recorded audio available to play.");
        return;
      }

      // If already playing, stop the current playback
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Create and load the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Failed to play recorded audio.");
    }
  };

  const stopPlayback = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error stopping playback:", error);
    }
  };

  const resetPlayback = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    setPlaybackStatus(null);
  };

  const formatPlaybackTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    sound,
    isPlaying,
    playbackStatus,
    playRecordedAudio,
    stopPlayback,
    resetPlayback,
    formatPlaybackTime,
  };
};