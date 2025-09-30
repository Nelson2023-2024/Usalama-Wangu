import type { Audio } from "expo-av";
import type * as Location from "expo-location";

export interface EmergencyState {
  isEmergencyActive: boolean;
  isSending: boolean;
  hasPermissions: boolean;
}

export interface RecordingState {
  recording: Audio.Recording | null;
  isRecording: boolean;
  recordingCountdown: number;
  recordedAudioUri: string | null;
}

export interface PlaybackState {
  sound: Audio.Sound | null;
  isPlaying: boolean;
  playbackStatus: any;
}

export interface LocationState {
  location: Location.LocationObjectCoords | null;
  locationAddress: string | null;
}

export interface EmergencyAlertPayload {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  timestamp: string;
  alertType: string;
  audioUri?: string | null;
  hasAudio: boolean;
}