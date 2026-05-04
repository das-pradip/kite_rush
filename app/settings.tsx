import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import GameButton from "../src/components/GameButton";
import {
  getVibrationEnabled,
  saveVibrationEnabled,
} from "../src/storage/settingsStorage";
import { colors } from "../src/theme/colors";

export default function SettingsScreen() {
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const storedVibrationEnabled = await getVibrationEnabled();
      setIsVibrationEnabled(storedVibrationEnabled);
    }

    loadSettings();
  }, []);

  async function toggleVibration() {
    const nextValue = !isVibrationEnabled;
    setIsVibrationEnabled(nextValue);
    await saveVibrationEnabled(nextValue);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Vibration</Text>
            <Text style={styles.settingDescription}>
              Feel tap and game over feedback.
            </Text>
          </View>

          <Pressable
            onPress={toggleVibration}
            style={[
              styles.toggle,
              isVibrationEnabled ? styles.toggleOn : styles.toggleOff,
            ]}
          >
            <Text style={styles.toggleText}>
              {isVibrationEnabled ? "ON" : "OFF"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.note}>
          Sound effects and more controls will come in the next update.
        </Text>
      </View>

      <GameButton title="Back Home" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  title: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 24,
    marginBottom: 28,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },
  settingDescription: {
    color: colors.mutedText,
    fontSize: 14,
    maxWidth: 190,
    lineHeight: 20,
  },
  toggle: {
    minWidth: 74,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  toggleOn: {
    backgroundColor: colors.success,
  },
  toggleOff: {
    backgroundColor: colors.danger,
  },
  toggleText: {
    color: "#101820",
    fontSize: 15,
    fontWeight: "900",
  },
  note: {
    color: colors.mutedText,
    fontSize: 15,
    marginTop: 24,
    lineHeight: 22,
  },
});