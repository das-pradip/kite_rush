import AsyncStorage from "@react-native-async-storage/async-storage";

const VIBRATION_KEY = "KITE_RUSH_VIBRATION_ENABLED";
const SOUND_KEY = "KITE_RUSH_SOUND_ENABLED";

export async function getVibrationEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(VIBRATION_KEY);

    if (value === null) {
      return true;
    }

    return value === "true";
  } catch {
    return true;
  }
}

export async function saveVibrationEnabled(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(VIBRATION_KEY, String(value));
  } catch {
    // Keep app running even if saving fails
  }
}

export async function getSoundEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(SOUND_KEY);

    if (value === null) {
      return true;
    }

    return value === "true";
  } catch {
    return true;
  }
}

export async function saveSoundEnabled(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SOUND_KEY, String(value));
  } catch {
    // Keep app running even if saving fails
  }
}