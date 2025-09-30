import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { Audio } from "expo-av";

export const useAudioRecording = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingCountdown, setRecordingCountdown] = useState(30);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const countdownRef = useRef<number | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Setup permissions on mount
  useEffect(() => {
    const setupPermissions = async () => {
      try {
        const perm = await Audio.requestPermissionsAsync();
        console.log("Audio permission status:", perm.status);
        if (perm.status === "granted") {
          setHasPermissions(true);
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
        } else {
          Alert.alert(
            "Permission Required",
            "Audio recording permission is needed for emergency alerts to function properly."
          );
        }
      } catch (error) {
        console.error("Error setting up permissions:", error);
      }
    };
    setupPermissions();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (isRecording && recordingCountdown > 0) {
      countdownRef.current = setTimeout(() => {
        setRecordingCountdown(recordingCountdown - 1);
      }, 1000);
    } else if (recordingCountdown === 0 && isRecording) {
      console.log("Countdown reached 0, stopping recording");
      stopRecording();
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [isRecording, recordingCountdown]);

  const requestPermission = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        setHasPermissions(true);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
    }
  };

  const startRecording = async () => {
    try {
      console.log("=== Starting Recording ===");
      
      if (!hasPermissions) {
        console.log("No permissions, requesting...");
        const perm = await Audio.requestPermissionsAsync();
        if (perm.status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Audio recording permission is needed for emergency alerts."
          );
          return false;
        }
        setHasPermissions(true);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      console.log("Creating recording...");
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      console.log("Recording created successfully");
      setRecording(newRecording);
      recordingRef.current = newRecording;
      setIsRecording(true);
      setRecordingCountdown(30);
      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert(
        "Error",
        "Failed to start audio recording. Emergency alert sent without audio."
      );
      return false;
    }
  };

  const stopRecording = async () => {
    try {
      console.log("=== Stopping Recording ===");
      let audioUri = null;

      const currentRecording = recordingRef.current || recording;

      if (currentRecording) {
        console.log("Recording exists, stopping...");
        
        await currentRecording.stopAndUnloadAsync();
        audioUri = currentRecording.getURI();
        
        console.log("Recording stopped, URI:", audioUri);
        
        setRecordedAudioUri(audioUri);
        setRecording(null);
        recordingRef.current = null;
      } else {
        console.log("No recording to stop");
      }

      setIsRecording(false);
      return audioUri;
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsRecording(false);
      return null;
    }
  };

  const resetRecording = async () => {
    console.log("=== Resetting Recording ===");
    const currentRecording = recordingRef.current || recording;
    
    if (currentRecording) {
      try {
        await currentRecording.stopAndUnloadAsync();
      } catch (error) {
        console.error("Error stopping recorder:", error);
      }
    }
    
    setRecording(null);
    recordingRef.current = null;
    setIsRecording(false);
    setRecordingCountdown(30);
    setRecordedAudioUri(null);
  };

  return {
    recording,
    isRecording,
    recordingCountdown,
    recordedAudioUri,
    hasPermissions,
    startRecording,
    stopRecording,
    resetRecording,
    requestPermission,
  };
};