import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/emergencyButton.styles";

interface EmergencyInfoProps {
  location: any;
  hasPermissions: boolean;
  onRequestPermission: () => void;
}

export const EmergencyInfo: React.FC<EmergencyInfoProps> = ({
  location,
  hasPermissions,
  onRequestPermission,
}) => {
  return (
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
          onPress={onRequestPermission}
        >
          <Text style={styles.permissionButtonText}>
            Grant Audio Permission
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};