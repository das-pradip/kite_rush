import AsyncStorage from "@react-native-async-storage/async-storage";

const BEST_SCORE_KEY = "KITE_RUSH_BEST_SCORE";

export async function getBestScore(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(BEST_SCORE_KEY);
    return value ? Number(value) : 0;
  } catch {
    return 0;
  }
}

export async function saveBestScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // Keep game running even if saving fails
  }
}