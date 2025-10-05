import { useState } from "react";
import { Alert, Platform } from "react-native";
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
    console.log("=== Sending Emergency Alert ===");
    console.log("Location:", location);
    console.log("Audio URI:", audioUri);
    console.log("Audio URI type:", typeof audioUri);
    console.log("Has audio:", !!audioUri);
    
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
        console.log("Adding audio to FormData...");
        
        // Get file extension from URI
        const uriParts = audioUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        // Create proper file object for React Native
        const audioFile = {
          uri: Platform.OS === 'ios' ? audioUri.replace('file://', '') : audioUri,
          type: `audio/${fileType === 'm4a' ? 'x-m4a' : fileType}`,
          name: `emergency_audio_${Date.now()}.${fileType}`,
        };

        console.log("Audio file object:", audioFile);
        
        formData.append("audio", audioFile as any);
        formData.append("hasAudio", "true");
      } else {
        console.log("No audio URI provided");
        formData.append("hasAudio", "false");
      }

      console.log("Sending request to server...");

      // Send to backend
      const response = await fetch("http://192.168.0.101:4000/api/alert/", {
        method: "POST",
        // headers: {
        //   'Content-Type': 'multipart/form-data',
        // },
        body: formData,
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log("Success response:", responseData);
        
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
        console.log("Error response:", errorData);
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