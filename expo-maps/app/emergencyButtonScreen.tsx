import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
  Vibration,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";

const { width, height } = Dimensions.get("window");

const EmergencyButtonScreen = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingCountdown, setRecordingCountdown] = useState(30);
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);

  // Audio playback states
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);

  // Location display state
  const [locationAddress, setLocationAddress] = useState<string | null>(null);

  // Animation values
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingAnim = useRef(new Animated.Value(0)).current;

  // Countdown timer
  // Ref for the timeout
  const countdownRef = useRef<number | null>(null);

  // Request permissions and setup
  useEffect(() => {
    const setupPermissions = async () => {
      try {
        const perm = await Audio.requestPermissionsAsync();
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

  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Get location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest, // <-- most accurate
          });
          setLocation(currentLocation.coords);

          // Get address from coordinates
          const address = await getAddressFromCoords(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude
          );
          setLocationAddress(address);
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };
    getLocation();
  }, []);

  // Blinking animation for emergency button
  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    blinkAnimation.start();

    return () => blinkAnimation.stop();
  }, []);

  // Pulse animation for emergency button
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Recording countdown timer
  useEffect(() => {
    if (isRecording && recordingCountdown > 0) {
      countdownRef.current = setTimeout(() => {
        setRecordingCountdown(recordingCountdown - 1);
      }, 1000);
    } else if (recordingCountdown === 0 && isRecording) {
      stopRecordingAndSend();
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [isRecording, recordingCountdown]);

  // Recording pulse animation
  useEffect(() => {
    if (isRecording) {
      const recordingPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      recordingPulse.start();

      return () => recordingPulse.stop();
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (!hasPermissions) {
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

      // Create recording with proper options
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
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

  const stopRecordingAndSend = async () => {
    try {
      let audioUri = null;

      if (recording) {
        setRecording(null);
        await recording.stopAndUnloadAsync();
        audioUri = recording.getURI();

        // Store the audio URI for playback
        setRecordedAudioUri(audioUri);
      }

      setIsRecording(false);

      // Send emergency alert with audio
      await sendEmergencyAlert(audioUri);
    } catch (error) {
      console.error("Error stopping recording:", error);
      // Send emergency alert without audio
      await sendEmergencyAlert(null);
    }
  };

  const playRecordedAudio = async () => {
    try {
      if (!recordedAudioUri) {
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
        { uri: recordedAudioUri },
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

  const onPlaybackStatusUpdate = (status: any) => {
    setPlaybackStatus(status);
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const sendEmergencyAlert = async (audioUri: string | null) => {
    setIsSending(true);

    try {
      const emergencyData = {
        timestamp: new Date().toISOString(),
        location: location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
              address: await getAddressFromCoords(
                location.latitude,
                location.longitude
              ),
            }
          : null,
        hasAudio: !!audioUri,
        alertType: "emergency_panic_button",
      };

      // Convert audio to base64 if available
      let audioBase64 = null;
      if (audioUri) {
        try {
          audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
            encoding: "base64",
          });
        } catch (error) {
          console.error("Error converting audio to base64:", error);
        }
      }

      // Send to your backend
      const response = await fetch("http://192.168.0.101:4000/api/emergency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...emergencyData,
          audioData: audioBase64,
        }),
      });

      if (response.ok) {
        Alert.alert(
          "Emergency Alert Sent",
          `Your emergency contacts have been notified and authorities are being alerted.${
            recordedAudioUri
              ? "\n\nYou can now play back the recorded audio."
              : ""
          }`,
          [
            {
              text: "OK",
              onPress: () => {
                // Don't reset everything - keep the recorded audio for playback
                setIsSending(false);
              },
            },
          ]
        );
      } else {
        throw new Error("Failed to send emergency alert");
      }
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      Alert.alert(
        "Error",
        "Failed to send emergency alert. Please try calling emergency services directly.",
        [
          {
            text: "Call Emergency",
            onPress: () => {
              // In a real app, use Linking.openURL("tel:999") or appropriate emergency number
              console.log("Would call emergency services");
            },
          },
          {
            text: "Retry",
            onPress: () => sendEmergencyAlert(audioUri),
          },
        ]
      );
    } finally {
      setIsSending(false);
    }
  };

  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (response.length > 0) {
        const addr = response[0];
        return `${addr.street || ""} ${addr.city || ""} ${
          addr.region || ""
        }`.trim();
      }
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  const handleEmergencyPress = async () => {
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
          onPress: async () => {
            setIsEmergencyActive(true);
            const recordingStarted = await startRecording();

            // If recording failed, send alert without audio
            if (!recordingStarted) {
              await sendEmergencyAlert(null);
            }
          },
        },
      ]
    );
  };

  const cancelEmergency = () => {
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
          onPress: async () => {
            if (recording) {
              try {
                setRecording(null);
                await recording.stopAndUnloadAsync();
              } catch (error) {
                console.error("Error stopping recorder:", error);
              }
            }
            resetEmergencyState();
          },
        },
      ]
    );
  };

  const resetEmergencyState = async () => {
    setIsEmergencyActive(false);
    setIsRecording(false);
    setRecordingCountdown(30);
    setIsSending(false);
    setRecordedAudioUri(null);

    // Stop any playing audio
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    setPlaybackStatus(null);

    // Keep location data - don't clear it unless user wants fresh location
  };

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

  const formatPlaybackTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  const refreshLocation = async () => {
    try {
      setLocationAddress("Updating location...");
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation.coords);

      // Get fresh address
      const address = await getAddressFromCoords(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      setLocationAddress(address);
    } catch (error) {
      console.error("Error refreshing location:", error);
      setLocationAddress("Failed to update location");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {!isEmergencyActive ? (
          <>
            <Text style={styles.title}>Emergency Safety Button</Text>
            <Text style={styles.subtitle}>
              Press in case of immediate danger{"\n"}
              Your location and 30-second audio will be sent to emergency
              contacts
            </Text>

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
                onPress={handleEmergencyPress}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>EMERGENCY</Text>
                <Text style={styles.buttonSubText}>PRESS FOR HELP</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                📍 Location: {location ? "✓ Ready" : "Getting location..."}
              </Text>
              <Text style={styles.infoText}>
                🎤 Audio Recording:{" "}
                {hasPermissions ? "✓ Ready" : "❌ Permission needed"}
              </Text>
              {!hasPermissions && (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermission}
                >
                  <Text style={styles.permissionButtonText}>
                    Grant Audio Permission
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Location Display Section */}
            {location && (
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
                  onPress={refreshLocation}
                >
                  <Text style={styles.refreshLocationButtonText}>
                    🔄 Refresh Location
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Audio playback section - only show if we have recorded audio */}
            {recordedAudioUri && (
              <View style={styles.audioPlaybackContainer}>
                <Text style={styles.audioTitle}>🎵 Recorded Audio</Text>
                <View style={styles.audioControls}>
                  <TouchableOpacity
                    style={[styles.audioButton, isPlaying && styles.stopButton]}
                    onPress={isPlaying ? stopPlayback : playRecordedAudio}
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

                <TouchableOpacity
                  style={styles.clearAudioButton}
                  onPress={resetEmergencyState}
                >
                  <Text style={styles.clearAudioButtonText}>Clear Audio</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.activeEmergencyContainer}>
            <Text style={styles.emergencyActiveTitle}>
              🚨 EMERGENCY ALERT ACTIVE 🚨
            </Text>

            {isRecording && (
              <Animated.View
                style={[styles.recordingIndicator, { opacity: recordingAnim }]}
              >
                <Text style={styles.recordingText}>🔴 RECORDING AUDIO</Text>
                <Text style={styles.countdownText}>
                  {recordingCountdown}s remaining
                </Text>
              </Animated.View>
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
                  onPress={playRecordedAudio}
                >
                  <Text style={styles.playButtonText}>
                    🎧 Play Recorded Audio
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={resetEmergencyState}
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
                onPress={cancelEmergency}
              >
                <Text style={styles.cancelButtonText}>Cancel Emergency</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 22,
  },
  buttonContainer: {
    marginVertical: 40,
  },
  emergencyButton: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF0000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 8,
    borderColor: "#FFFFFF",
  },
  buttonText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "#000000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  buttonSubText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 8,
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  infoContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#666666",
    marginVertical: 5,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#FF6600",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    marginTop: 10,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  audioPlaybackContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#F0F8FF",
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  audioControls: {
    alignItems: "center",
    marginBottom: 15,
  },
  audioButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  stopButton: {
    backgroundColor: "#FF5722",
  },
  audioButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  playbackTime: {
    fontSize: 14,
    color: "#666",
    fontFamily: "monospace",
  },
  clearAudioButton: {
    backgroundColor: "#9E9E9E",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  clearAudioButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  locationContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
    lineHeight: 18,
  },
  locationCoords: {
    fontSize: 12,
    color: "#388E3C",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 11,
    color: "#66BB6A",
    fontStyle: "italic",
  },
  activeEmergencyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emergencyActiveTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 40,
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  recordingIndicator: {
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: "#FF0000",
  },
  recordingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 10,
  },
  countdownText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FF0000",
    textAlign: "center",
  },
  sendingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  sendingText: {
    fontSize: 18,
    color: "#333333",
    marginTop: 10,
    textAlign: "center",
  },
  completedContainer: {
    alignItems: "center",
    marginVertical: 20,
    padding: 20,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  completedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 15,
  },
  playButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  doneButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 15,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  emergencyInfo: {
    marginVertical: 30,
    alignItems: "center",
  },
  emergencyInfoText: {
    fontSize: 16,
    color: "#333333",
    marginVertical: 5,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#333333",
    marginTop: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default EmergencyButtonScreen;
