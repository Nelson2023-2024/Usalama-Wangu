import { useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";
import { Platform } from "react-native";

interface UseShakeDetectionProps {
  onShake: () => void;
  threshold?: number;
  timeout?: number;
}

export const useShakeDetection = ({
  onShake,
  threshold = 3.5, // Sensitivity: lower = more sensitive
  timeout = 1000, // Time between shake detection
}: UseShakeDetectionProps) => {
  const lastShakeRef = useRef<number>(0);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const setupShakeDetection = async () => {
      try {
        // Check if accelerometer is available
        const isAvailable = await Accelerometer.isAvailableAsync();
        
        if (!isAvailable) {
          console.log("Accelerometer not available on this device");
          return;
        }

        // Set update interval (100ms = 10 updates per second)
        Accelerometer.setUpdateInterval(100);

        // Subscribe to accelerometer updates
        subscriptionRef.current = Accelerometer.addListener(
          accelerometerData => {
            if (!isMounted) return;

            const { x, y, z } = accelerometerData;
            
            // Calculate total acceleration (magnitude of acceleration vector)
            const acceleration = Math.sqrt(x * x + y * y + z * z);
            
            // Remove gravity (1g ≈ 9.81 m/s²)
            const accelerationWithoutGravity = Math.abs(acceleration - 1);

            // Detect shake if acceleration exceeds threshold
            if (accelerationWithoutGravity > threshold) {
              const now = Date.now();
              
              // Prevent multiple triggers in quick succession
              if (now - lastShakeRef.current > timeout) {
                console.log("Shake detected!", accelerationWithoutGravity);
                lastShakeRef.current = now;
                onShake();
              }
            }
          }
        );
      } catch (error) {
        console.error("Error setting up shake detection:", error);
      }
    };

    setupShakeDetection();

    // Cleanup
    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [onShake, threshold, timeout]);

  return {
    // Can expose methods to enable/disable if needed
  };
};