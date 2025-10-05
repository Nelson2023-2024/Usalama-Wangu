import React, { useState, useCallback } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmergencyButton } from "./components/EmergencyButton";
import { AudioPlayback } from "./components/AudioPlayback";
import { LocationDisplay } from "./components/LocationDisplay";
import { EmergencyInfo } from "./components/EmergencyInfo";
import { ActiveEmergencyView } from "./components/ActiveEmergencyView";
import { useAudioRecording } from "./hooks/useAudioRecording";
import { useAudioPlayback } from "./hooks/useAudioPlayback";
import { useLocation } from "./hooks/useLocation";
import { useEmergencyAlert } from "./hooks/useEmergencyAlert";
import { useAnimations } from "./hooks/useAnimations";
import { useShakeDetection } from "./hooks/useShakeDetection";
import { styles } from "./styles/emergencyButton.styles";

const EmergencyButtonScreen = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(true);

  // Custom hooks
  const {
    recording,
    isRecording,
    recordingCountdown,
    recordedAudioUri,
    hasPermissions,
    startRecording,
    stopRecording,
    resetRecording,
    requestPermission,
  } = useAudioRecording();

  const {
    isPlaying,
    playbackStatus,
    playRecordedAudio,
    stopPlayback,
    resetPlayback,
    formatPlaybackTime,
  } = useAudioPlayback();

  const { location, locationAddress, refreshLocation, getAddressFromCoords } =
    useLocation();

  const { isSending, sendEmergencyAlert } = useEmergencyAlert();

  const { blinkAnim, pulseAnim, recordingAnim } = useAnimations(isRecording);

  const handleEmergencyPress = async () => {
    setIsEmergencyActive(true);
    const recordingStarted = await startRecording();

    if (!recordingStarted) {
      await sendEmergencyAlert({
        location,
        audioUri: null,
        getAddressFromCoords,
      });
    }
  };

  const handleShake = useCallback(() => {
    if (isEmergencyActive || isSending) return;
    if (!shakeEnabled) return;

    Alert.alert(
      "Emergency Alert",
      "Shake detected! Activating emergency alert...",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send Alert", style: "destructive", onPress: handleEmergencyPress },
      ],
      { cancelable: false }
    );
  }, [isEmergencyActive, isSending, shakeEnabled]);

  useShakeDetection({
    onShake: handleShake,
    threshold: 3.5,
    timeout: 2000,
  });

  React.useEffect(() => {
    if (isEmergencyActive && !isRecording && recordingCountdown === 0) {
      handleStopRecordingAndSend();
    }
  }, [isRecording, recordingCountdown, isEmergencyActive]);

  const handleStopRecordingAndSend = async () => {
    const audioUri = await stopRecording();
    await sendEmergencyAlert({
      location,
      audioUri: audioUri || recordedAudioUri,
      getAddressFromCoords,
    });
  };

  const handleCancelEmergency = async () => {
    await resetRecording();
    resetEmergencyState();
  };

  const resetEmergencyState = async () => {
    setIsEmergencyActive(false);
    await resetRecording();
    await resetPlayback();
  };

  const handlePlayAudio = () => playRecordedAudio(recordedAudioUri);
  const handleStopPlayback = () => stopPlayback();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {!isEmergencyActive ? (
            <>
              <Text style={styles.title}>Emergency Safety Button</Text>
              <Text style={styles.subtitle}>
                Press button or shake phone in case of immediate danger{"\n"}
                Your location and 30-second audio will be sent to emergency contacts
              </Text>

              <EmergencyButton
                onPress={handleEmergencyPress}
                blinkAnim={blinkAnim}
                pulseAnim={pulseAnim}
                isEmergencyActive={isEmergencyActive}
              />

              <Text style={styles.shakeInfo}>
                📱 Shake Detection: {shakeEnabled ? "Enabled" : "Disabled"}
              </Text>

              <EmergencyInfo
                location={location}
                hasPermissions={hasPermissions}
                onRequestPermission={requestPermission}
              />

              <LocationDisplay
                location={location}
                locationAddress={locationAddress}
                onRefresh={refreshLocation}
              />

              <AudioPlayback
                recordedAudioUri={recordedAudioUri}
                isPlaying={isPlaying}
                playbackStatus={playbackStatus}
                onPlay={handlePlayAudio}
                onStop={handleStopPlayback}
                onClear={resetEmergencyState}
                formatPlaybackTime={formatPlaybackTime}
              />
            </>
          ) : (
            <ActiveEmergencyView
              isRecording={isRecording}
              isSending={isSending}
              recordingCountdown={recordingCountdown}
              recordedAudioUri={recordedAudioUri}
              recordingAnim={recordingAnim}
              onPlayAudio={handlePlayAudio}
              onCancel={handleCancelEmergency}
              onDone={resetEmergencyState}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmergencyButtonScreen;
