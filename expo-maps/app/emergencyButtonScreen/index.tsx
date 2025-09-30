import React, { useState } from "react";
import { View, Text } from "react-native";
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
import { styles } from "./styles/emergencyButton.styles";

const EmergencyButtonScreen = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

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

  // Handle emergency button press
  const handleEmergencyPress = async () => {
    setIsEmergencyActive(true);
    const recordingStarted = await startRecording();

    // If recording failed, send alert without audio
    if (!recordingStarted) {
      await sendEmergencyAlert({
        location,
        audioUri: null,
        getAddressFromCoords,
      });
    }
  };

  // Auto-send when recording finishes
  React.useEffect(() => {
    if (isEmergencyActive && !isRecording && recordingCountdown === 0) {
      handleStopRecordingAndSend();
    }
  }, [isRecording, recordingCountdown, isEmergencyActive]);

  const handleStopRecordingAndSend = async () => {
    const audioUri = await stopRecording();
    await sendEmergencyAlert({
      location,
      audioUri,
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

  const handlePlayAudio = () => {
    playRecordedAudio(recordedAudioUri);
  };

  const handleStopPlayback = () => {
    stopPlayback();
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

            <EmergencyButton
              onPress={handleEmergencyPress}
              blinkAnim={blinkAnim}
              pulseAnim={pulseAnim}
              isEmergencyActive={isEmergencyActive}
            />

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
    </SafeAreaView>
  );
};

export default EmergencyButtonScreen;