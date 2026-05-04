import AsyncStorage from "@react-native-async-storage/async-storage";

const VIBRATION_KEY = "KITE_RUSH_VIBRATION_ENABLED";

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