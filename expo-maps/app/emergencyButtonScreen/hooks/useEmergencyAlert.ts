import { useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";

interface SendAlertParams {
  location: Location.LocationObjectCoords | null;
  audioUri: string | null;
  getAddressFromCoords: (lat: number, lng: number) => Promise<string>;
}

export const useEmergencyAlert = () => {
  const [isSending, setIsSending] = useState(false);

  const sendEmergencyAlert = async ({
    location,
    audioUri,
    getAddressFromCoords,
  }: SendAlertParams) => {
    setIsSending(true);

    try {
      const formData = new FormData();

      // Add location data
      if (location) {
        formData.append("latitude", location.latitude.toString());
        formData.append("longitude", location.longitude.toString());
        formData.append("accuracy", (location.accuracy || 0).toString());

        const address = await getAddressFromCoords(
          location.latitude,
          location.longitude
        );
        formData.append("address", address);
      }

      // Add alert metadata
      formData.append("timestamp", new Date().toISOString());
      formData.append("alertType", "emergency_panic_button");

      // Add audio file if available
      if (audioUri) {
        formData.append("audio", {
          uri: audioUri,
          type: "audio/m4a",
          name: "emergency_audio.m4a",
        } as any);
        formData.append("hasAudio", "true");
      } else {
        formData.append("hasAudio", "false");
      }

      // Send to backend
      const response = await fetch("http://192.168.0.101:4000/api/alert/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        Alert.alert(
          "Emergency Alert Sent",
          `Your emergency contacts have been notified and authorities are being alerted.${
            audioUri ? "\n\nYou can now play back the recorded audio." : ""
          }`,
          [
            {
              text: "OK",
              onPress: () => {
                setIsSending(false);
              },
            },
          ]
        );
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send emergency alert");
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
              console.log("Would call emergency services");
            },
          },
          {
            text: "Retry",
            onPress: () =>
              sendEmergencyAlert({ location, audioUri, getAddressFromCoords }),
          },
        ]
      );
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    sendEmergencyAlert,
  };
};